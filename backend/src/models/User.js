import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "doctor", "pharmacy"], default: "user" },
    address: { type: String, default: "" },
    
    // Password reset via Email OTP
    resetOtpHash: { type: String },
    resetOtpExpires: { type: Date },
    resetOtpAttempts: { type: Number, default: 0 },
    resetOtpLockedUntil: { type: Date },

    // Emergency contacts (max 3) - numbers will be used when user presses Emergency on login page
    emergencyContacts: {
      type: [
        {
          name: { type: String, default: "", trim: true },
          relation: { type: String, default: "", trim: true },
          phone: { type: String, default: "", trim: true },
        },
      ],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 3,
        message: "You can save maximum 3 emergency contacts",
      },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
