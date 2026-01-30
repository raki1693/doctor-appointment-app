import React, { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import api from "../lib/api";
import { Link } from "react-router-dom";

export default function Doctors() {
  const [q, setQ] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get("/doctors", { params: { q } });
    setDoctors(data.doctors);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => doctors, [doctors]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold">Doctors</h1>
          <div className="flex gap-2">
            <input
              className="px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-sky-300"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search doctor / specialty"
            />
            <button className="px-4 py-2 rounded-xl bg-slate-800 text-white" onClick={load}>Search</button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6">Loading...</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((d) => (
              <div key={d._id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex gap-3">
                <img
                  src={d.imageUrl || "https://via.placeholder.com/120x120?text=Doctor"}
                  className="w-24 h-24 rounded-2xl object-cover border"
                />
                <div className="flex-1">
                  <div className="font-bold">{d.name}</div>
                  <div className="text-sm text-slate-600">{d.specialty}</div>
                  <div className="text-xs text-slate-500 mt-1">{d.hospital}</div>
                  <div className="text-sm mt-2">Fee: ₹{d.fee}</div>
                  <Link className="inline-block mt-2 text-sm underline" to={`/doctors/${d._id}`}>
                    View & Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
