import React from "react";
import { Link } from "react-router-dom";

export default function IconTile({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
    >
      <div className="w-12 h-12 rounded-2xl bg-fuchsia-50 border border-fuchsia-100 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-xs font-semibold text-center leading-snug text-slate-700">{label}</div>
    </Link>
  );
}
