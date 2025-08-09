import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';
export default function RequirePermission({ permission }:{permission:'admin'|'owner'|'tenant'|string}){
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div>Chargement…</div>;
  const isDev = import.meta.env.MODE !== 'production';
  const hasMaster = !!(localStorage.getItem('mosaic_master_key') || localStorage.getItem('VITE_MASTER_KEY'));
  if (isDev && hasMaster) return <Outlet />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  const role = (user.role||'tenant').toLowerCase();
  const ok = permission==='admin'? role==='admin'
           : permission==='owner'? ['owner','admin'].includes(role)
           : permission==='tenant'? ['tenant','admin'].includes(role)
           : true;
  if (!ok) return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
