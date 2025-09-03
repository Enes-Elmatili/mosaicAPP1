import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';
export default function ForbidRole({ role }:{role:string}){
  const { user } = useAuth();
  const location = useLocation();
  const isDev = import.meta.env.MODE !== 'production';
  const hasMaster = !!(localStorage.getItem('mosaic_master_key') || localStorage.getItem('VITE_MASTER_KEY'));
  if (isDev && hasMaster) return <Outlet />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if ((user.role||'').toLowerCase() === role.toLowerCase()) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
