import React, { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminDoctors() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    department: "",
    timings: "",
    fee: 0,
    password: "Doctor@123",
    imageUrl: "",
  });

  async function load() {
    setErr("");
    try {
      const { data } = await api.get("/admin/doctors");
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
      await api.post("/admin/doctors", { ...form, fee: Number(form.fee || 0) });
      setForm({ name: "", email: "", phone: "", specialization: "", department: "", timings: "", fee: 0, password: "Doctor@123", imageUrl: "" });
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Create failed");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this doctor?")) return;
    setErr("");
    try {
      await api.delete(`/admin/doctors/${id}`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Delete failed");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>
      <p className="text-sm text-slate-600 mt-1">Create doctor accounts and manage OPD doctors.</p>

      {err && <div className="mt-4 text-sm text-red-700">{err}</div>}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={create} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="font-semibold text-slate-900">Add Doctor</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <input className="px-3 py-2 rounded-xl border" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="px-3 py-2 rounded-xl border" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="px-3 py-2 rounded-xl border" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="px-3 py-2 rounded-xl border" placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            <input className="px-3 py-2 rounded-xl border" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <input className="px-3 py-2 rounded-xl border" placeholder="Timings (e.g., 10AM-2PM)" value={form.timings} onChange={(e) => setForm({ ...form, timings: e.target.value })} />
            <input className="px-3 py-2 rounded-xl border" placeholder="Fee" type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
            <input className="px-3 py-2 rounded-xl border" placeholder="Doctor password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <input className="px-3 py-2 rounded-xl border md:col-span-2" placeholder="Image URL (optional)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </div>
          <button className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold">Create Doctor</button>
          <div className="mt-3 text-xs text-slate-500">Default password is Doctor@123. You can change it here.</div>
        </form>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="font-semibold text-slate-900">Doctor List</div>
          <div className="mt-4 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Dept</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d._id} className="border-t">
                    <td className="py-2 font-semibold text-slate-900">{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.department || "-"}</td>
                    <td className="text-right">
                      <button className="px-3 py-1 rounded-lg bg-red-50 text-red-700" onClick={() => remove(d._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td className="py-4 text-slate-500" colSpan={4}>No doctors</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
