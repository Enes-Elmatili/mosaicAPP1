import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

type Props = {
  permission: string;
  children: ReactNode;
};

/**
 * Render children only if current user has the given permission.
 * Otherwise display a simple Forbidden message.
 */
export default function RequirePermission({ permission, children }: Props) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user || !user.effectivePermissions.includes(permission)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
