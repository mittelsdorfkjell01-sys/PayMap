import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Calculator from "@/pages/Calculator";
import AdminLogin from "@/pages/admin/Login";
import AdminCities from "@/pages/admin/Cities";
import AdminTax from "@/pages/admin/Tax";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Calculator />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/cities"
          element={
            <ProtectedRoute>
              <AdminCities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tax"
          element={
            <ProtectedRoute>
              <AdminTax />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/cities" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
