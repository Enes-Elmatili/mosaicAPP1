import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Permission, Role } from '../../../types/role';
import { PermissionsAPI, RolesAPI } from '../../../api/roles';
import RoleForm from '../../../components/RoleForm';
import PermissionsPicker from '../../../components/PermissionsPicker';

export default function RoleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [allPerms, setAllPerms] = useState<Permission[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permError, setPermError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [r, perms] = await Promise.all([
          RolesAPI.get(id!),
          PermissionsAPI.list(),
        ]);
        if (!mounted) return;
        setRole(r);
        setAllPerms(perms);
        setSelectedIds(r.permissions.map(p => p.id));
      } catch (e: any) {
        setError(e.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  const currentIds = useMemo(() => new Set(role?.permissions.map(p => p.id) || []), [role]);
  const add = selectedIds.filter(x => !currentIds.has(x));
  const remove = [...currentIds].filter(x => !selectedIds.includes(x));

  async function handleSaveMeta(payload: { name: string; description?: string }) {
    setSaving(true);
    setError(null);
    try {
      const updated = await RolesAPI.update(id!, payload);
      setRole(updated);
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePermissions() {
    setPermError(null);
    try {
      const updated = await RolesAPI.updatePermissions(id!, add, remove);
      setRole(updated);
    } catch (e: any) {
      setPermError(e.message || 'Failed to update permissions');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this role? This cannot be undone.')) return;
    try {
      await RolesAPI.remove(id!);
      navigate('/admin/roles');
    } catch (e: any) {
      setError(e.message || 'Failed to delete');
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!role || !allPerms) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Role: {role.name}</h1>
        <button className="border rounded px-3 py-2 text-red-600" onClick={handleDelete}>Delete</button>
      </div>

      <section className="space-y-3">
        <h2 className="font-medium">Details</h2>
        <RoleForm initial={role} onSubmit={handleSaveMeta} submitLabel={saving ? 'Saving…' : 'Save'} />
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Permissions</h2>
        <PermissionsPicker
          all={allPerms}
          selected={allPerms.filter(p => selectedIds.includes(p.id))}
          onChange={setSelectedIds}
        />
        <div className="flex items-center gap-3">
          <button className="border rounded px-4 py-2" onClick={handleSavePermissions}>
            Save Permissions ({add.length} add, {remove.length} remove)
          </button>
          {permError && <span className="text-red-600 text-sm">{permError}</span>}
        </div>
      </section>
    </div>
  );
}
