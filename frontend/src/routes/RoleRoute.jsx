import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function RoleRoute({ role, children }) {
  const { user, isBooting } = useAuth();

  if (isBooting) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;

  return children;
}
