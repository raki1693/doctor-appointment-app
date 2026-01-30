import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import api from "../lib/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get("/orders/mine");
    setOrders(data.orders);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-xl font-bold">My Orders</h1>

        {loading ? (
          <div className="mt-6">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="mt-6 text-slate-600">No orders yet.</div>
        ) : (
          <div className="mt-6 space-y-3">
            {orders.map((o) => (
              <div key={o._id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between">
                  <div className="font-semibold">Order {o._id.slice(-6)}</div>
                  <div className="font-bold">₹{o.subtotal}</div>
                </div>
                <div className="text-sm text-slate-600">
                  Payment: <span className="font-semibold">{o.paymentStatus}</span> •
                  Delivery: <span className="font-semibold"> {o.fulfillmentStatus}</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">Items: {o.items.map((x) => x.name).join(", ")}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
