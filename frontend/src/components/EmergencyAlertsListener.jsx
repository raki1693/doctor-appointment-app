import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../lib/api";
import { useAuth } from "../state/auth";
import { AlertTriangle } from "lucide-react";
import emergencyBg from "../assets/emergency-alerts-bg.png";

function mapsLink(loc) {
  if (!loc) return "";
  if (typeof loc.lat === "number" && typeof loc.lng === "number") {
    return `https://maps.google.com/?q=${loc.lat},${loc.lng}`;
  }
  return "";
}

function EmergencyOverlay({ alert, onClose }) {
  const link = mapsLink(alert?.location);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Background image (matches your sample) */}
      <div
        className="absolute inset-0 bg-red-700"
        style={{
          backgroundImage: `url(${emergencyBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
      </div>

      {/* Card */}
      <div className="relative w-[360px] max-w-[92vw] rounded-3xl bg-white shadow-2xl border border-white/60 overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow">
              <AlertTriangle size={26} />
            </div>
            <div>
              <div className="text-lg font-extrabold text-red-700 leading-tight">Emergency Alerts</div>
              <div className="text-xs text-slate-600">Immediate attention required</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-800">{alert?.patientName || "Patient"}</div>
            {alert?.patientPhone && (
              <div className="text-sm text-slate-700 mt-1">
                Phone: <a className="underline" href={`tel:${alert.patientPhone}`}>{alert.patientPhone}</a>
              </div>
            )}
            {link ? (
              <div className="text-sm text-slate-700 mt-1">
                Location: <a className="underline" href={link} target="_blank" rel="noreferrer">Open in Maps</a>
              </div>
            ) : (
              <div className="text-sm text-slate-700 mt-1">Location: Not shared</div>
            )}
            {alert?.message && <div className="text-xs text-slate-600 mt-2">{alert.message}</div>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              className="text-center px-4 py-3 rounded-2xl bg-slate-900 text-white font-semibold"
              href={alert?.patientPhone ? `tel:${alert.patientPhone}` : "#"}
              onClick={(e) => { if (!alert?.patientPhone) e.preventDefault(); }}
            >
              Call
            </a>
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Acknowledge
            </button>
          </div>

          <div className="mt-3 text-[11px] text-slate-600">
            Tip: If you are not nearby, call emergency services immediately.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmergencyAlertsListener() {
  const { user, ready } = useAuth();
  const [active, setActive] = useState(null);
  const socketRef = useRef(null);

  const socketUrl = useMemo(() => {
    // API base in your app looks like: VITE_API_BASE_URL + "/api"
    // Socket.IO must connect to the server root.
    const base = import.meta.env.VITE_API_BASE_URL || "";
    return base.replace(/\/+$/, "");
  }, []);

  // Fetch pending alerts on login
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setActive(null);
      return;
    }

    // Only for normal users/relatives (avoid doctor/admin screens)
    if (["admin", "doctor"].includes(user.role)) return;

    (async () => {
      try {
        const { data } = await api.get("/emergency/alerts");
        const first = Array.isArray(data.alerts) ? data.alerts[0] : null;
        if (first) setActive(first);
      } catch {
        // ignore
      }
    })();
  }, [ready, user]);

  // Live push (Socket.IO)
  useEffect(() => {
    if (!ready) return;
    if (!user) return;
    if (["admin", "doctor"].includes(user.role)) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Connect once per login
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect_error", () => {
      // ignore
    });

    socket.on("emergency:alert", (payload) => {
      // Always show the newest alert immediately
      setActive((prev) => payload || prev);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [ready, user, socketUrl]);

  async function acknowledge() {
    const id = active?.id || active?._id;
    if (id) {
      try {
        await api.post(`/emergency/alerts/${id}/ack`);
      } catch {
        // ignore
      }
    }
    setActive(null);
  }

  if (!active) return null;
  return <EmergencyOverlay alert={active} onClose={acknowledge} />;
}
