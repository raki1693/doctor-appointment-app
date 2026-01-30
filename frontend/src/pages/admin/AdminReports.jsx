import React, { useState } from "react";
import api from "../../lib/api";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminReports() {
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());
  const [msg, setMsg] = useState("");

  async function download(format) {
    setMsg("");
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/admin/reports/appointments?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&format=${format}`;
      // open download in new tab with auth header not possible; use fetch blob
      const token = localStorage.getItem("token");
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || "Download failed");
      }
      const blob = await resp.blob();
      const a = document.createElement("a");
      const file = `appointments_${from}_to_${to}.${format}`;
      a.href = URL.createObjectURL(blob);
      a.download = file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setMsg(e.message || "Could not export");
    }
  }

  return (
    <div>
      <div className="text-2xl font-bold text-slate-800">Reports Export</div>
      <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-600 mb-1">From</div>
            <input type="date" className="w-full px-3 py-2 rounded-xl border border-slate-300" value={from} onChange={(e)=>setFrom(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-slate-600 mb-1">To</div>
            <input type="date" className="w-full px-3 py-2 rounded-xl border border-slate-300" value={to} onChange={(e)=>setTo(e.target.value)} />
          </div>
        </div>

        {msg && <div className="mt-3 text-sm text-red-700">{msg}</div>}

        <div className="mt-4 flex gap-3">
          <button className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold" onClick={()=>download("csv")}>
            Download CSV
          </button>
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold" onClick={()=>download("pdf")}>
            Download PDF
          </button>
        </div>

        <div className="mt-4 text-xs text-slate-500">
          Exports appointments between selected dates.
        </div>
      </div>
    </div>
  );
}