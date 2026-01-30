import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Simple FAQ chatbot (extend later)
const FAQ = [
  { q: "book appointment", a: "Go to Doctors → select doctor → choose date & slot → Book." },
  { q: "order medicines", a: "Go to Medicines → add items to Cart → Checkout → Pay with Razorpay." },
  { q: "cancel appointment", a: "Open My Appointments → select appointment → Cancel." },
  { q: "order status", a: "Open My Orders to track packing/shipping/delivery status." },
];

router.post("/ask", requireAuth, async (req, res) => {
  const text = (req.body?.text || "").toString().toLowerCase().trim();
  const hit = FAQ.find((x) => text.includes(x.q));
  res.json({ reply: hit ? hit.a : "I can help with appointments, medicines, payments, and orders. Try: 'book appointment'." });
});

export default router;
