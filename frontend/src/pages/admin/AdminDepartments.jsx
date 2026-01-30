import React, { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminDepartments() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  async function load() {
    setErr("");
    try {
      const { data } = await api.get("/admin/departments");
      setItems(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load");
    }
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/admin/departments", form);
      setForm({ name: "", code: "", description: "" });
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Create failed");
    }
  }

  async function remove(id) {
    if (!confirm("Delete department?")) return;
    await api.delete(`/admin/departments/${id}`);
    await load();
  }

  return (
    <div>
      <div className="text-2xl font-bold text-slate-900">Departments</div>
      <div className="text-sm text-slate-500 mt-1">Create and manage OPD departments.</div>

      <form onSubmit={create} className="mt-6 bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="px-3 py-2 rounded-xl border" placeholder="Department name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="px-3 py-2 rounded-xl border" placeholder="Code (optional)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <input className="px-3 py-2 rounded-xl border" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="md:col-span-3">
          <button className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold">Add Department</button>
        </div>
        {err && <div className="md:col-span-3 text-sm text-red-700">{err}</div>}
      </form>

      <div className="mt-6 bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Code</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="p-3 font-semibold">{d.name}</td>
                <td className="p-3">{d.code || "-"}</td>
                <td className="p-3">{d.description || "-"}</td>
                <td className="p-3">
                  <button onClick={() => remove(d._id)} className="text-red-700 font-semibold">Delete</button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr><td className="p-3 text-slate-500" colSpan={4}>No departments</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
