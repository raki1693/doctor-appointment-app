import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { createOrderSchema } from "../validation/order.validation.js";
import { httpError } from "../utils/httpError.js";

const router = Router();

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = createOrderSchema.parse(req.body);

    const productIds = data.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const productsById = new Map(products.map((p) => [p._id.toString(), p]));
    const itemsExpanded = data.items.map((i) => {
      const p = productsById.get(i.productId);
      if (!p) throw httpError(400, "Invalid product in cart");
      if (!p.inStock) throw httpError(409, `${p.name} is out of stock`);
      return {
        productId: p._id,
        name: p.name,
        price: p.price,
        qty: i.qty,
        imageUrl: p.imageUrl,
      };
    });

    const subtotal = itemsExpanded.reduce((sum, it) => sum + it.price * it.qty, 0);

    const order = await Order.create({
      userId: req.user._id,
      items: itemsExpanded,
      subtotal,
      shippingAddress: data.shippingAddress,
      paymentStatus: "pending",
      fulfillmentStatus: "created",
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return next(httpError(404, "Order not found"));
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

export default router;
