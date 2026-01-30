import { Router } from "express";
import { requireAuth, requireDoctor } from "../middleware/auth.js";
import { Appointment } from "../models/Appointment.js";
import { User } from "../models/User.js";
import { Doctor } from "../models/Doctor.js";
import { Prescription } from "../models/Prescription.js";
import { PharmacyOrder } from "../models/PharmacyOrder.js";
import { TokenCounter } from "../models/TokenCounter.js";
import { httpError } from "../utils/httpError.js";
import { sendWhatsAppAdminAlert } from "../services/whatsapp.service.js";

const router = Router();

function yyyymmdd(dateStr) {
  return (dateStr || "").toString().replaceAll("-", "");
}

function tokenNumber(token) {
  const last = (token || "").toString().trim().split("-").pop() || "";
  const n = Number(last);
  return Number.isFinite(n) ? n : 0;
}

async function pickNextBookedTokenNumber(dateStr, afterNum) {
  const dateKey = yyyymmdd(dateStr);
  const booked = await Appointment.find({
    date: dateStr,
    status: "booked",
    paymentStatus: "paid",
    token: { $regex: `^OPD-${dateKey}-` },
  })
    .select("token")
    .lean();

  let next = null;
  for (const a of booked) {
    const n = tokenNumber(a.token);
    if (n > afterNum && (next === null || n < next)) next = n;
  }
  return next;
}

// When a doctor marks consultation completed, automatically advance the running token counter.
async function advanceRunningTokenOnComplete(dateStr, completedNum) {
  const dateKey = yyyymmdd(dateStr);

  const counter = await TokenCounter.findOne({ date: dateKey }).lean();
  const current = Number(counter?.current || 0);
  const seq = Number(counter?.seq || 0);

  const nextBooked = await pickNextBookedTokenNumber(dateStr, completedNum);

  let newCurrent = current;
  // Only move forward (never backwards)
  if (current === 0 || current <= completedNum) {
    if (nextBooked !== null) newCurrent = nextBooked;
    else if (completedNum < seq) newCurrent = completedNum + 1; // fallback (issued token exists, but may be cancelled)
    else newCurrent = completedNum; // end-of-queue
  }

  const updated = await TokenCounter.findOneAndUpdate(
    { date: dateKey },
    { $set: { current: newCurrent } },
    { upsert: true, new: true }
  );

  return updated;
}


/**
 * Doctor dashboard - list my appointments
 * Doctors are linked by email to Doctor catalog (Doctor.email)
 */
async function resolveDoctorCatalog(req) {
  const doctorUser = req.user;
  const doctorCatalog = await Doctor.findOne({ email: doctorUser.email });
  if (!doctorCatalog) return null;
  return doctorCatalog;
}

router.get("/me/appointments", requireAuth, requireDoctor, async (req, res, next) => {
  try {
    const doctorCatalog = await resolveDoctorCatalog(req);
    if (!doctorCatalog) return next(httpError(404, "Doctor profile not configured (admin must add doctor with same email)"));

    const items = await Appointment.find({ doctorId: doctorCatalog._id })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ appointments: items, doctor: doctorCatalog });
  } catch (err) {
    next(err);
  }
});

router.get("/token/:token", requireAuth, requireDoctor, async (req, res, next) => {
  try {
    const token = (req.params.token || "").toString().trim();
    if (!token) return next(httpError(400, "Token required"));

    const doctorCatalog = await resolveDoctorCatalog(req);
    if (!doctorCatalog) return next(httpError(404, "Doctor profile not configured"));

    const appt = await Appointment.findOne({ token, doctorId: doctorCatalog._id })
      .populate("userId", "name email phone address")
      .populate("doctorId");

    if (!appt) return next(httpError(404, "Token not found"));

    res.json({ appointment: appt });
  } catch (err) {
    next(err);
  }
});


// Mark consultation as completed (by token) and auto-advance running token counter
router.post("/token/:token/complete", requireAuth, requireDoctor, async (req, res, next) => {
  try {
    const token = (req.params.token || "").toString().trim();
    if (!token) return next(httpError(400, "Token required"));

    const doctorCatalog = await resolveDoctorCatalog(req);
    if (!doctorCatalog) return next(httpError(404, "Doctor profile not configured"));

    const appt = await Appointment.findOne({ token, doctorId: doctorCatalog._id });
    if (!appt) return next(httpError(404, "Token not found"));
    if (!appt.token) return next(httpError(400, "This appointment has no token"));
    if (appt.status === "cancelled") return next(httpError(400, "Cannot complete a cancelled appointment"));
    if (appt.paymentStatus !== "paid") return next(httpError(400, "Payment not completed"));

    if (appt.status !== "completed") {
      appt.status = "completed";
      await appt.save();
    }

    const completedNum = tokenNumber(appt.token);
    const counter = await advanceRunningTokenOnComplete(appt.date, completedNum);

    res.json({
      appointment: appt,
      tokenCounter: { date: counter.date, current: counter.current, seq: counter.seq },
    });
  } catch (err) {
    next(err);
  }
});

