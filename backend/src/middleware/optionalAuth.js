import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

/**
 * Best-effort auth:
 * - If a valid Bearer token exists, attaches req.user
 * - Otherwise continues without throwing (so public endpoints can still work)
 */
export async function optionalAuth(req, _res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return next();

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (user) req.user = user;
    return next();
  } catch {
    // ignore invalid/expired tokens for public endpoints
    return next();
  }
}
