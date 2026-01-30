import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import api from "../lib/api";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get("/appointments/mine");
    setAppointments(data.appointments);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

async function cancel(id, status) {
  const choice = window.prompt('Refund method? Type "online" for refund to payment method OR "cash" for reception cash refund.', "cash");
  if (!choice) return;
  await api.post(`/appointments/${id}/cancel`, { refundMethod: choice.toLowerCase() });
  await load();
}


  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-xl font-bold">My Appointments</h1>

        {loading ? (
          <div className="mt-6">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="mt-6 text-slate-600">No appointments.</div>
        ) : (
          <div className="mt-6 space-y-3">
            {appointments.map((a) => (
              <div key={a._id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="font-semibold">{a.doctorId?.name}</div>
                <div className="text-sm text-slate-600">{a.doctorId?.specialty} • {a.doctorId?.hospital}</div>
                <div className="mt-2 text-sm">Date: {a.date} • Slot: {a.slot}</div>
                <div className="text-sm">Token: <span className="font-mono">{a.token || "-"}</span></div>
                <div className="text-sm">Payment: <span className="font-semibold">{a.paymentStatus}</span></div>
                <div className="text-sm">Status: <span className="font-semibold">{a.status}</span></div>
                {a.status === "booked" && (
                  <button className="mt-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50" onClick={() => cancel(a._id, a.status)}>
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
