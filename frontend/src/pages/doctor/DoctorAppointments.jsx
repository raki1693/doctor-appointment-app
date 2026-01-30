import React, { useEffect, useState } from "react";
import api from "../../lib/api";

export default function DoctorAppointments() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    setMsg("");
    try {
      const { data } = await api.get("/doctor/me/appointments");
      setItems(data.appointments || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Could not load appointments");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markCompleted(appt) {
    if (!appt?._id || busyId) return;
    const ok = window.confirm(`Mark token ${appt.token || ""} as COMPLETED?`);
    if (!ok) return;

    setActionMsg("");
    setBusyId(appt._id);
    try {
      const { data } = await api.post(`/doctor/appointments/${appt._id}/complete`);
      setItems((prev) =>
        prev.map((a) => (a._id === appt._id ? { ...a, status: data?.appointment?.status || "completed" } : a))
      );

      const dateKey = data?.tokenCounter?.date || "";
      const cur = Number(data?.tokenCounter?.current || 0);
      const tokenText = dateKey ? `OPD-${dateKey}-${String(cur).padStart(4, "0")}` : "";
      setActionMsg(tokenText ? `✅ Completed. Running token updated to ${tokenText}` : "✅ Completed.");
    } catch (e) {
      setActionMsg(e?.response?.data?.message || "Could not update status");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div>
      <div className="text-2xl font-bold text-slate-800">My Appointments</div>

      {msg && <div className="mt-3 text-sm text-red-700">{msg}</div>}
      {actionMsg && <div className="mt-3 text-sm">{actionMsg}</div>}

      <div className="mt-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 text-sm text-slate-500">Latest appointments</div>
        <div className="divide-y">
          {items.map((a) => {
            const canComplete =
              a.token &&
              a.paymentStatus === "paid" &&
              a.status !== "completed" &&
              a.status !== "cancelled";

            return (
              <div key={a._id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-800">
                    {a.userId?.name} <span className="text-xs text-slate-500">({a.userId?.phone})</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Token: <span className="font-mono">{a.token || "-"}</span> • {a.date} {a.slot}
                  </div>
                </div>

                <div className="text-sm flex items-center gap-2 md:justify-end">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {a.status} / {a.paymentStatus}
                  </span>

                  {canComplete && (
                    <button
                      type="button"
                      onClick={() => markCompleted(a)}
                      disabled={busyId === a._id}
                      className="px-3 py-1 rounded-full bg-emerald-600 text-white font-semibold disabled:opacity-60"
                      title="Mark consultation completed"
                    >
                      {busyId === a._id ? "Updating..." : "Complete"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {items.length === 0 && <div className="p-4 text-sm text-slate-500">No appointments yet.</div>}
        </div>
      </div>
    </div>
  );
}
