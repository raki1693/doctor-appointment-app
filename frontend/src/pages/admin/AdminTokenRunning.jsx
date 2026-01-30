import React, { useEffect, useState } from "react";
import api from "../../lib/api";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminTokenRunning() {
  const [date, setDate] = useState(todayISO());
  const [current, setCurrent] = useState(0);
  const [seq, setSeq] = useState(0);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    try {
      const { data } = await api.get(`/admin/token/current?date=${encodeURIComponent(date)}`);
      setCurrent(data.current || 0);
      setSeq(data.seq || 0);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Could not load");
    }
  }

  async function save() {
    setMsg("");
    try {
      const { data } = await api.put("/admin/token/current", { date, current: Number(current) });
      setCurrent(data.current || 0);
      setSeq(data.seq || 0);
      setMsg("✅ Updated current running token");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Could not update");
    }
  }

  useEffect(()=>{ load(); }, [date]);

  return (
    <div>
      <div className="text-2xl font-bold text-slate-800">Token Running Display</div>

      <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-600 mb-1">Date</div>
            <input type="date" className="w-full px-3 py-2 rounded-xl border border-slate-300" value={date} onChange={(e)=>setDate(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-slate-600 mb-1">Currently Serving (Number)</div>
            <input type="number" className="w-full px-3 py-2 rounded-xl border border-slate-300" value={current} onChange={(e)=>setCurrent(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex gap-3 items-center">
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold" onClick={save}>
            Update
          </button>
          <div className="text-sm text-slate-600">Last issued today: <span className="font-semibold">{seq}</span></div>
        </div>

        {msg && <div className="mt-3 text-sm">{msg}</div>}

        <div className="mt-4 text-xs text-slate-500">
          Display format (Home): OPD-YYYYMMDD-{String(current).padStart(4,"0")}
        </div>
      </div>
    </div>
  );
}