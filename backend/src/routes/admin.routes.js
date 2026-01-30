import express from "express";
import bcrypt from "bcryptjs";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { httpError } from "../utils/httpError.js";

import { User } from "../models/User.js";
import { Doctor } from "../models/Doctor.js";
import { Appointment } from "../models/Appointment.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { Department } from "../models/Department.js";
import { Holiday } from "../models/Holiday.js";
import { Announcement } from "../models/Announcement.js";
import { PharmacyOrder } from "../models/PharmacyOrder.js";
import { TokenCounter } from "../models/TokenCounter.js";
import PDFDocument from "pdfkit";

const router = express.Router();

router.use(requireAuth, requireAdmin);

// Summary counts
router.get("/summary", async (_req, res) => {
  const [users, doctors, appointments, orders, pharmacyOrders, products] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Doctor.countDocuments(),
    Appointment.countDocuments(),
    Order.countDocuments(),
    PharmacyOrder.countDocuments(),
    Product.countDocuments(),
  ]);

  res.json({ users, doctors, appointments, orders, products, pharmacyOrders });
});

// Departments
router.get("/departments", async (_req, res) => {
  const items = await Department.find().sort({ name: 1 });
  res.json(items);
});

router.post("/departments", async (req, res, next) => {
  try {
    const { name, code = "", description = "", isActive = true } = req.body;
    if (!name) return next(httpError(400, "name required"));
    const created = await Department.create({ name, code, description, isActive });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.put("/departments/:id", async (req, res, next) => {
  try {
    const updated = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return next(httpError(404, "Not found"));
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/departments/:id", async (req, res, next) => {
  try {
    const deleted = await Department.findByIdAndDelete(req.params.id);
    if (!deleted) return next(httpError(404, "Not found"));
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Holidays
router.get("/holidays", async (_req, res) => {
  const items = await Holiday.find().sort({ date: 1 });
  res.json(items);
});

router.post("/holidays", async (req, res, next) => {
  try {
    const { date, name, isClosed = true } = req.body;
    if (!date || !name) return next(httpError(400, "date and name required"));
    const created = await Holiday.create({ date, name, isClosed });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.put("/holidays/:id", async (req, res, next) => {
  try {
    // Use doc.save() so timestamps (updatedAt) are reliably refreshed.
    const doc = await Holiday.findById(req.params.id);
    if (!doc) return next(httpError(404, "Not found"));
    Object.assign(doc, req.body);
    await doc.save();
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

router.delete("/holidays/:id", async (req, res, next) => {
  try {
    const deleted = await Holiday.findByIdAndDelete(req.params.id);
    if (!deleted) return next(httpError(404, "Not found"));
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Announcements
router.get("/announcements", async (_req, res) => {
  const items = await Announcement.find().sort({ createdAt: -1 });
  res.json(items);
});

router.post("/announcements", async (req, res, next) => {
  try {
    const { title, message, activeFrom = "", activeTo = "", isActive = true } = req.body;
    if (!title || !message) return next(httpError(400, "title and message required"));
    const created = await Announcement.create({ title, message, activeFrom, activeTo, isActive });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.put("/announcements/:id", async (req, res, next) => {
  try {
    // Use doc.save() so timestamps (updatedAt) are reliably refreshed.
    const doc = await Announcement.findById(req.params.id);
    if (!doc) return next(httpError(404, "Not found"));
    Object.assign(doc, req.body);
    await doc.save();
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

router.delete("/announcements/:id", async (req, res, next) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return next(httpError(404, "Not found"));
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Doctors (creates login user + doctor profile)
router.get("/doctors", async (_req, res) => {
  const docs = await Doctor.find().sort({ createdAt: -1 });
  res.json(docs);
});

router.post("/doctors", async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password = "Doctor@123",
      specialization = "",
      fee = 0,
      department = "",
      timings = "",
      imageUrl = "",
    } = req.body;

    if (!name || !email || !phone) return next(httpError(400, "name, email, phone required"));

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return next(httpError(400, "Email already exists"));

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, passwordHash, role: "doctor" });
    const doctor = await Doctor.create({
      userId: user._id,
      name,
      specialization,
      fee,
      department,
      timings,
      imageUrl,
      email,
      phone,
    });

    res.status(201).json({ user, doctor });
  } catch (e) {
    next(e);
  }
});

router.delete("/doctors/:id", async (req, res, next) => {
  try {
    const doc = await Doctor.findById(req.params.id);
    if (!doc) return next(httpError(404, "Not found"));
    await User.deleteOne({ _id: doc.userId });
    await Doctor.deleteOne({ _id: doc._id });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Products (medicines)
router.get("/products", async (_req, res) => {
  const items = await Product.find().sort({ createdAt: -1 });
  res.json(items);
});

router.post("/products", async (req, res, next) => {
  try {
    const created = await Product.create(req.body);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.put("/products/:id", async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return next(httpError(404, "Not found"));
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return next(httpError(404, "Not found"));
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Appointments list
router.get("/appointments", async (_req, res) => {
  const items = await Appointment.find().sort({ createdAt: -1 }).limit(500);
  res.json(items);
});

// Pharmacy Orders
router.get("/pharmacy-orders", async (_req, res) => {
  const items = await PharmacyOrder.find().sort({ createdAt: -1 }).limit(500);
  res.json(items);
});

router.put("/pharmacy-orders/:id", async (req, res, next) => {
  try {
    const updated = await PharmacyOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return next(httpError(404, "Not found"));
    res.json(updated);
  } catch (e) {
    next(e);
  }
});



// Token running display (admin set + view)
router.get("/token/current", async (req, res, next) => {
  try {
    const date = (req.query.date || "").toString().trim(); // YYYY-MM-DD
    if (!date) return next(httpError(400, "date required (YYYY-MM-DD)"));
    const key = date.replaceAll("-", "");
    const doc = await TokenCounter.findOne({ date: key });
    res.json({ date: key, seq: doc?.seq || 0, current: doc?.current || 0 });
  } catch (e) {
    next(e);
  }
});

router.put("/token/current", async (req, res, next) => {
  try {
    const { date, current } = req.body || {};
    if (!date) return next(httpError(400, "date required (YYYY-MM-DD)"));
    const key = date.toString().replaceAll("-", "");
    const cur = Number(current || 0);
    const doc = await TokenCounter.findOneAndUpdate(
      { date: key },
      { $set: { current: cur } },
      { upsert: true, new: true }
    );
    res.json({ date: doc.date, seq: doc.seq, current: doc.current });
  } catch (e) {
    next(e);
  }
});

// Reports export (CSV/PDF)
router.get("/reports/appointments", async (req, res, next) => {
  try {
    const from = (req.query.from || "").toString().trim();
    const to = (req.query.to || "").toString().trim();
    const format = (req.query.format || "csv").toString().toLowerCase();

    if (!from || !to) return next(httpError(400, "from and to are required (YYYY-MM-DD)"));

    const items = await Appointment.find({ date: { $gte: from, $lte: to } })
      .populate("doctorId")
      .populate("userId", "name email phone")
      .sort({ date: 1, slot: 1 });

    const rows = items.map((a) => ({
      token: a.token || "",
      date: a.date || "",
      slot: a.slot || "",
      doctor: a.doctorId?.name || "",
      patient: a.userId?.name || "",
      phone: a.userId?.phone || "",
      status: a.status || "",
      paymentStatus: a.paymentStatus || "",
      amount: a.amount ?? "",
      refundStatus: a.refundStatus || "",
      refundMethod: a.refundMethod || "",
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : "",
    }));

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="appointments_${from}_to_${to}.pdf"`);

      const doc = new PDFDocument({ margin: 30, size: "A4" });
      doc.pipe(res);

      doc.fontSize(16).text("Appointments Report", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`From: ${from}  To: ${to}`);
      doc.moveDown(1);

      // simple table-like layout
      const headers = ["Token", "Date", "Slot", "Doctor", "Patient", "Status", "Payment"];
      doc.fontSize(10).text(headers.join(" | "));
      doc.moveDown(0.3);
      doc.text("-".repeat(110));
      doc.moveDown(0.3);

      rows.forEach((r) => {
        const line = [
          r.token,
          r.date,
          r.slot,
          (r.doctor || "").slice(0, 18),
          (r.patient || "").slice(0, 18),
          r.status,
          r.paymentStatus,
        ].join(" | ");
        doc.text(line);
      });

      doc.end();
      return;
    }

    // CSV default
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="appointments_${from}_to_${to}.csv"`);

    const header = Object.keys(rows[0] || { token: "" }).join(",");
    const csv = [
      header,
      ...rows.map((r) =>
        Object.values(r)
          .map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`)
          .join(",")
      ),
    ].join("\n");

    res.send(csv);
  } catch (e) {
    next(e);
  }
});

export default router;
