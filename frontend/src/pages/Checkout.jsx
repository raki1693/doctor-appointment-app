import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import api from "../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../state/cart";

export default function Checkout() {
  const { id } = useParams();
  const nav = useNavigate();
  const { clear } = useCart();
  const [order, setOrder] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.order);
    })();
  }, [id]);

  async function pay() {
    setMsg("");
    try {
      const { data } = await api.post("/payments/razorpay/create-order", { orderId: id });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Government Hospital Portal",
        description: `Order ${id}`,
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          try {
            await api.post("/payments/razorpay/verify", {
              orderId: id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clear();
            nav("/orders");
          } catch (e) {
            setMsg(e?.response?.data?.message || "Verification failed");
          }
        },
        theme: { color: "#0f172a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Could not start payment");
    }
  }

  if (!order) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h1 className="text-xl font-bold">Checkout</h1>

          <div className="mt-3 text-sm text-slate-600">Order ID: {order._id}</div>

          <div className="mt-4 space-y-2">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{it.name} × {it.qty}</span>
                <span>₹{it.price * it.qty}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>₹{order.subtotal}</span>
          </div>

          <div className="mt-4 text-sm">
            Payment status: <span className="font-semibold">{order.paymentStatus}</span>
          </div>

          {msg && <div className="mt-3 text-sm text-red-700">{msg}</div>}

          {order.paymentStatus !== "paid" && (
            <button className="mt-4 px-5 py-2 rounded-xl bg-slate-800 text-white" onClick={pay}>
              Pay with Razorpay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
