import React from "react";

export default function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-300 rounded-2xl shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="text-lg font-bold text-slate-800">{title}</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
