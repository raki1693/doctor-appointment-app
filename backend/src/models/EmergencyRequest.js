import mongoose from "mongoose";

const EmergencyRequestSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["ambulance"], default: "ambulance" },

    // Optional link to a registered patient
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Optional contact info (user might not be logged in)
    name: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },

    // Location from browser (best-effort)
    location: {
      lat: { type: Number },
      lng: { type: Number },
      accuracy: { type: Number },
      note: { type: String, default: "" },
    },

    status: {
      type: String,
      enum: ["new", "dispatched", "resolved", "cancelled"],
      default: "new",
    },

    // Diagnostics
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

export const EmergencyRequest = mongoose.model("EmergencyRequest", EmergencyRequestSchema);
