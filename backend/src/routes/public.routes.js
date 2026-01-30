import express from "express";
import { Announcement } from "../models/Announcement.js";
import { Holiday } from "../models/Holiday.js";

const router = express.Router();

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isDateInRange(date, from, to) {
  // Dates are YYYY-MM-DD so lexicographic comparison works
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

// Public: active announcements for a date
router.get("/announcements", async (req, res) => {
  const date = String(req.query.date || "").trim() || todayISO();

  // Sort by updatedAt so edits by admin appear as "new" to users.
  const items = await Announcement.find({ isActive: true }).sort({ updatedAt: -1, createdAt: -1 });
  const active = items.filter((a) => isDateInRange(date, a.activeFrom || "", a.activeTo || ""));

  res.json(active);
});

// Public: holidays for a date range
router.get("/holidays", async (req, res) => {
  const from = String(req.query.from || "").trim() || todayISO();
  const days = Math.max(1, Math.min(30, Number(req.query.days || 7)));

  const end = new Date(from);
  end.setDate(end.getDate() + days);
  const to = end.toISOString().slice(0, 10);

  const items = await Holiday.find({ date: { $gte: from, $lte: to } }).sort({ date: 1 });
  res.json(items);
});

// Public: a combined ticker payload (used on login + top bar)
router.get("/ticker", async (req, res) => {
  const date = String(req.query.date || "").trim() || todayISO();

  const days = Math.max(0, Math.min(30, Number(req.query.days || 7)));
  const end = new Date(date);
  end.setDate(end.getDate() + days);
  const to = end.toISOString().slice(0, 10);

  const [announcementsAll, holidays] = await Promise.all([
    Announcement.find({ isActive: true }).sort({ updatedAt: -1, createdAt: -1 }),
    Holiday.find({ date: { $gte: date, $lte: to } }).sort({ date: 1 }),
  ]);

  const announcements = announcementsAll.filter((a) => isDateInRange(date, a.activeFrom || "", a.activeTo || ""));

  const messages = [];
  for (const h of holidays) {
    const status = h.isClosed ? "Hospital Closed" : "Partial";
    messages.push(`HOLIDAY: ${h.name} (${h.date}) • ${status}`);
  }
  for (const a of announcements) {
    const title = (a.title || "Notice").trim();
    const msg = (a.message || "").trim();
    messages.push(`${title}: ${msg}`);
  }

  res.json({ date, holidays, announcements, messages });
});

export default router;
