import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';
type S = { from?: string } | undefined;

export default function RequireAuth(){
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as S)?.from || `${location.pathname}${location.search}`;
  if (loading) return <div>Chargement…</div>;
  const isDev = import.meta.env.MODE !== 'production';
  const hasMaster = !!(localStorage.getItem('mosaic_master_key') || localStorage.getItem('VITE_MASTER_KEY'));
  if (isDev && !user && hasMaster) return <Outlet />;
  if (!user) return <Navigate to="/login" replace state={{ from }} />;
  return <Outlet />;
}
