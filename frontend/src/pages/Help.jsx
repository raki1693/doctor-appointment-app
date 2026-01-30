import React from "react";
import TopBar from "../components/TopBar";

export default function Help() {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h1 className="text-xl font-bold">Help & Support</h1>
          <p className="mt-2 text-slate-700">
            This is a starter portal UI. Replace the helpline numbers and support content for your hospital.
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <div><b>Emergency Helpline:</b> +\change this</div>
            <div><b>Support Email:</b> +\change this</div>
            <div><b>Working Hours:</b> 24x7</div>
          </div>
        </div>
      </div>
    </div>
  );
}
