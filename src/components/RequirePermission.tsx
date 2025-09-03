/**
 * RequirePermission.tsx
 * Verrouille l'accès aux routes enfants selon les rôles.
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context";

type Role = "admin" | "provider" | "client";

export default function RequirePermission({ permission }: { permission: Role }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Chargement…</div>;
  }

  const isDev = import.meta.env.MODE !== "production";
  const hasMaster =
    !!(
      localStorage.getItem("mosaic_master_key") ||
      localStorage.getItem("VITE_MASTER_KEY")
    );

  // ⚡ En dev, bypass avec master key
  if (isDev && hasMaster) {
    return <Outlet />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 🔑 Normalisation des rôles (tolère ADMIN / ROLE_ADMIN / provider etc.)
  const roles = (user.roles || []).map((r) =>
    r.toLowerCase().replace("role_", "")
  );

  console.debug("🔑 RequirePermission → roles=", roles, "needed=", permission);

  const ok =
    permission === "admin"
      ? roles.includes("admin")
      : permission === "provider"
      ? roles.includes("provider") || roles.includes("admin")
      : permission === "client"
      ? roles.includes("client") || roles.includes("admin")
      : false;

  if (!ok) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
