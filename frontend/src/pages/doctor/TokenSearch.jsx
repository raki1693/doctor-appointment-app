import React, { useEffect, useState } from "react";
import api from "../../lib/api";

export default function TokenSearch() {
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [appointment, setAppointment] = useState(null);

  const [diagnosis, setDiagnosis] = useState("");
  const [instructions, setInstructions] = useState("");
  const [meds, setMeds] = useState([{ productId: "", name: "", dosage: "", frequency: "", duration: "", notes: "" }]);
  const [prescMsg, setPrescMsg] = useState("");

  const [completeMsg, setCompleteMsg] = useState("");
  const [completeBusy, setCompleteBusy] = useState(false);

  const [medQuery, setMedQuery] = useState("");
  const [medResults, setMedResults] = useState([]);
  const [medLoading, setMedLoading] = useState(false);

  async function search() {
    setMsg("");
    setAppointment(null);
    setPrescMsg("");
    setCompleteMsg("");
    try {
      const { data } = await api.get(`/doctor/token/${encodeURIComponent(token.trim())}`);
      setAppointment(data.appointment);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Token not found");
    }
  }

  function updateMed(i, key, val) {
    const copy = meds.slice();
    copy[i] = { ...copy[i], [key]: val };
    setMeds(copy);
  }

  function addMed() {
    setMeds([...meds, { productId: "", name: "", dosage: "", frequency: "", duration: "", notes: "" }]);
  }

  async function sendPrescription() {
    setPrescMsg("");
    try {
      const clean = meds.filter((m) => (m.name || "").trim().length > 0);
      await api.post("/doctor/prescriptions", {
        token: appointment.token,
        diagnosis,
        medicines: clean,
        instructions,
        sendToPharmacy: true,
      });
      setPrescMsg("✅ Prescription sent to Medical Store (Pharmacy).");
    } catch (e) {
      setPrescMsg(e?.response?.data?.message || "Could not send prescription");
    }
  }

  async function markCompleted() {
    if (!appointment?.token || completeBusy) return;
    const ok = window.confirm(`Mark token ${appointment.token} as COMPLETED?`);
    if (!ok) return;

    setCompleteMsg("");
    setCompleteBusy(true);
    try {
      const { data } = await api.post(`/doctor/token/${encodeURIComponent(appointment.token)}/complete`);
      setAppointment((prev) => (prev ? { ...prev, status: data?.appointment?.status || "completed" } : prev));

      const dateKey = data?.tokenCounter?.date || "";
      const cur = Number(data?.tokenCounter?.current || 0);
      const tokenText = dateKey ? `OPD-${dateKey}-${String(cur).padStart(4, "0")}` : "";
      setCompleteMsg(tokenText ? `✅ Completed. Running token updated to ${tokenText}` : "✅ Completed.");
    } catch (e) {
      setCompleteMsg(e?.response?.data?.message || "Could not update status");
    } finally {
      setCompleteBusy(false);
    }
  }

  useEffect(() => {
    let alive = true;
    const q = (medQuery || "").trim();
    if (!q) {
      setMedResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setMedLoading(true);
        const { data } = await api.get(`/products?q=${encodeURIComponent(q)}`);
        if (!alive) return;
        setMedResults((data.products || []).slice(0, 8));
      } catch {
        if (!alive) return;
        setMedResults([]);
      } finally {
        if (alive) setMedLoading(false);
      }
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [medQuery]);

  function addMedicineFromCatalog(p) {
    if (!p) return;
    setMeds((prev) => [...prev, { productId: p._id, name: p.name, dosage: "", frequency: "", duration: "", notes: "" }]);
    setMedQuery("");
    setMedResults([]);
  }

  return (
    <div>
      <div className="text-2xl font-bold text-slate-800">OPD Token Search</div>

      <div className="mt-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 max-w-xl">
        <input
          className="w-full px-4 py-3 rounded-xl border border-red-300 focus:outline-none"
          placeholder="Enter Token (ex: OPD-20260108-4321)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button className="mt-4 w-[180px] py-2 rounded-xl bg-blue-600 text-white font-semibold" onClick={search}>
          Search
        </button>

        {msg && <div className="mt-3 text-sm text-red-700">{msg}</div>}
      </div>

      {appointment && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Patient Details</span>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">{appointment.status}</span>
            </div>

            <div className="mt-3 text-sm text-slate-700 space-y-1">
              <div>
                <span className="text-slate-500">Token:</span> {appointment.token}
              </div>
              <div>
                <span className="text-slate-500">Name:</span> {appointment.userId?.name}
              </div>
              <div>
                <span className="text-slate-500">Phone:</span> {appointment.userId?.phone}
              </div>
              <div>
                <span className="text-slate-500">Email:</span> {appointment.userId?.email}
              </div>
              <div>
                <span className="text-slate-500">Date/Time:</span> {appointment.date} {appointment.slot}
              </div>
              <div>
                <span className="text-slate-500">Payment:</span> {appointment.paymentStatus}
              </div>
              <div>
                <span className="text-slate-500">Notes:</span> {appointment.notes || "-"}
              </div>
            </div>

            {completeMsg && <div className="mt-3 text-sm">{completeMsg}</div>}

            <button
              type="button"
              onClick={markCompleted}
              disabled={completeBusy || appointment.status === "completed" || appointment.status === "cancelled"}
              className="mt-4 px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-60"
            >
              {appointment.status === "completed" ? "Completed" : completeBusy ? "Updating..." : "Mark Completed"}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="font-bold text-slate-800">Create Prescription</div>

            <div className="mt-3">
              <div className="text-xs text-slate-600 mb-1">Diagnosis</div>
              <input className="w-full px-3 py-2 rounded-xl border border-slate-300" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
            </div>

            <div className="mt-3">
              <div className="text-xs text-slate-600 mb-1">Medicines</div>

              <div className="relative">
                <input
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  placeholder="Search medicine and select (ex: Paracetamol)"
                  value={medQuery}
                  onChange={(e) => setMedQuery(e.target.value)}
                />
                {(medLoading || medResults.length > 0) && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {medLoading && <div className="px-3 py-2 text-sm text-slate-500">Searching...</div>}
                    {medResults.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => addMedicineFromCatalog(p)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                      >
                        <div className="font-semibold text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-500">
                          {p.category || "Medicine"} • ₹{p.price}
                        </div>
                      </button>
                    ))}
                    {!medLoading && medResults.length === 0 && medQuery.trim() && (
                      <div className="px-3 py-2 text-sm text-slate-500">No medicines found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 mt-3">
                {meds.map((m, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <input className="px-3 py-2 rounded-xl border border-slate-300" placeholder="Medicine" value={m.name} onChange={(e) => updateMed(i, "name", e.target.value)} />
                    <input className="px-3 py-2 rounded-xl border border-slate-300" placeholder="Dosage" value={m.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} />
                    <input className="px-3 py-2 rounded-xl border border-slate-300" placeholder="Frequency" value={m.frequency} onChange={(e) => updateMed(i, "frequency", e.target.value)} />
                    <input className="px-3 py-2 rounded-xl border border-slate-300" placeholder="Duration" value={m.duration} onChange={(e) => updateMed(i, "duration", e.target.value)} />
                    <input className="px-3 py-2 rounded-xl border border-slate-300" placeholder="Notes" value={m.notes} onChange={(e) => updateMed(i, "notes", e.target.value)} />
                  </div>
                ))}
              </div>
              <button className="mt-2 text-sm font-semibold text-blue-700" onClick={addMed}>
                + Add medicine
              </button>
            </div>

            <div className="mt-3">
              <div className="text-xs text-slate-600 mb-1">Instructions</div>
              <textarea className="w-full px-3 py-2 rounded-xl border border-slate-300" rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
            </div>

            {prescMsg && <div className="mt-3 text-sm">{prescMsg}</div>}

            <button className="mt-4 px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold" onClick={sendPrescription}>
              Send to Medical Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
