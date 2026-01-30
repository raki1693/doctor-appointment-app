import { Router } from "express";
import { ambulanceRequestSchema } from "../validation/emergency.validation.js";
import { EmergencyRequest } from "../models/EmergencyRequest.js";
import { httpError } from "../utils/httpError.js";
import { sendEmergencyAmbulanceEmail } from "../utils/mailer.js";
import { sendWhatsAppAdminAlert } from "../services/whatsapp.service.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { EmergencyAlert } from "../models/EmergencyAlert.js";

const router = Router();

function getClientIp(req) {
  // Works in most hosting setups (Vercel/Render/Nginx etc.)
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
  return req.ip || "";
}

router.post("/ambulance", optionalAuth, async (req, res, next) => {
  try {
    const data = ambulanceRequestSchema.parse(req.body || {});
    const ip = getClientIp(req);
    const userAgent = String(req.headers["user-agent"] || "");

    // Very small anti-spam guard (best-effort)
    const recent = await EmergencyRequest.findOne({
      ip,
      createdAt: { $gt: new Date(Date.now() - 30 * 1000) },
    });
    if (recent) {
      return next(httpError(429, "Too many emergency requests. If this is urgent, call 108 immediately."));
    }

    // Best-effort: link to a patient profile (for family alerts)
    let resolvedUser = req.user || null;
    if (!resolvedUser && data.email) {
      resolvedUser = await User.findOne({ email: String(data.email).toLowerCase() }).select("-passwordHash");
    }

    const doc = await EmergencyRequest.create({
      type: "ambulance",
      userId: resolvedUser?._id,
      name: resolvedUser?.name || data.name || "",
      phone: resolvedUser?.phone || data.phone || "",
      email: resolvedUser?.email || data.email || "",
      location: data.location || {},
      ip,
      userAgent,
    });

    const adminEmail = process.env.EMERGENCY_ADMIN_EMAIL || process.env.SMTP_USER; // +\change this

    const messageText = `🚑 EMERGENCY AMBULANCE REQUEST\nID: ${doc._id}\nName: ${doc.name || "-"}\nPhone: ${doc.phone || "-"}\nEmail: ${doc.email || "-"}\nLat: ${doc.location?.lat ?? "-"}\nLng: ${doc.location?.lng ?? "-"}\nNote: ${doc.location?.note ?? ""}`;

    // Notify admin (best-effort)
    try {
      await sendWhatsAppAdminAlert(messageText);
    } catch (e) {
      console.error("WhatsApp alert failed:", e?.message || e);
    }

    try {
      const canEmail = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
      if (canEmail && adminEmail) {
        await sendEmergencyAmbulanceEmail({
          to: adminEmail,
          name: doc.name,
          phone: doc.phone,
          email: doc.email,
          location: doc.location,
          requestId: doc._id,
        });
      } else {
        console.log("[Email disabled] Would send emergency email to:", adminEmail);
      }
    } catch (e) {
      console.error("Emergency email failed:", e?.message || e);
    }

    // Notify up to 3 relatives with an IN-APP screen alert (works when they are logged in)
    // Matching rule: relatives must have an account with the same phone number as saved in Emergency Contacts.
    const family = { attempted: 0, matchedUsers: 0, pushedLive: 0, stored: 0 };
    try {
      const contacts = (resolvedUser?.emergencyContacts || []).slice(0, 3);
      family.attempted = contacts.length;

      const makeVariants = (raw) => {
        const s = String(raw || "").trim();
        const digits = s.replace(/\D/g, "");
        const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
        const out = new Set([s, digits, last10]);
        if (last10 && last10.length === 10) {
          out.add(`+91${last10}`);
          out.add(`0${last10}`);
        }
        return Array.from(out).filter(Boolean);
      };

      const relatives = [];
      for (const c of contacts) {
        const variants = makeVariants(c?.phone);
        if (!variants.length) continue;
        const u = await User.findOne({ phone: { $in: variants } }).select("-passwordHash");
        if (u) relatives.push(u);
      }

      family.matchedUsers = relatives.length;

      if (relatives.length) {
        const mapLink =
          typeof doc.location?.lat === "number" && typeof doc.location?.lng === "number"
            ? `https://maps.google.com/?q=${doc.location.lat},${doc.location.lng}`
            : "";

        const alertMessage =
          `Emergency from ${resolvedUser?.name || doc.name || "Patient"}. ` +
          (mapLink ? `Location: ${mapLink}` : "Location not shared.");

        const io = req.app.get("io");

        for (const rel of relatives) {
          const alertDoc = await EmergencyAlert.create({
            recipientId: rel._id,
            patientId: resolvedUser?._id,
            emergencyRequestId: doc._id,
            patientName: resolvedUser?.name || doc.name || "",
            patientPhone: resolvedUser?.phone || doc.phone || "",
            location: doc.location || {},
            message: alertMessage,
          });
          family.stored += 1;

          // Push live to currently-online relatives (Socket.IO)
          try {
            if (io) {
              const roomName = `user:${rel._id.toString()}`;
              const room = io.sockets.adapter.rooms.get(roomName);
              const isOnline = Boolean(room && room.size > 0);

              if (isOnline) {
                io.to(roomName).emit("emergency:alert", {
                id: alertDoc._id,
                patientName: alertDoc.patientName,
                patientPhone: alertDoc.patientPhone,
                location: alertDoc.location,
                message: alertDoc.message,
                createdAt: alertDoc.createdAt,
              });
                family.pushedLive += 1;
              }
            }
          } catch (e) {
            console.error("Socket push failed:", e?.message || e);
          }
        }
      }
    } catch (e) {
      console.error("Family in-app alert failed:", e?.message || e);
    }

    return res.json({
      message: "Ambulance request sent. If this is critical, call 108 immediately.",
      requestId: doc._id,
      family,
    });
  } catch (err) {
    next(err);
  }
});

// Relatives: fetch pending emergency alerts
router.get("/alerts", requireAuth, async (req, res, next) => {
  try {
    const alerts = await EmergencyAlert.find({
      recipientId: req.user._id,
      acknowledgedAt: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ alerts });
  } catch (err) {
    next(err);
  }
});

// Relatives: acknowledge an alert (dismiss)
router.post("/alerts/:id/ack", requireAuth, async (req, res, next) => {
  try {
    const alert = await EmergencyAlert.findOne({
      _id: req.params.id,
      recipientId: req.user._id,
    });
    if (!alert) return next(httpError(404, "Alert not found"));

    alert.acknowledgedAt = new Date();
    await alert.save();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
