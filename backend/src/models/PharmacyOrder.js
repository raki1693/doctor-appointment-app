import mongoose from "mongoose";

const PharmacyOrderSchema = new mongoose.Schema(
  {
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, default: "" },

    status: { type: String, enum: ["new", "prepared", "dispensed", "cancelled"], default: "new" },
    paymentMode: { type: String, enum: ["counter", "online"], default: "counter" }, // gov style: counter
  },
  { timestamps: true }
);

export const PharmacyOrder = mongoose.model("PharmacyOrder", PharmacyOrderSchema);
