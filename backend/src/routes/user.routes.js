import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Prescription } from "../models/Prescription.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "address", "emergencyContacts"];
    for (const key of Object.keys(req.body)) {
      if (!allowed.includes(key)) delete req.body[key];
    }

    // Sanitize emergencyContacts (max 3)
    if ("emergencyContacts" in req.body) {
      const raw = Array.isArray(req.body.emergencyContacts) ? req.body.emergencyContacts : [];
      req.body.emergencyContacts = raw
        .slice(0, 3)
        .map((c) => ({
          name: String(c?.name || "").trim().slice(0, 50),
          relation: String(c?.relation || "").trim().slice(0, 50),
          phone: String(c?.phone || "").trim().slice(0, 30),
        }))
        .filter((c) => c.phone);
    }

    const updated = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select("-passwordHash");
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});



router.get("/prescriptions", requireAuth, async (req, res, next) => {
  try {
    const items = await Prescription.find({ patientId: req.user._id }).sort({ createdAt: -1 }).limit(200);
    res.json({ prescriptions: items });
  } catch (err) {
    next(err);
  }
});

router.get("/prescriptions/:id", requireAuth, async (req, res, next) => {
  try {
    const item = await Prescription.findOne({ _id: req.params.id, patientId: req.user._id });
    if (!item) return res.status(404).json({ message: "Prescription not found" });
    res.json({ prescription: item });
  } catch (err) {
    next(err);
  }
});

export default router;
