import mongoose from "mongoose";

const TokenCounterSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // YYYYMMDD
    seq: { type: Number, required: true, default: 0 },
    current: { type: Number, required: true, default: 0 }, // currently serving token number for the day
  },
  { timestamps: true }
);

export const TokenCounter = mongoose.model("TokenCounter", TokenCounterSchema);
