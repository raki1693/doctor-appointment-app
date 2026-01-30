import { Router } from "express";
import { Doctor } from "../models/Doctor.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public list (requires login to match hospital portals)
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const q = (req.query.q || "").toString().trim();
    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { specialty: { $regex: q, $options: "i" } },
            { hospital: { $regex: q, $options: "i" } },
          ],
        }
      : {};
    const doctors = await Doctor.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ doctors });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ doctor });
  } catch (err) {
    next(err);
  }
});

// Admin: create/update
router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ doctor });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ doctor });
  } catch (err) {
    next(err);
  }
});

export default router;
