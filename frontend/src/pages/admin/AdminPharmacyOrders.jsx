import React, { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminPharmacyOrders() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const { data } = await api.get("/admin/pharmacy-orders");
      setItems(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load pharmacy orders");
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.put(`/admin/pharmacy-orders/${id}`, { status });
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Update failed");
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Pharmacy Orders</h1>
      <p className="text-sm text-slate-500 mt-1">Prescriptions sent by doctors.</p>

      {err && <div className="mt-3 text-sm text-red-700">{err}</div>}

      <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-3">Created</th>
                <th className="text-left p-3">Token</th>
                <th className="text-left p-3">Patient</th>
                <th className="text-left p-3">Items</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr key={x._id} className="border-t border-slate-200">
                  <td className="p-3 text-slate-600">{new Date(x.createdAt).toLocaleString()}</td>
                  <td className="p-3 font-mono">{x.token || "-"}</td>
                  <td className="p-3">
                    <div className="font-semibold">{x.patientName || "-"}</div>
                    <div className="text-xs text-slate-500">{x.patientPhone || ""}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-xs text-slate-600 whitespace-pre-wrap">
                      {(x.items || []).map((it, i) => `${i + 1}. ${it.name} (${it.qty})`).join("\n")}
                    </div>
                  </td>
                  <td className="p-3">
                    <select
                      value={x.status || "received"}
                      onChange={(e) => updateStatus(x._id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="received">Received</option>
                      <option value="processing">Processing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="p-4 text-slate-500" colSpan={5}>No pharmacy orders</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
