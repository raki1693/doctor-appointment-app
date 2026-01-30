import mongoose from "mongoose";

const HolidaySchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    name: { type: String, required: true, trim: true },
    isClosed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

HolidaySchema.index({ date: 1 }, { unique: true });

export const Holiday = mongoose.model("Holiday", HolidaySchema);
