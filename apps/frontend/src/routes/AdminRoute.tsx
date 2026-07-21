import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function AdminRoute() {
  const { hasRole } = useAuth();

  if (!hasRole("ADM")) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
