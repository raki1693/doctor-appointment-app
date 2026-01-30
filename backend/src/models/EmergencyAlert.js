import mongoose from "mongoose";

const EmergencyAlertSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emergencyRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "EmergencyRequest" },

    // Snapshot fields (so alert still makes sense if profile changes)
    patientName: { type: String, default: "" },
    patientPhone: { type: String, default: "" },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      accuracy: { type: Number },
      note: { type: String, default: "" },
    },

    message: { type: String, default: "" },

    acknowledgedAt: { type: Date },
  },
  { timestamps: true }
);

export const EmergencyAlert = mongoose.model("EmergencyAlert", EmergencyAlertSchema);
