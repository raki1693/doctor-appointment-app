import React, { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminAnnouncements() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ title: "", message: "", activeFrom: "", activeTo: "", isActive: true });

  async function load() {
    setErr("");
    try {
      const { data } = await api.get("/admin/announcements");
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
      await api.post("/admin/announcements", form);
      setForm({ title: "", message: "", activeFrom: "", activeTo: "", isActive: true });
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Create failed");
    }
  }

  async function remove(id) {
    if (!confirm("Delete announcement?")) return;
    await api.delete(`/admin/announcements/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
      <p className="text-sm text-slate-600 mt-1">Show notices like government hospital updates.</p>

      {err && <div className="mt-3 text-sm text-red-700">{err}</div>}

      <form onSubmit={create} className="mt-5 bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 gap-3">
        <input
          className="px-3 py-2 rounded-xl border border-slate-300"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="px-3 py-2 rounded-xl border border-slate-300"
          placeholder="Message"
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="px-3 py-2 rounded-xl border border-slate-300"
            placeholder="Active From (YYYY-MM-DD)"
            value={form.activeFrom}
            onChange={(e) => setForm({ ...form, activeFrom: e.target.value })}
          />
          <input
            className="px-3 py-2 rounded-xl border border-slate-300"
            placeholder="Active To (YYYY-MM-DD)"
            value={form.activeTo}
            onChange={(e) => setForm({ ...form, activeTo: e.target.value })}
          />
          <button className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold">Publish</button>
        </div>
      </form>

      <div className="mt-5 bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Active</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id} className="border-t">
                <td className="p-3">
                  <div className="font-semibold text-slate-900">{it.title}</div>
                  <div className="text-xs text-slate-600 mt-1">{it.message}</div>
                </td>
                <td className="p-3 text-xs text-slate-600">
                  {it.activeFrom || "—"} → {it.activeTo || "—"}
                </td>
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
                  No announcements.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
