import React, { createContext, useContext, useMemo, useState } from "react";

const CartCtx = createContext(null);

function loadCart() {
  try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart());

  function save(next) {
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
  }

  const value = useMemo(() => ({
    items,
    add(product) {
      const next = [...items];
      const idx = next.findIndex((x) => x.productId === product._id);
      if (idx >= 0) next[idx].qty += 1;
      else next.push({ productId: product._id, name: product.name, price: product.price, imageUrl: product.imageUrl, qty: 1 });
      save(next);
    },
    remove(productId) {
      save(items.filter((x) => x.productId !== productId));
    },
    setQty(productId, qty) {
      const next = items.map((x) => (x.productId === productId ? { ...x, qty: Math.max(1, qty) } : x));
      save(next);
    },
    clear() { save([]); },
    subtotal: items.reduce((s, x) => s + x.price * x.qty, 0),
  }), [items]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  return useContext(CartCtx);
}
