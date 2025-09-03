import { Navigate } from "react-router-dom";
import { useAuth } from "@/context"; // ✅ uniquement useAuth

function pickDefaultPath(roles?: string[] | null): string {
  const r = (roles || []).map((x) => (x || "").toUpperCase());

  if (r.includes("ADMIN")) return "/admin/dashboard";
  if (r.includes("PROVIDER")) return "/app/provider/missions";
  if (r.includes("CLIENT")) return "/app/client/dashboard";

  return "/";
}

export default function AppRoleRedirect() {
  const { user } = useAuth();
  const to = pickDefaultPath(user?.roles);
  return <Navigate to={to} replace />;
}
