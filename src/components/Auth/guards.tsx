import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { hasAnyPermission, hasRole } from './permission';

export function RequirePermission({ anyOf, children }:{
  anyOf: string[]; // pass one or more permission keys
  children: JSX.Element;
}) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-6">Checking access…</div>;
  if (!user || !hasAnyPermission(user, anyOf)) {
    return <Navigate to="/unauthorized" replace state={{ from: loc }} />;
  }
  return children;
}

export function RequireRole({ role, children }:{
  role: string;
  children: JSX.Element;
}) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-6">Checking access…</div>;
  if (!user || !hasRole(user, role)) {
    return <Navigate to="/unauthorized" replace state={{ from: loc }} />;
  }
  return children;
}
