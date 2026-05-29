"use client";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/auth-provider";

export function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
