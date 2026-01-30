import React, { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: 0,
    mrp: 0,
    imageUrl: "",
    description: "",
    inStock: true,
  });

  async function load() {
    const { data } = await api.get("/admin/products");
    setItems(data);
  }

  useEffect(() => {
    load().catch((e) => setErr(e?.response?.data?.message || "Failed to load"));
  }, []);

  async function create(e) {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/admin/products", { ...form, price: Number(form.price), mrp: Number(form.mrp) });
      setForm({ name: "", category: "", price: 0, mrp: 0, imageUrl: "", description: "", inStock: true });
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Create failed");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this medicine?")) return;
    await api.delete(`/admin/products/${id}`);
    await load();
  }

  return (
    <div>
      <div className="text-2xl font-bold text-slate-900">Medicines</div>
      <div className="text-slate-500 text-sm mt-1">Add medicines for the catalog. For images you can use public URLs or /images/... from frontend/public.</div>

      <form onSubmit={create} className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="px-3 py-2 rounded-xl border" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="px-3 py-2 rounded-xl border" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input className="px-3 py-2 rounded-xl border" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <input className="px-3 py-2 rounded-xl border" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className="px-3 py-2 rounded-xl border" type="number" placeholder="MRP" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-slate-700 px-2">
            <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />
            In stock
          </label>
        </div>
        <textarea className="mt-3 w-full px-3 py-2 rounded-xl border" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        {err && <div className="text-sm text-red-700 mt-2">{err}</div>}

        <button className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold">Add Medicine</button>
      </form>

      <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-right p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">₹{p.price}</td>
                <td className="p-3">{p.inStock ? "Yes" : "No"}</td>
                <td className="p-3 text-right">
                  <button onClick={() => remove(p._id)} className="px-3 py-1 rounded-lg bg-red-50 text-red-700 font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
