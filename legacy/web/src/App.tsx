import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Calculator from "@/pages/Calculator";
import Placeholder from "@/pages/Placeholder";
import AdminLogin from "@/pages/admin/Login";
import AdminCities from "@/pages/admin/Cities";
import AdminTax from "@/pages/admin/Tax";
import AdminRegimes from "@/pages/admin/Regimes";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Calculator />} />

        {/* Not built yet — bare placeholders so navigation resolves. */}
        <Route path="/ranking" element={<Placeholder title="Ranking" active="ranking" />} />
        <Route path="/guide" element={<Placeholder title="Guide" active="guide" />} />
        <Route path="/profil" element={<Placeholder title="Profil" />} />
        <Route path="/einstellungen" element={<Placeholder title="Einstellungen" />} />

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
        <Route
          path="/admin/regimes"
          element={
            <ProtectedRoute>
              <AdminRegimes />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/cities" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
