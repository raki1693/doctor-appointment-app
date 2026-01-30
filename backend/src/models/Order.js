import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, min: 1 },
        imageUrl: { type: String, default: "" },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    fulfillmentStatus: {
      type: String,
      enum: ["created", "packed", "shipped", "delivered", "cancelled"],
      default: "created",
    },
    razorpay: {
      orderId: { type: String, default: "" },
      paymentId: { type: String, default: "" },
      signature: { type: String, default: "" },
    },
    shippingAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", OrderSchema);
