import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { Product } from "../models/Product.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const q = (req.query.q || "").toString().trim();
    const category = (req.query.category || "").toString().trim();

    const filter = {};
    if (q) {
      filter.$or = [{ name: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }];
    }
    if (category) filter.category = category;

    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(500);
    const categories = await Product.distinct("category");
    res.json({ products, categories });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

// Admin
router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

export default router;