// Mark consultation as completed (by appointment id) and auto-advance running token counter
router.post("/appointments/:id/complete", requireAuth, requireDoctor, async (req, res, next) => {
  try {
    const doctorCatalog = await resolveDoctorCatalog(req);
    if (!doctorCatalog) return next(httpError(404, "Doctor profile not configured"));

    const appt = await Appointment.findOne({ _id: req.params.id, doctorId: doctorCatalog._id });
    if (!appt) return next(httpError(404, "Appointment not found"));
    if (!appt.token) return next(httpError(400, "This appointment has no token"));
    if (appt.status === "cancelled") return next(httpError(400, "Cannot complete a cancelled appointment"));
    if (appt.paymentStatus !== "paid") return next(httpError(400, "Payment not completed"));

    if (appt.status !== "completed") {
      appt.status = "completed";
      await appt.save();
    }

    const completedNum = tokenNumber(appt.token);
    const counter = await advanceRunningTokenOnComplete(appt.date, completedNum);

    res.json({
      appointment: appt,
      tokenCounter: { date: counter.date, current: counter.current, seq: counter.seq },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/prescriptions", requireAuth, requireDoctor, async (req, res, next) => {
  try {
    const { token, diagnosis, medicines, instructions, sendToPharmacy = true } = req.body;

    if (!token) return next(httpError(400, "token required"));
    if (!Array.isArray(medicines) || medicines.length === 0) return next(httpError(400, "medicines required"));

    const doctorCatalog = await resolveDoctorCatalog(req);
    if (!doctorCatalog) return next(httpError(404, "Doctor profile not configured"));

    const appt = await Appointment.findOne({ token, doctorId: doctorCatalog._id }).populate("userId", "name email phone");
    if (!appt) return next(httpError(404, "Appointment not found for this token"));

    const prescription = await Prescription.create({
      appointmentId: appt._id,
      patientId: appt.userId._id,
      doctorId: req.user._id,
      doctorProfileId: doctorCatalog._id,
      token: appt.token,
      diagnosis: diagnosis || "",
      medicines,
      instructions: instructions || "",
      sendToPharmacy: !!sendToPharmacy,
      status: sendToPharmacy ? "sent_to_pharmacy" : "created",
    });

    let pharmacyOrder = null;
    if (sendToPharmacy) {
      pharmacyOrder = await PharmacyOrder.create({
        prescriptionId: prescription._id,
        appointmentId: appt._id,
        patientId: appt.userId._id,
        token: appt.token,
        status: "new",
        paymentMode: "counter",
      });

      // Optional WhatsApp alert (configure env to enable)
      await sendWhatsAppAdminAlert(
        `New Prescription (Token: ${appt.token}) for ${appt.userId.name}. Please prepare medicines at pharmacy counter.`
      );
    }

    res.status(201).json({ prescription, pharmacyOrder });
  } catch (err) {
    next(err);
  }
});



// Doctor availability (calendar settings)
router.get("/me/availability", requireAuth, requireDoctor, async (req, res, next) => {
  try {
    const doctorCatalog = await resolveDoctorCatalog(req);
    if (!doctorCatalog) return next(httpError(404, "Doctor profile not configured"));
    res.json({
      availableDays: doctorCatalog.availableDays || [],
      availableSlots: doctorCatalog.availableSlots || [],
      slotDurationMinutes: doctorCatalog.slotDurationMinutes || 10,
      leaveDates: doctorCatalog.leaveDates || [],
    });
  } catch (e) {
    next(e);
  }
});

router.put("/me/availability", requireAuth, requireDoctor, async (req, res, next) => {
  try {
    const doctorCatalog = await resolveDoctorCatalog(req);
    if (!doctorCatalog) return next(httpError(404, "Doctor profile not configured"));
    const { availableDays, availableSlots, slotDurationMinutes, leaveDates } = req.body || {};
    if (availableDays) doctorCatalog.availableDays = availableDays;
    if (availableSlots) doctorCatalog.availableSlots = availableSlots;
    if (slotDurationMinutes) doctorCatalog.slotDurationMinutes = Number(slotDurationMinutes);
    if (leaveDates) doctorCatalog.leaveDates = leaveDates;
    await doctorCatalog.save();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Current running token (doctor view)
router.get("/current-token", requireAuth, requireDoctor, async (req, res, next) => {
  try {
    const date = (req.query.date || "").toString().trim(); // YYYY-MM-DD
    if (!date) return next(httpError(400, "date required (YYYY-MM-DD)"));
    const key = date.replaceAll("-", "");
    const doc = await TokenCounter.findOne({ date: key });
    res.json({ date: key, current: doc?.current || 0, lastIssued: doc?.seq || 0 });
  } catch (e) {
    next(e);
  }
});

export default router;
