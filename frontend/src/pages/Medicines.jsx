import React, { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import api from "../lib/api";
import { useCart } from "../state/cart";

export default function Medicines() {
  const { add } = useCart();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get("/products", { params: { q, category } });
    setProducts(data.products);
    setCategories(data.categories);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const list = useMemo(() => products, [products]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <h1 className="text-xl font-bold">Medicines</h1>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-sky-300"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search medicines"
            />
            <select
              className="px-3 py-2 rounded-xl border border-slate-300"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="px-4 py-2 rounded-xl bg-slate-800 text-white" onClick={load}>Search</button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6">Loading...</div>
        ) : list.length === 0 ? (
          <div className="mt-6 text-slate-600">No medicines found.</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {list.map((p) => (
              <div key={p._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={p.imageUrl || "https://via.placeholder.com/600x400?text=Medicine"}
                  className="w-full h-40 object-cover border-b"
                />
                <div className="p-4">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.category}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="font-bold">₹{p.price}</div>
                    {p.mrp ? <div className="text-sm text-slate-500 line-through">₹{p.mrp}</div> : null}
                  </div>
                  <button
                    className="mt-3 w-full py-2 rounded-xl bg-sky-700 text-white font-semibold hover:opacity-95"
                    onClick={() => add(p)}
                    disabled={!p.inStock}
                    title={!p.inStock ? "Out of stock" : "Add to cart"}
                  >
                    {p.inStock ? "Add to Cart" : "Out of stock"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
