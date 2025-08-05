import { useEffect, useMemo, useState } from 'react';
import type { Permission } from '../types/role';

type Props = {
  all: Permission[];
  selected: Permission[];
  onChange: (nextSelectedIds: string[]) => void;
  disabled?: boolean;
};

export default function PermissionsPicker({ all, selected, onChange, disabled }: Props) {
  const selectedIds = useMemo(() => new Set(selected.map(p => p.id)), [selected]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // ensure selection is consistent if props change
  }, [selected]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return all.filter(p => p.key.toLowerCase().includes(q) || p.label.toLowerCase().includes(q));
  }, [all, search]);

  function toggle(id: string) {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange([...next]);
  }

  return (
    <div className="space-y-2">
      <input
        placeholder="Search permissions…"
        className="w-full border rounded px-3 py-2"
        value={search}
        onChange={e => setSearch(e.target.value)}
        disabled={disabled}
      />
      <div className="max-h-72 overflow-auto border rounded">
        {filtered.map(p => (
          <label key={p.id} className="flex items-center gap-2 px-3 py-2 border-b last:border-b-0">
            <input
              type="checkbox"
              checked={selectedIds.has(p.id)}
              onChange={() => toggle(p.id)}
              disabled={disabled}
            />
            <div>
              <div className="font-medium text-sm">{p.label}</div>
              <div className="text-xs text-gray-500">{p.key}</div>
            </div>
          </label>
        ))}
        {filtered.length === 0 && <div className="p-3 text-sm text-gray-500">No permissions</div>}
      </div>
    </div>
  );
}
