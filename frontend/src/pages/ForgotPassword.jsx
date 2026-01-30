import React, { useState } from "react";
import { Mail, KeyRound, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to send OTP");
      setMsg(data?.message || "OTP sent.");
      setStep(2);
    } catch (e2) {
      setErr(e2.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Reset failed");
      setMsg(data?.message || "Password reset successful.");
      setTimeout(() => (window.location.href = "/login"), 900);
    } catch (e2) {
      setErr(e2.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-200 via-slate-200 to-pink-200">
      <div className="w-[380px] max-w-[92vw]">
        <div className="border-t border-white/70 mb-10" />
        <h1 className="text-center text-2xl tracking-[0.20em] font-light text-slate-700">
          Reset Password (OTP)
        </h1>

        {step === 1 && (
          <form onSubmit={sendOtp} className="mt-10 space-y-6">
            <div className="flex items-center gap-3">
              <Mail className="text-slate-600" size={18} />
              <div className="flex-1">
                <div className="text-xs text-slate-500">Registered Email</div>
                <input
                  className="w-full bg-transparent border-b border-slate-700/60 py-2 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>
            </div>

            {err && <div className="text-sm text-red-700">{err}</div>}
            {msg && <div className="text-sm text-green-800">{msg}</div>}

            <button className="w-full py-3 bg-slate-800 text-white font-semibold tracking-widest rounded-sm" disabled={loading}>
              {loading ? "SENDING..." : "SEND OTP"}
            </button>

            <div className="text-center text-sm text-slate-700">
              Back to{" "}
              <Link className="underline" to="/login">
                Login
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={resetPassword} className="mt-10 space-y-6">
            <div className="flex items-center gap-3">
              <KeyRound className="text-slate-600" size={18} />
              <div className="flex-1">
                <div className="text-xs text-slate-500">OTP (6 digits)</div>
                <input
                  className="w-full bg-transparent border-b border-slate-700/60 py-2 outline-none"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  inputMode="numeric"
                  placeholder="Enter OTP"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Lock className="text-slate-600" size={18} />
              <div className="flex-1">
                <div className="text-xs text-slate-500">New Password</div>
                <input
                  className="w-full bg-transparent border-b border-slate-700/60 py-2 outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  required
                />
              </div>
            </div>

            {err && <div className="text-sm text-red-700">{err}</div>}
            {msg && <div className="text-sm text-green-800">{msg}</div>}

            <button className="w-full py-3 bg-slate-800 text-white font-semibold tracking-widest rounded-sm" disabled={loading}>
              {loading ? "UPDATING..." : "RESET PASSWORD"}
            </button>

            <button
              type="button"
              className="w-full py-3 bg-white/70 text-slate-800 font-semibold tracking-widest rounded-sm"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              BACK
            </button>
          </form>
        )}

        <div className="border-t border-white/70 mt-10" />
      </div>
    </div>
  );
}
