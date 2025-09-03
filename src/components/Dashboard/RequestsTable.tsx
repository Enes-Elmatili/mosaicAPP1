import { useMemo } from 'react';
import { api } from '../../lib/api';
import { Badge } from '../ui';

export type RequestItem = {
  id: number;
  propertyId: string;
  serviceType: string;
  priority?: string | null;
  status: string;
  providerId: string;
  createdAt: string;
};

export default function RequestsTable({ items, onStatusChange }: { items: RequestItem[]; onStatusChange: (id: number, status: string) => void }) {
  const columns = useMemo(() => ([
    { key: 'id', label: 'ID' },
    { key: 'propertyId', label: 'Propriété' },
    { key: 'serviceType', label: 'Service' },
    { key: 'priority', label: 'Priorité' },
    { key: 'status', label: 'Statut' },
    { key: 'providerId', label: 'Assigné' },
    { key: 'createdAt', label: 'Créée' },
    { key: 'actions', label: '' },
  ]), []);

  async function patchStatus(id: number, status: string) {
    await api(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    onStatusChange(id, status);
  }

  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => <th key={c.key as string} className="text-left font-medium px-3 py-2">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-3 py-2">#{r.id}</td>
              <td className="px-3 py-2">{r.propertyId}</td>
              <td className="px-3 py-2">{r.serviceType}</td>
              <td className="px-3 py-2">{r.priority ? <Badge>{r.priority}</Badge> : '-'}</td>
              <td className="px-3 py-2">
                <select className="border rounded px-2 py-1" value={r.status} onChange={(e) => patchStatus(r.id, e.target.value)}>
                  <option value="open">Ouvert</option>
                  <option value="in_progress">En cours</option>
                  <option value="done">Terminé</option>
                  <option value="canceled">Annulé</option>
                </select>
              </td>
              <td className="px-3 py-2">{r.providerId}</td>
              <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="px-3 py-2 text-right">
                <button className="underline">Voir</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-gray-500">Aucune demande</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

