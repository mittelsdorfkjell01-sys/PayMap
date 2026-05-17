import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem("paymap_token");
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
