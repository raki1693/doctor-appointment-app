import mongoose from "mongoose";

const LocalizedText = new mongoose.Schema(
  {
    en: { type: String, required: true },
    hi: { type: String, required: true },
    te: { type: String, required: true },
  },
  { _id: false }
);

const SymptomCheckSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    mode: { type: String, enum: ["text", "voice", "camera"], required: true },
    inputText: { type: String },
    imageMime: { type: String },
    imageBase64: { type: String }, // optional; keep small (compressed jpeg)
    result: { type: Object },
    languagePref: { type: String, enum: ["en", "hi", "te"], default: "en" },
  },
  { timestamps: true }
);

export const SymptomCheck = mongoose.model("SymptomCheck", SymptomCheckSchema);
