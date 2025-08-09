import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/UI/Card';
import { Badge } from '../../../components/UI/Badge';
import { Skeleton } from '../../../components/UI/Skeleton';
import { Empty } from '../../../components/UI/Empty';
import { ErrorMessage } from '../../../components/UI/Error';
import { api } from '../../../lib/api';
import type { MaintenanceRequest, Priority, ServiceType } from '../../../types/request';

type ApiList = { items: MaintenanceRequest[]; total: number; page: number; pageSize: number };

export default function RequestsListPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<MaintenanceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [propertyId, setPropertyId] = useState('');
  const [priority, setPriority] = useState<Priority | ''>('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (status) params.set('status', status);
        if (serviceType) params.set('serviceType', serviceType);
        if (propertyId) params.set('propertyId', propertyId);
        const data = await api<ApiList>(`/requests?${params.toString()}`);
        setItems(data.items);
        setTotal(data.total);
      } catch (e: any) {
        setError(e?.message ?? 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    })();
  }, [page, pageSize, status, serviceType, propertyId]);

  if (loading)
    return (
      <ul className="space-y-2">
        {[1, 2, 3].map((i) => (
          <li key={i}>
            <Skeleton className="h-12 rounded" />
          </li>
        ))}
      </ul>
    );
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (items.length === 0)
    return <Empty message="Aucune demande." children={<Link to="/app/tenant/requests/new" className="text-primary-600 hover:underline">Créer</Link>} />;

  return (
    <div className="space-y-4">
      <form className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-sm">Statut</label>
          <input className="border rounded px-2 py-1" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="ex: pending" />
        </div>
        <div>
          <label className="block text-sm">Type</label>
          <select className="border rounded px-2 py-1" value={serviceType} onChange={(e) => setServiceType(e.target.value as any)}>
            <option value="">Tous</option>
            <option value="general">Général</option>
            <option value="plumbing">Plomberie</option>
            <option value="electrical">Électricité</option>
            <option value="hvac">CVC</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Propriété</label>
          <input className="border rounded px-2 py-1" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} placeholder="ID" />
        </div>
        <button type="button" className="px-3 py-1 border rounded" onClick={() => { setStatus(''); setServiceType(''); setPropertyId(''); }}>Réinitialiser</button>
      </form>

      <ul className="space-y-4">
        {items.map((r) => (
          <li key={r.id}>
            <Card>
              <Link to={`/app/tenant/requests/${r.id}`} className="flex justify-between items-center">
                <strong>Demande #{r.id}</strong>
                <Badge variant={r.status}>{String(r.status).replace('_', ' ')}</Badge>
                <time className="text-sm text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</time>
              </Link>
            </Card>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2">
        <button className="px-3 py-1 border rounded" disabled={page<=1} onClick={() => setPage((p) => Math.max(1, p-1))}>Précédent</button>
        <span>Page {page}</span>
        <button className="px-3 py-1 border rounded" disabled={(page * pageSize) >= total} onClick={() => setPage((p) => p+1)}>Suivant</button>
      </div>
    </div>
  );
}
