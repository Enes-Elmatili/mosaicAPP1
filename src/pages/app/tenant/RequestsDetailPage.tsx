import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Badge, Button, Card, ErrorMessage, Skeleton } from '../../../components/UI';
import { getRequest, updateRequestStatus } from '../../../services/requests';
import type { MaintenanceRequest, Priority } from '../../../types/request';

function StatusBadge({ status }: { status: MaintenanceRequest['status'] }) {
  const map = {
    open: { label: 'Ouverte', tone: 'success' },
    in_progress: { label: 'En cours', tone: 'warning' },
    closed: { label: 'Clôturée', tone: 'neutral' },
  } as const;
  const s = map[status];
  return <Badge variant={s.tone}>{s.label}</Badge>;
}

const RequestsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [item, setItem] = useState<MaintenanceRequest | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    getRequest(Number(id))
      .then((r) => setItem(r))
      .catch((e: any) => setErr(e?.message ?? 'Demande introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  async function setStatus(status: MaintenanceRequest['status']) {
    if (!item) return;
    const prev = item;
    setItem({ ...item, status });
    try {
      const updated = await updateRequestStatus(item.id, status);
      setItem(updated.request as MaintenanceRequest);
    } catch (e: any) {
      setItem(prev);
      alert(e?.message ?? 'Échec de la mise à jour');
    }
  }

  if (loading) {
    return (
      <Card>
        <Skeleton className="h-8 w-64 mb-3" />
        <Skeleton className="h-4 w-40 mb-6" />
        <Skeleton className="h-24 w-full" />
      </Card>
    );
  }

  if (err || !item) {
    return (
      <ErrorMessage message={err ?? 'Erreur inconnue'}>
        <div className="mt-3 flex gap-2">
          <Button onClick={() => navigate(-1)}>Retour</Button>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </ErrorMessage>
    );
  }

  return (
    <main className="space-y-4">
      <nav className="text-sm">
        <Link to="/app/tenant/requests" className="underline">
          Demandes
        </Link>{' '}
        / <span>Demande #{item.id}</span>
      </nav>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Demande #{item.id}</h1>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={item.status} />
              {item.priority && (
                <Badge variant="secondary">
                  Priorité&nbsp;{item.priority === 'high' ? 'Haute' : item.priority === 'medium' ? 'Moyenne' : 'Basse'}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {item.status !== 'closed' && <Button onClick={() => setStatus('closed')}>Clôturer</Button>}
            {item.status === 'open' && <Button onClick={() => setStatus('in_progress')}>Marquer en cours</Button>}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <section>
            <h2 className="font-medium mb-2">Description</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded border">
              <div className="text-gray-500">Propriété</div>
              <div>{item.propertyId}</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-gray-500">Créée le</div>
              <time>{new Date(item.createdAt).toLocaleString()}</time>
            </div>
            <div className="p-3 rounded border">
              <div className="text-gray-500">Mise à jour</div>
              <time>{new Date(item.updatedAt).toLocaleString()}</time>
            </div>
          </section>

          {Array.isArray(item.photos) && item.photos.length > 0 && (
            <section>
              <h2 className="font-medium mb-2">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {item.photos.map((url, i) => (
                  <img key={i} src={url} alt={`photo-${i}`} className="w-full h-32 object-cover rounded" />
                ))}
              </div>
            </section>
          )}
        </div>
      </Card>
    </main>
  );
};

export default RequestsDetailPage;
