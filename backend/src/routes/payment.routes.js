import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { httpError } from "../utils/httpError.js";
import { getRazorpayClient, verifyRazorpaySignature } from "../services/razorpay.service.js";
import { sendWhatsAppAdminAlert } from "../services/whatsapp.service.js";

const router = Router();

router.post("/razorpay/create-order", requireAuth, async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return next(httpError(400, "orderId required"));

    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) return next(httpError(404, "Order not found"));

    const client = getRazorpayClient();
    const rpOrder = await client.orders.create({
      amount: Math.round(order.subtotal * 100), // INR paise
      currency: "INR",
      receipt: `rcpt_${order._id}`,
    });

    order.razorpay.orderId = rpOrder.id;
    await order.save();

    res.json({
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // safe to send key_id to client
    });
  } catch (err) {
    next(err);
  }
});

router.post("/razorpay/verify", requireAuth, async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return next(httpError(400, "Missing verify fields"));
    }

    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) return next(httpError(404, "Order not found"));
    if (order.razorpay.orderId !== razorpayOrderId) return next(httpError(400, "Razorpay order mismatch"));

    const ok = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!ok) {
      order.paymentStatus = "failed";
      await order.save();
      return next(httpError(400, "Payment verification failed"));
    }

    order.paymentStatus = "paid";
    order.razorpay.paymentId = razorpayPaymentId;
    order.razorpay.signature = razorpaySignature;
    await order.save();

    // Optional WhatsApp admin alert (if configured)
    await sendWhatsAppAdminAlert(
      `New order paid ✅\nOrder: ${order._id}\nAmount: ₹${order.subtotal}\nUser: ${req.user.name} (${req.user.phone})`
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
