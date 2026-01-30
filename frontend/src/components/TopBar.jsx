import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, CircleHelp, QrCode, LogOut } from "lucide-react";
import { useAuth } from "../state/auth";
import { useCart } from "../state/cart";
import api from "../lib/api";
import NoticeTicker from "./NoticeTicker";

export default function TopBar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const nav = useNavigate();

  const [open, setOpen] = useState(false);
  const [ann, setAnn] = useState([]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const date = new Date().toISOString().slice(0, 10);
        const { data } = await api.get(`/public/announcements?date=${encodeURIComponent(date)}`);
        if (!alive) return;
        setAnn(Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
    };

    load();
    const id = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const lastSeenKey = "lastSeenAnnouncementAt";
  const newCount = useMemo(() => {
    const lastSeen = Number(localStorage.getItem(lastSeenKey) || 0);
    return ann.filter((a) => {
      // Treat updates as new notifications too.
      const t = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      return t && t > lastSeen;
    }).length;
  }, [ann]);

  function markSeen() {
    const latest = Math.max(
      0,
      ...ann
        .map((a) => new Date(a?.updatedAt || a?.createdAt || 0).getTime())
        .filter(Boolean)
    );
    localStorage.setItem(lastSeenKey, String(latest || Date.now()));
  }

  return (
    <div className="bg-sky-200 border-b border-sky-300">
      {/* ✅ Live notices (holidays + announcements) */}
      <NoticeTicker mode="slow" />

      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center text-sky-700 font-bold">
          GH
        </div>

        <div className="flex-1">
          <div className="font-semibold leading-tight">{user?.name || "User"}</div>
          <div className="text-xs text-slate-700">CRN: {user?._id?.slice(-12) || "—"}</div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-white/50" title="QR">
            <QrCode size={18} />
          </button>
          <div className="relative">
            <button
              className="p-2 rounded-lg hover:bg-white/50 relative"
              title="Notifications"
              onClick={() => {
                const next = !open;
                setOpen(next);
                if (next) markSeen();
              }}
            >
              <Bell size={18} />
              {newCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center">
                  {newCount}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-[340px] max-w-[85vw] bg-white border border-slate-200 shadow-lg rounded-2xl overflow-hidden z-50">
                <div className="px-4 py-3 bg-slate-50 border-b text-sm font-semibold text-slate-900">
                  Notifications
                </div>
                <div className="max-h-[300px] overflow-auto">
                  {ann.map((a) => (
                    <div key={a._id} className="px-4 py-3 border-b last:border-b-0">
                      <div className="font-semibold text-slate-900">{a.title}</div>
                      <div className="text-xs text-slate-600 mt-1">{a.message}</div>
                      <div className="text-[11px] text-slate-500 mt-2">
                        {(a.updatedAt || a.createdAt)
                          ? new Date(a.updatedAt || a.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  ))}

                  {!ann.length && (
                    <div className="px-4 py-6 text-sm text-slate-500">No notifications.</div>
                  )}
                </div>
                <button
                  className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
          <button className="p-2 rounded-lg hover:bg-white/50" title="Help">
            <CircleHelp size={18} />
          </button>

          <Link to="/cart" className="text-sm font-semibold px-3 py-2 rounded-lg bg-white/70 hover:bg-white">
            Cart ({items.length})
          </Link>

          <button
            className="p-2 rounded-lg hover:bg-white/50"
            title="Logout"
            onClick={() => {
              logout();
              nav("/login");
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
