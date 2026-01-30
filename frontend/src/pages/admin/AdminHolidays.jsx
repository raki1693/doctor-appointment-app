import React, { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminHolidays() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ date: "", name: "", isClosed: true });

  async function load() {
    setErr("");
    try {
      const { data } = await api.get("/admin/holidays");
      setItems(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/admin/holidays", form);
      setForm({ date: "", name: "", isClosed: true });
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Create failed");
    }
  }

  async function remove(id) {
    if (!confirm("Delete holiday?")) return;
    await api.delete(`/admin/holidays/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Holidays</h1>
      <p className="text-sm text-slate-600 mt-1">Mark hospital closed days.</p>

      {err && <div className="mt-3 text-sm text-red-700">{err}</div>}

      <form onSubmit={create} className="mt-5 bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          className="px-3 py-2 rounded-xl border border-slate-300"
          placeholder="YYYY-MM-DD"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          className="px-3 py-2 rounded-xl border border-slate-300"
          placeholder="Holiday Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <button className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold">Add</button>
      </form>

      <div className="mt-5 bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id} className="border-t">
                <td className="p-3">{it.date}</td>
                <td className="p-3">{it.name}</td>
                <td className="p-3">
                  <button className="text-red-700 font-semibold" onClick={() => remove(it._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="p-3 text-slate-500" colSpan={3}>
                  No holidays.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
