import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // doctor user account
    doctorProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true }, // catalog doctor
    token: { type: String, default: "" },

    diagnosis: { type: String, default: "" },
    medicines: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        dosage: { type: String, default: "" },
        frequency: { type: String, default: "" },
        duration: { type: String, default: "" },
        notes: { type: String, default: "" },
      },
    ],
    instructions: { type: String, default: "" },

    sendToPharmacy: { type: Boolean, default: true },
    status: { type: String, enum: ["created", "sent_to_pharmacy"], default: "created" },
  },
  { timestamps: true }
);

export const Prescription = mongoose.model("Prescription", PrescriptionSchema);
