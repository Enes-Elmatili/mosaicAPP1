import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Role } from '../../../types/role';
import { RolesAPI } from '../../../api/roles';
import RoleForm from '../../../components/RoleForm';

export default function RolesList() {
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const data = await RolesAPI.list();
      setRoles(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleCreate(payload: { name: string; description?: string }) {
    const role = await RolesAPI.create(payload);
    navigate(`/admin/roles/${role.id}`);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Roles</h1>
        <button className="border rounded px-3 py-2" onClick={() => setCreating(v => !v)}>
          {creating ? 'Cancel' : 'Create Role'}
        </button>
      </div>

      {creating && (
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">New Role</h2>
          <RoleForm onSubmit={handleCreate} submitLabel="Create" />
        </div>
      )}

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && roles && (
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Permissions</th>
                <th className="text-left p-3">Updated</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.permissions?.length ?? 0}</td>
                  <td className="p-3">{new Date(r.updatedAt).toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <Link className="underline" to={`/admin/roles/${r.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr><td className="p-3 text-gray-500" colSpan={4}>No roles yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
