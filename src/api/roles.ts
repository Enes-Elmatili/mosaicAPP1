import type { Role, Permission } from '../types/role';
import { http } from '../utils/http';

export const RolesAPI = {
  list: () => http<Role[]>('/api/roles'),
  get: (id: string) => http<Role>(`/api/roles/${id}`),
  create: (payload: Pick<Role, 'name' | 'description'>) =>
    http<Role>('/api/roles', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<Pick<Role, 'name' | 'description'>>) =>
    http<Role>(`/api/roles/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id: string) =>
    fetch(`/api/roles/${id}`, { method: 'DELETE' }).then(r => {
      if (!r.ok) throw new Error('Delete failed');
    }),
  updatePermissions: (id: string, add: string[], remove: string[]) =>
    http<Role>(`/api/roles/${id}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ add, remove }),
    }),
};

export const PermissionsAPI = {
  list: () => http<Permission[]>('/api/permissions'),
  create: (payload: Pick<Permission, 'key' | 'label' | 'description'>) =>
    http<Permission>('/api/permissions', { method: 'POST', body: JSON.stringify(payload) }),
};
