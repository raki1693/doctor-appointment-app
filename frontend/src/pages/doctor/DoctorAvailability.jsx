import React, { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function DoctorAvailability() {
  const [days, setDays] = useState(["Mon","Tue","Wed","Thu","Fri"]);
  const [slotsText, setSlotsText] = useState("10:00,10:30,11:00,11:30,14:00,14:30");
  const [duration, setDuration] = useState(10);
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveDates, setLeaveDates] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/doctor/me/availability");
        setDays(data.availableDays || []);
        setSlotsText((data.availableSlots || []).join(","));
        setDuration(data.slotDurationMinutes || 10);
        setLeaveDates(data.leaveDates || []);
      } catch (e) {
        setMsg(e?.response?.data?.message || "Could not load availability");
      }
    })();
  }, []);

  function toggleDay(d) {
    setDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d]);
  }

  function addLeave() {
    if (!leaveDate) return;
    if (leaveDates.includes(leaveDate)) return;
    setLeaveDates([...leaveDates, leaveDate].sort());
    setLeaveDate("");
  }

  function removeLeave(d) {
    setLeaveDates(leaveDates.filter(x=>x!==d));
  }

  async function save() {
    setMsg("");
    try {
      const slots = slotsText.split(",").map(s=>s.trim()).filter(Boolean);
      await api.put("/doctor/me/availability", {
        availableDays: days,
        availableSlots: slots,
        slotDurationMinutes: Number(duration),
        leaveDates,
      });
      setMsg("✅ Availability saved");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Could not save");
    }
  }

  return (
    <div>
      <div className="text-2xl font-bold text-slate-800">Availability Calendar</div>
      <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 max-w-3xl">
        <div className="font-semibold text-slate-800">Working Days</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {DAYS.map(d => (
            <button
              key={d}
              onClick={()=>toggleDay(d)}
              className={
                "px-3 py-2 rounded-xl text-sm font-semibold border " +
                (days.includes(d) ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-700")
              }
            >
              {d}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-800">Slots (comma separated)</div>
            <div className="text-xs text-slate-500">Example: 10:00,10:30,11:00</div>
            <input
              className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-300"
              value={slotsText}
              onChange={(e)=>setSlotsText(e.target.value)}
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">Slot Duration (minutes)</div>
            <input
              type="number"
              className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-300"
              value={duration}
              onChange={(e)=>setDuration(e.target.value)}
              min={5}
              max={120}
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="text-sm font-semibold text-slate-800">Leave Dates</div>
          <div className="mt-2 flex gap-2 items-center">
            <input type="date" className="px-3 py-2 rounded-xl border border-slate-300" value={leaveDate} onChange={(e)=>setLeaveDate(e.target.value)} />
            <button className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold" onClick={addLeave}>Add</button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {leaveDates.map(d => (
              <div key={d} className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm flex items-center gap-2">
                <span>{d}</span>
                <button className="text-red-600 font-bold" onClick={()=>removeLeave(d)}>×</button>
              </div>
            ))}
            {leaveDates.length === 0 && <div className="text-sm text-slate-500">No leaves added</div>}
          </div>
        </div>

        {msg && <div className="mt-4 text-sm">{msg}</div>}

        <button className="mt-5 px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold" onClick={save}>
          Save Availability
        </button>
      </div>
    </div>
  );
}