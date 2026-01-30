import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import api from "../lib/api";
import { useParams } from "react-router-dom";

function todayStr() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function DoctorDetail() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/doctors/${id}`);
      setDoctor(data.doctor);
      setSlot(data.doctor.availableSlots?.[0] || "");
    })();
  }, [id]);

  async function book() {
    setMsg("");
    try {
      const { data } = await api.post("/appointments/create", { doctorId: id, date, slot, notes });

      const options = {
        key: data.razorpay.keyId,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        name: "Government Hospital Portal",
        description: `Appointment ${data.appointment._id}`,
        order_id: data.razorpay.orderId,
        handler: async function (response) {
          try {
            const verify = await api.post("/appointments/verify", {
              appointmentId: data.appointment._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setMsg(`✅ Appointment booked! Token: ${verify.data.appointment.token}`);
          } catch (e) {
            setMsg(e?.response?.data?.message || "Payment verification failed");
          }
        },
        theme: { color: "#0f172a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Booking failed");
    }
  }

  if (!doctor) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex gap-4">
            <img
              src={doctor.imageUrl || "https://via.placeholder.com/140x140?text=Doctor"}
              className="w-28 h-28 rounded-2xl object-cover border"
            />
            <div className="flex-1">
              <div className="text-xl font-bold">{doctor.name}</div>
              <div className="text-slate-600">{doctor.specialty}</div>
              <div className="text-sm text-slate-500">{doctor.hospital}</div>
              <div className="mt-2 font-semibold">Consultation Fee: ₹{doctor.fee}</div>
            </div>
          </div>

          {doctor.bio && <div className="mt-4 text-sm text-slate-700">{doctor.bio}</div>}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-slate-600 mb-1">Date</div>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <div className="text-xs text-slate-600 mb-1">Slot</div>
              <select
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
              >
                {doctor.availableSlots.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-slate-600 mb-1">Notes (optional)</div>
              <input
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Symptoms..."
              />
            </div>
          </div>

          {msg && <div className="mt-4 text-sm">{msg}</div>}

          <button className="mt-4 px-5 py-2 rounded-xl bg-slate-800 text-white" onClick={book}>
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
