import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function AdminLayout() {
  const nav = useNavigate();
  const { logout } = useAuth();

  function doLogout() {
    logout();
    nav("/admin/login");
  }

  const linkClass = ({ isActive }) =>
    "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold " +
    (isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-12">
            <aside className="col-span-12 md:col-span-3 border-r border-slate-200 bg-white">
              <div className="p-5">
                <div className="text-sm text-slate-500">Admin Portal</div>
                <div className="text-xl font-bold text-slate-900 mt-1">Hospital Control Room</div>

                <nav className="mt-6 flex flex-col gap-2">
                  <NavLink to="/admin" end className={linkClass}>
                    <span>📊</span> <span>Dashboard</span>
                  </NavLink>
                  <NavLink to="/admin/appointments" className={linkClass}>
                    <span>🗓️</span> <span>Appointments</span>
                  </NavLink>
                  <NavLink to="/admin/doctors" className={linkClass}>
                    <span>👨‍⚕️</span> <span>Doctors</span>
                  </NavLink>
                  <NavLink to="/admin/departments" className={linkClass}>
                    <span>🏥</span> <span>Departments</span>
                  </NavLink>
                  <NavLink to="/admin/products" className={linkClass}>
                    <span>💊</span> <span>Medicines</span>
                  </NavLink>
                  <NavLink to="/admin/pharmacy-orders" className={linkClass}>
                    <span>🧾</span> <span>Pharmacy Orders</span>
                  </NavLink>
                  <NavLink to="/admin/holidays" className={linkClass}>
                    <span>📅</span> <span>Holidays</span>
                  </NavLink>
                  <NavLink to="/admin/announcements" className={linkClass}>
                    <span>📢</span> <span>Announcements</span>
                  </NavLink>
                  <NavLink to="/admin/token-running" className={linkClass}>
                    <span>🔢</span> <span>Token Running</span>
                  </NavLink>
                  <NavLink to="/admin/reports" className={linkClass}>
                    <span>📄</span> <span>Reports Export</span>
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
