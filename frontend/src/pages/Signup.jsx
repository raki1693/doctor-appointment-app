import React, { useState } from "react";
import { useAuth } from "../state/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await signup(form);
      nav("/");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Signup failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-[420px] max-w-[92vw] bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h1 className="text-xl font-bold">Create Account</h1>
        <p className="text-sm text-slate-600 mt-1">For Government Hospital Portal</p>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          {["name", "email", "phone", "password"].map((k) => (
            <input
              key={k}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-sky-300"
              placeholder={k.toUpperCase()}
              type={k === "password" ? "password" : k === "email" ? "email" : "text"}
              value={form[k]}
              onChange={(e) => setForm((s) => ({ ...s, [k]: e.target.value }))}
              required
            />
          ))}

          {err && <div className="text-sm text-red-700">{err}</div>}

          <button className="w-full py-2 rounded-xl bg-slate-800 text-white font-semibold">Sign Up</button>
        </form>

        <div className="text-sm text-slate-700 mt-4">
          Already have an account? <Link className="underline" to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
