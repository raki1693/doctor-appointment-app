import React, { useState } from "react";
import { Mail, Lock, Siren, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../state/auth";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import NoticeTicker from "../components/NoticeTicker";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");
  const [em, setEm] = useState({ loading: false, msg: "", err: "" });

  function getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Location not supported on this device"));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (e) => reject(new Error(e?.message || "Location permission denied")),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  async function onEmergency() {
    if (em.loading) return;
    setEm({ loading: false, msg: "", err: "" });

    const ok = window.confirm(
      "🚑 EMERGENCY AMBULANCE\n\nThis will request your current location and send it to the hospital admin for ambulance dispatch.\nIf you have saved Emergency Contacts in your profile, it will also show them an on-screen Emergency Alert (when they are logged in).\n\nProceed?"
    );
    if (!ok) return;

    setEm({ loading: true, msg: "Requesting location…", err: "" });

    let loc = null;
    let note = "";
    try {
      loc = await getLocation();
    } catch (e) {
      note = e?.message || "Location not available";
    }

    try {
      const trimmedEmail = (email || "").trim().toLowerCase();
      const payload = {
        // Best-effort: if user has entered their email (or has a token), server can link the request
        // to their saved Emergency Contacts and alert them in-app.  +\change this
        ...(trimmedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) ? { email: trimmedEmail } : {}),
        location: loc
          ? { ...loc, note: "" }
          : { note: note || "Location permission denied" },
      };

      const resp = await api.post("/emergency/ambulance", payload);
      const family = resp?.data?.family;
      const familyNote = family?.attempted
        ? ` (Relatives: ${family.matchedUsers || 0}/${family.attempted} matched, ${family.pushedLive || 0} live, ${family.stored || 0} stored)`
        : "";
      setEm({ loading: false, msg: (resp?.data?.message || "Ambulance request sent") + familyNote, err: "" });
    } catch (e2) {
      setEm({
        loading: false,
        msg: "",
        err: e2?.response?.data?.message || "Emergency request failed. Please call 108.",
      });
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      if (!remember) {
        // Simple: if remember unchecked, clear token on tab close (not perfect)
        window.addEventListener("beforeunload", () => localStorage.removeItem("token"));
      }
      nav("/");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-slate-200 to-pink-200">
      {/* ✅ Holiday / Admin Notification ticker (right → left) */}
      <NoticeTicker className="fixed top-0 left-0 z-50" mode="auto" />

      <div className="min-h-screen flex items-center justify-center pt-12">
        <div className="w-[360px] max-w-[92vw]">
        <div className="border-t border-white/70 mb-10" />
        <h1 className="text-center text-3xl tracking-[0.25em] font-light text-slate-700">User Login</h1>

        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <div className="flex items-center gap-3">
            <Mail className="text-slate-600" size={18} />
            <div className="flex-1">
              <div className="text-xs text-slate-500">Email ID</div>
              <input
                className="w-full bg-transparent border-b border-slate-700/60 py-2 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Lock className="text-slate-600" size={18} />
            <div className="flex-1">
              <div className="text-xs text-slate-500">Password</div>
              <div className="relative">
              <input
                className="w-full bg-transparent border-b border-slate-700/60 py-2 outline-none pr-8"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-0 bottom-2 text-slate-600"
                aria-label="Toggle password visibility"
                title="Show/Hide password"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <Link className="italic underline" to="/forgot-password">Forgot Password?</Link>
          </div>

          {err && <div className="text-sm text-red-700">{err}</div>}

          <button className="w-full py-3 bg-slate-800 text-white font-semibold tracking-widest rounded-sm">
            LOGIN
          </button>

          <div className="text-center text-sm text-slate-700">
            New user?{" "}
            <Link className="underline" to="/signup">
              Create account
            </Link>
          </div>
        </form>

          <div className="border-t border-white/70 mt-10" />
        </div>
      </div>

      {/* ✅ Emergency Ambulance Button (Bottom-Right) */}
      {(em.msg || em.err) && (
        <div className="fixed bottom-24 right-6 w-[320px] max-w-[86vw] rounded-xl bg-white/80 backdrop-blur border border-white shadow-lg p-3 text-sm">
          {em.msg && <div className="text-emerald-700">{em.msg}</div>}
          {em.err && <div className="text-red-700">{em.err}</div>}
          <div className="mt-2 text-xs text-slate-600">
            If this is critical, call <a className="underline" href="tel:108">108</a>.
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onEmergency}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 active:scale-95 transition flex items-center justify-center"
        aria-label="Emergency ambulance"
        title="Emergency"
      >
        <Siren size={22} />
      </button>
    </div>
  );
}
