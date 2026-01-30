import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Appointment } from "../models/Appointment.js";
import { Doctor } from "../models/Doctor.js";
import { TokenCounter } from "../models/TokenCounter.js";
import { createAppointmentSchema } from "../validation/appointment.validation.js";
import { httpError } from "../utils/httpError.js";
import { getRazorpayClient, verifyRazorpaySignature } from "../services/razorpay.service.js";

const router = Router();

function yyyymmdd(dateStr) {
  // input: YYYY-MM-DD
  return dateStr.replaceAll("-", "");
}

async function generateToken(dateStr) {
  const key = yyyymmdd(dateStr);
  const doc = await TokenCounter.findOneAndUpdate(
    { date: key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  const seq = String(doc.seq).padStart(4, "0");
  return `OPD-${key}-${seq}`;
}

// Patient: list my appointments
router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const items = await Appointment.find({ userId: req.user._id })
      .populate("doctorId")
      .sort({ createdAt: -1 });
    res.json({ appointments: items });
  } catch (err) {
    next(err);
  }
});

/**
 * Step 1: Create appointment (pending payment) + razorpay order
 * body: { doctorId, date, slot, notes }
 */
router.post("/create", requireAuth, async (req, res, next) => {
  try {
    const data = createAppointmentSchema.parse(req.body);
    const doctor = await Doctor.findById(data.doctorId);
    if (!doctor) return next(httpError(404, "Doctor not found"));

    // prevent booking same slot (only for booked or pending_payment)
    const existing = await Appointment.findOne({
      doctorId: data.doctorId,
      date: data.date,
      slot: data.slot,
      status: { $in: ["pending_payment", "booked"] },
    });
    if (existing) return next(httpError(409, "This slot is already reserved"));

    const opdRegFee = Number(process.env.OPD_REG_FEE || 0); // user requested 0 by default
    const amount = Number(doctor.fee || 0) + opdRegFee;

    const appt = await Appointment.create({
      userId: req.user._id,
      doctorId: data.doctorId,
      date: data.date,
      slot: data.slot,
      notes: data.notes || "",
      amount,
      status: "pending_payment",
      paymentStatus: "pending",
    });

    const client = getRazorpayClient();
    const rpOrder = await client.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `appt_${appt._id}`,
    });

    appt.razorpay.orderId = rpOrder.id;
    await appt.save();

    res.status(201).json({
      appointment: appt,
      razorpay: { keyId: process.env.RAZORPAY_KEY_ID, orderId: rpOrder.id, amount: rpOrder.amount, currency: rpOrder.currency },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Step 2: Verify appointment payment
 * body: { appointmentId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
router.post("/verify", requireAuth, async (req, res, next) => {
  try {
    const { appointmentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!appointmentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return next(httpError(400, "Missing verify fields"));
    }

    const appt = await Appointment.findOne({ _id: appointmentId, userId: req.user._id });
    if (!appt) return next(httpError(404, "Appointment not found"));
    if (appt.razorpay.orderId !== razorpayOrderId) return next(httpError(400, "Razorpay order mismatch"));

    const ok = verifyRazorpaySignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature });
    if (!ok) {
      appt.paymentStatus = "failed";
      await appt.save();
      return next(httpError(400, "Payment verification failed"));
    }

    appt.paymentStatus = "paid";
    appt.status = "booked";
    appt.razorpay.paymentId = razorpayPaymentId;

    if (!appt.token) {
      appt.token = await generateToken(appt.date);
    }

    await appt.save();
    res.json({ appointment: appt });
  } catch (err) {
    next(err);
  }
});

/**
 * Cancel appointment with refund option
 * body: { refundMethod: "online" | "cash" }
 */
router.post("/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    const appt = await Appointment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!appt) return next(httpError(404, "Appointment not found"));

    const { refundMethod } = req.body || {};
    const method = (refundMethod || "").toString();

    // cancellation policy
    const cutoffHours = Number(process.env.CANCEL_WINDOW_HOURS || 2);
    const apptDateTime = new Date(`${appt.date}T${appt.slot}:00`);
    const now = new Date();
    const diffMs = apptDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (method === "online" && diffHours < cutoffHours) {
      return next(httpError(400, `Online refund allowed only before ${cutoffHours} hours. Please choose cash at reception.`));
    }

    appt.status = "cancelled";
    appt.refundMethod = method === "online" ? "online" : "cash";

    if (appt.paymentStatus === "paid") {
      if (appt.refundMethod === "online") {
        // attempt razorpay refund (best-effort)
        try {
          const client = getRazorpayClient();
          if (!appt.razorpay.paymentId) throw new Error("Missing paymentId");
          await client.payments.refund(appt.razorpay.paymentId, { amount: Math.round(appt.amount * 100) });
          appt.paymentStatus = "refunded";
          appt.refundStatus = "processed";
        } catch {
          appt.refundStatus = "requested";
        }
      } else {
        appt.refundStatus = "pending_cash";
      }
    }

    await appt.save();
    res.json({ appointment: appt });
  } catch (err) {
    next(err);
  }
});



// Current running token display (for patient/home)
router.get("/current-token", requireAuth, async (req, res, next) => {
  try {
    const date = (req.query.date || "").toString().trim(); // YYYY-MM-DD
    if (!date) return next(httpError(400, "date required (YYYY-MM-DD)"));
    const key = yyyymmdd(date);
    const doc = await TokenCounter.findOne({ date: key });
    res.json({ date: key, current: doc?.current || 0, lastIssued: doc?.seq || 0 });
  } catch (e) {
    next(e);
  }
});

export default router;
