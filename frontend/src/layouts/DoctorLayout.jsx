import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function DoctorLayout() {
  const nav = useNavigate();
  const { logout } = useAuth();

  function doLogout() {
    logout();
    nav("/doctor/login");
  }

  const linkClass = ({ isActive }) =>
    "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold " +
    (isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-12">
            <aside className="col-span-12 md:col-span-3 border-r border-slate-200 bg-white">
              <div className="p-5">
                <div className="text-sm text-slate-500">Doctor Portal</div>
                <div className="text-xl font-bold text-slate-900 mt-1">OPD Desk</div>

                <nav className="mt-6 flex flex-col gap-2">
                  <NavLink to="/doctor/token-search" className={linkClass}>
                    <span>🔎</span> <span>Token Search</span>
                  </NavLink>

                  <NavLink to="/doctor/appointments" className={linkClass}>
                    <span>📋</span> <span>My Appointments</span>
                  </NavLink>

                  <NavLink to="/doctor/availability" className={linkClass}>
                    <span>🗓️</span> <span>Availability</span>
                  </NavLink>

                  <button
                    onClick={doLogout}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 text-left"
                  >
                    <span>🚪</span> <span>Logout</span>
                  </button>
                </nav>
              </div>
            </aside>

            <main className="col-span-12 md:col-span-9 bg-slate-50">
              <div className="p-6">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
