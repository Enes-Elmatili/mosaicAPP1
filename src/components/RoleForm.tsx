import { useEffect, useState } from 'react';
import type { Role } from '../types/role';

type Props = {
  initial?: Partial<Role>;
  onSubmit: (data: { name: string; description?: string }) => Promise<void> | void;
  submitLabel?: string;
};

export default function RoleForm({ initial, onSubmit, submitLabel = 'Save' }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initial?.name ?? '');
    setDescription(initial?.description ?? '');
  }, [initial?.name, initial?.description]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), description: description?.trim() || undefined });
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          className="mt-1 w-full border rounded px-3 py-2"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          minLength={2}
          maxLength={64}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="mt-1 w-full border rounded px-3 py-2"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={256}
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 border rounded px-4 py-2"
      >
        {saving ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
