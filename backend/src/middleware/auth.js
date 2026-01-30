import jwt from "jsonwebtoken";
import { httpError } from "../utils/httpError.js";
import { User } from "../models/User.js";

export async function requireAuth(req, _res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return next(httpError(401, "Missing token"));

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user) return next(httpError(401, "User not found"));

    req.user = user;
    next();
  } catch {
    next(httpError(401, "Invalid token"));
  }
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") return next(httpError(403, "Admin only"));
  next();
}


export function requireDoctor(req, _res, next) {
  if (req.user?.role !== "doctor") return next(httpError(403, "Doctor only"));
  next();
}

export function requirePharmacy(req, _res, next) {
  if (req.user?.role !== "pharmacy") return next(httpError(403, "Pharmacy only"));
  next();
}
