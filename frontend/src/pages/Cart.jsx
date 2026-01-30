import React, { useState } from "react";
import TopBar from "../components/TopBar";
import { useCart } from "../state/cart";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Cart() {
  const { items, subtotal, remove, setQty, clear } = useCart();
  const [address, setAddress] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  async function createOrder() {
    setErr("");
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        shippingAddress: address,
      };
      const { data } = await api.post("/orders", payload);
      nav(`/checkout/${data.order._id}`);
    } catch (e) {
      setErr(e?.response?.data?.message || "Could not create order");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Cart</h1>
          <Link className="underline text-sm" to="/medicines">Continue shopping</Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-6 text-slate-600">Your cart is empty.</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              {items.map((i) => (
                <div key={i.productId} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex gap-3">
                  <img src={i.imageUrl || "https://via.placeholder.com/120x120?text=Med"} className="w-20 h-20 rounded-2xl object-cover border" />
                  <div className="flex-1">
                    <div className="font-semibold">{i.name}</div>
                    <div className="text-sm text-slate-600">₹{i.price}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button className="px-3 py-1 border rounded-lg" onClick={() => setQty(i.productId, i.qty - 1)}>-</button>
                      <div className="w-10 text-center">{i.qty}</div>
                      <button className="px-3 py-1 border rounded-lg" onClick={() => setQty(i.productId, i.qty + 1)}>+</button>
                      <button className="ml-auto text-sm underline" onClick={() => remove(i.productId)}>Remove</button>
                    </div>
                  </div>
                  <div className="font-bold">₹{i.price * i.qty}</div>
                </div>
              ))}
              <button className="text-sm underline" onClick={clear}>Clear cart</button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm h-fit">
              <div className="font-semibold">Order Summary</div>
              <div className="mt-2 text-sm flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold">₹{subtotal}</span>
              </div>

              <div className="mt-4">
                <div className="text-xs text-slate-600 mb-1">Shipping Address</div>
                <textarea
                  className="w-full min-h-[90px] px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-sky-300"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No, Street, Village/City, District, State, Pincode"
                />
              </div>

              {err && <div className="mt-3 text-sm text-red-700">{err}</div>}

              <button
                className="mt-4 w-full py-2 rounded-xl bg-slate-800 text-white font-semibold"
                onClick={createOrder}
                disabled={!address.trim()}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
