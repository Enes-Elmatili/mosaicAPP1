/**
 * RequireAuth.tsx
 * Verrouille l'accès aux routes enfants si non authentifié.
 */
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context"; // ✅ on ne garde que useAuth

export default function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // ⏳ gestion état de chargement
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}
