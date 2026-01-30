import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },

    date: { type: String, required: true }, // YYYY-MM-DD
    slot: { type: String, required: true }, // HH:mm
    notes: { type: String, default: "" },

    // Gov hospital OPD token: OPD-YYYYMMDD-0001
    token: { type: String, default: "" },

    // Appointment lifecycle
    status: {
      type: String,
      enum: ["pending_payment", "booked", "cancelled", "completed"],
      default: "pending_payment",
    },

    // Payment info for appointments
    amount: { type: Number, required: true, default: 0 }, // INR
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    razorpay: {
      orderId: { type: String, default: "" },
      paymentId: { type: String, default: "" },
    },

    // Refund handling
    refundMethod: { type: String, enum: ["", "online", "cash"], default: "" },
    refundStatus: {
      type: String,
      enum: ["none", "requested", "pending_cash", "processed", "failed"],
      default: "none",
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", AppointmentSchema);
