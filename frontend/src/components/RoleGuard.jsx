import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function RoleGuard({ allow = [], redirectTo = "/login", children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to={redirectTo} replace />;
  if (allow.length && !allow.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
