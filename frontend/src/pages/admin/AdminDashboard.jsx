import React, { useEffect, useState } from "react";
import api from "../../lib/api";

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/admin/summary");
        setSummary(data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load admin summary");
      }
    })();
  }, []);

  return (
    <div>
      <div className="text-2xl font-bold text-slate-900">Admin Dashboard</div>
      <div className="text-sm text-slate-600 mt-1">Overview of hospital operations</div>

      {err && <div className="mt-4 text-sm text-red-700">{err}</div>}

      {!summary ? (
        <div className="mt-6 text-slate-600">Loading...</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Stat label="Patients" value={summary.users} />
          <Stat label="Doctors" value={summary.doctors} />
          <Stat label="Appointments" value={summary.appointments} />
          <Stat label="Medicines" value={summary.products} />
          <Stat label="Orders" value={summary.orders} />
          <Stat label="Pharmacy Orders" value={summary.pharmacyOrders} />
        </div>
      )}

      <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="text-lg font-semibold text-slate-900">Default Admin Login</div>
        <div className="text-sm text-slate-700 mt-2">
          Email: <span className="font-semibold">admin@gov.in</span>
          <br />
          Password: <span className="font-semibold">Admin@123</span>
        </div>
      </div>
    </div>
  );
}
