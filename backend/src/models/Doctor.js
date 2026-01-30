import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    hospital: { type: String, required: true, trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    fee: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    availableDays: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    availableSlots: { type: [String], default: ["10:00", "11:00", "12:00", "14:00", "15:00"] },
    slotDurationMinutes: { type: Number, default: 10, min: 5, max: 120 },
    leaveDates: { type: [String], default: [] }, // YYYY-MM-DD
  },
  { timestamps: true }
);

export const Doctor = mongoose.model("Doctor", DoctorSchema);
