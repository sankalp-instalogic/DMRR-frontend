import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

export function AuthGuard() {
  const { auth } = useAuth();

  if (!auth?.accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
