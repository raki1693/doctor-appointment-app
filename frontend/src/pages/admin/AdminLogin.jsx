import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@gov.in");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await login(email, password);
      nav("/admin");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-200 via-indigo-200 to-pink-200">
      <div className="w-[420px] bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-xl">
        <div className="text-center">
          <div className="text-2xl tracking-widest text-slate-800">Admin Login</div>
          <div className="text-xs text-slate-500 mt-2">Hospital Control Room</div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="text-xs text-slate-600">Email ID</label>
            <input
              className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 bg-white/70"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gov.in"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">Password</label>
            <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white/70 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
              aria-label="Toggle password visibility"
              title="Show/Hide password"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          </div>

          {msg && <div className="text-sm text-red-700">{msg}</div>}

          <button className="w-full py-2 rounded-xl bg-slate-900 text-white font-semibold">
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
