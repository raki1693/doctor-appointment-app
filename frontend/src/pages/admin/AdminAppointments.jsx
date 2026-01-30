import React, { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminAppointments() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const { data } = await api.get("/admin/appointments");
      setItems(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load");
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
        <button onClick={load} className="px-4 py-2 rounded-xl bg-slate-900 text-white">Refresh</button>
      </div>

      {err && <div className="mt-4 text-sm text-red-700">{err}</div>}

      <div className="mt-4 overflow-auto bg-white border border-slate-200 rounded-2xl">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600 border-b">
              <th className="p-3">Token</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Doctor</th>
              <th className="p-3">Date</th>
              <th className="p-3">Slot</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a._id} className="border-b last:border-b-0">
                <td className="p-3 font-mono">{a.token || "-"}</td>
                <td className="p-3">{a.patientName || a.userName || a.userEmail || "-"}</td>
                <td className="p-3">{a.doctorName || a.doctorEmail || "-"}</td>
                <td className="p-3">{a.date}</td>
                <td className="p-3">{a.slot}</td>
                <td className="p-3">{a.status}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-3 text-slate-500" colSpan={6}>No appointments</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
