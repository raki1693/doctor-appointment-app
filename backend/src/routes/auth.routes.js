import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { httpError } from "../utils/httpError.js";
import { sendResetOtpEmail } from "../utils/mailer.js";
import { signupSchema, loginSchema } from "../validation/auth.validation.js";

const router = Router();

router.post("/signup", async (req, res, next) => {
  try {
    const data = signupSchema.parse(req.body);
    const existing = await User.findOne({ email: data.email });
    if (existing) return next(httpError(409, "Email already registered"));

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: "user",
    });

    const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });
    if (!user) return next(httpError(401, "Invalid email or password"));

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) return next(httpError(401, "Invalid email or password"));

    const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");
const genOtp6 = () => String(Math.floor(100000 + Math.random() * 900000)); // 6 digits

// POST /api/auth/forgot-password-otp
router.post("/forgot-password-otp", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").toLowerCase().trim();
    if (!email) return next(httpError(400, "Email is required"));

    const user = await User.findOne({ email });

    // ✅ Always respond the same (do not reveal if email exists)
    if (!user) return res.json({ message: "If this email exists, OTP has been sent." });

    // Lockout protection
    if (user.resetOtpLockedUntil && user.resetOtpLockedUntil > new Date()) {
      return next(httpError(429, "Too many attempts. Try later."));
    }

    const otp = genOtp6();
    user.resetOtpHash = hashOtp(otp);
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    user.resetOtpAttempts = 0;
    user.resetOtpLockedUntil = undefined;
    await user.save();

    await sendResetOtpEmail({ to: user.email, otp });

    return res.json({ message: "If this email exists, OTP has been sent." });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password-otp
router.post("/reset-password-otp", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").toLowerCase().trim();
    const otp = String(req.body?.otp || "").trim();
    const newPassword = String(req.body?.newPassword || "");

    if (!email || !otp || !newPassword) {
      return next(httpError(400, "Email, OTP and new password are required"));
    }
    if (newPassword.length < 6) {
      return next(httpError(400, "Password must be at least 6 characters"));
    }

    const user = await User.findOne({ email });
    if (!user) return next(httpError(400, "Invalid OTP"));

    if (user.resetOtpLockedUntil && user.resetOtpLockedUntil > new Date()) {
      return next(httpError(429, "Too many attempts. Try later."));
    }

    if (!user.resetOtpHash || !user.resetOtpExpires || user.resetOtpExpires <= new Date()) {
      return next(httpError(400, "OTP expired. Request new OTP."));
    }

    const ok = hashOtp(otp) === user.resetOtpHash;
    if (!ok) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      if (user.resetOtpAttempts >= 5) {
        user.resetOtpLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      }
      await user.save();
      return next(httpError(400, "Invalid OTP"));
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetOtpHash = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = 0;
    user.resetOtpLockedUntil = undefined;
    await user.save();

    return res.json({ message: "Password reset successful. Please login." });
  } catch (err) {
    next(err);
  }
});

export default router;
