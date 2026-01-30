import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function Guard({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
