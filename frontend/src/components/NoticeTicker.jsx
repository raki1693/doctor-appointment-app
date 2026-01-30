import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

// A small, reusable marquee/ticker bar that shows holidays + admin announcements.
// - Polls periodically so updates by admin appear without refresh.
// - Uses CSS marquee animation from index.css.

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function NoticeTicker({ className = "", mode = "auto" }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const date = todayISO();
        const { data } = await api.get(`/public/ticker?date=${encodeURIComponent(date)}`);
        if (!alive) return;
        const next = Array.isArray(data?.messages) ? data.messages.filter(Boolean) : [];
        setMessages(next);
      } catch {
        // ignore
      }
    };

    load();
    const id = setInterval(load, 15000); // keep it fresh for admin updates

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const text = useMemo(() => {
    if (!messages.length) return "";
    return messages.join("   •   ");
  }, [messages]);

  if (!text) return null;

  // mode:
  // - "auto" : normal speed (login top)
  // - "slow" : slower speed (used in headers)
  // Use the seamless marquee-loop (two copies of the same text).
  const anim = mode === "slow" ? "animate-marquee-loop-slow" : "animate-marquee-loop";

  return (
    <div
      className={`marquee-pause-on-hover w-full bg-amber-50 border-b border-amber-200 text-amber-900 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="max-w-5xl mx-auto px-4 py-2 overflow-hidden">
        <div className={`inline-flex w-max whitespace-nowrap ${anim}`}>
          <span className="pr-12">{text}</span>
          <span className="pr-12" aria-hidden="true">{text}</span>
        </div>
      </div>
    </div>
  );
}
