import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Guard from "./components/Guard.jsx";
import EmergencyAlertsListener from "./components/EmergencyAlertsListener.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import Doctors from "./pages/Doctors.jsx";
import DoctorDetail from "./pages/DoctorDetail.jsx";
import Appointments from "./pages/Appointments.jsx";
import Medicines from "./pages/Medicines.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import Profile from "./pages/Profile.jsx";
import Help from "./pages/Help.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import SymptomChecker from "./pages/SymptomChecker.jsx";

import RoleGuard from "./components/RoleGuard.jsx";
import DoctorLayout from "./layouts/DoctorLayout.jsx";
import DoctorLogin from "./pages/doctor/DoctorLogin.jsx";
import TokenSearch from "./pages/doctor/TokenSearch.jsx";
import DoctorAppointments from "./pages/doctor/DoctorAppointments.jsx";

import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminDoctors from "./pages/admin/AdminDoctors.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminAppointments from "./pages/admin/AdminAppointments.jsx";
import AdminPharmacyOrders from "./pages/admin/AdminPharmacyOrders.jsx";
import AdminDepartments from "./pages/admin/AdminDepartments.jsx";
import AdminHolidays from "./pages/admin/AdminHolidays.jsx";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminTokenRunning from "./pages/admin/AdminTokenRunning.jsx";
import DoctorAvailability from "./pages/doctor/DoctorAvailability.jsx";

export default function App() {
  return (
    <>
      {/* Global listener: shows full-screen Emergency Alert to relatives when patient triggers Emergency */}
      <EmergencyAlertsListener />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <Guard>
            <Home />
          </Guard>
        }
      />

      <Route
        path="/doctors"
        element={
          <Guard>
            <Doctors />
          </Guard>
        }
      />
      <Route
        path="/doctors/:id"
        element={
          <Guard>
            <DoctorDetail />
          </Guard>
        }
      />

      <Route
        path="/appointments"
        element={
          <Guard>
            <Appointments />
          </Guard>
        }
      />

      <Route
        path="/medicines"
        element={
          <Guard>
            <Medicines />
          </Guard>
        }
      />

      <Route
        path="/cart"
        element={
          <Guard>
            <Cart />
          </Guard>
        }
      />

      <Route
        path="/checkout/:id"
        element={
          <Guard>
            <Checkout />
          </Guard>
        }
      />

      <Route
        path="/orders"
        element={
          <Guard>
            <Orders />
          </Guard>
        }
      />

      <Route
        path="/profile"
        element={
          <Guard>
            <Profile />
          </Guard>
        }
      />

      <Route
        path="/help"
        element={
          <Guard>
            <Help />
          </Guard>
        }
      />

      <Route
        path="/symptom-checker"
        element={
          <Guard>
            <SymptomChecker />
          </Guard>
        }
      />



{/* Doctor portal */}
<Route path="/doctor/login" element={<DoctorLogin />} />
<Route
  path="/doctor"
  element={
    <RoleGuard allow={["doctor"]} redirectTo="/doctor/login">
      <DoctorLayout />
    </RoleGuard>
  }
>
  <Route index element={<Navigate to="token-search" replace />} />
  <Route path="token-search" element={<TokenSearch />} />
  <Route path="appointments" element={<DoctorAppointments />} />
  <Route path="availability" element={<DoctorAvailability />} />
</Route>

{/* Admin portal */}
<Route path="/admin/login" element={<AdminLogin />} />
<Route
  path="/admin"
  element={
    <RoleGuard allow={["admin"]} redirectTo="/admin/login">
      <AdminLayout />
    </RoleGuard>
  }
>
  <Route index element={<AdminDashboard />} />
  <Route path="doctors" element={<AdminDoctors />} />
  <Route path="products" element={<AdminProducts />} />
  <Route path="appointments" element={<AdminAppointments />} />
  <Route path="pharmacy-orders" element={<AdminPharmacyOrders />} />
  <Route path="departments" element={<AdminDepartments />} />
  <Route path="holidays" element={<AdminHolidays />} />
  <Route path="announcements" element={<AdminAnnouncements />} />
  <Route path="token-running" element={<AdminTokenRunning />} />
  <Route path="reports" element={<AdminReports />} />
</Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
