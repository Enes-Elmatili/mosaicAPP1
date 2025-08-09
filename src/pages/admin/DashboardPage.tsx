import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Overview = {
  metrics: {
    totalRequests: number;
    openRequests: number;
    usersCount: number;
    providersCount: number;
  };
  latestRequests: {
    id: number;
    propertyId: string;
    serviceType: string;
    status: string;
    createdAt: string;
  }[];
  latestUsers: {
    id: string;
    email: string;
    role: string;
    createdAt: string;
  }[];
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function masterKey() {
  return (
    localStorage.getItem('mosaic_master_key') ||
    localStorage.getItem('VITE_MASTER_KEY') ||
    ''
  );
}

async function apiGet<T>(path: string): Promise<T> {
  const h = new Headers();
  const mk = masterKey();
  if (mk) h.set('x-master-key', mk);

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: h,
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(await res.text().catch(() => res.statusText));
  }
  return res.json() as Promise<T>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // ✅ correct: le générique ne prend que le type
        const json = await apiGet<Overview>('/admin/overview');
        if (alive) setData(json);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? 'Erreur de chargement');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (err) return <div className="p-6 text-red-700">Erreur: {err}</div>;
  if (!data) return <div className="p-6">Aucune donnée.</div>;

  const { metrics, latestRequests, latestUsers } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard Admin</h1>

      {/* Cards métriques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Demandes totales" value={metrics.totalRequests} />
        <MetricCard title="Demandes ouvertes" value={metrics.openRequests} />
        <MetricCard title="Utilisateurs" value={metrics.usersCount} />
        <MetricCard title="Prestataires" value={metrics.providersCount} />
      </div>

      {/* Dernières demandes */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Dernières demandes</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>ID</Th>
                <Th>Propriété</Th>
                <Th>Service</Th>
                <Th>Statut</Th>
                <Th>Créée</Th>
              </tr>
            </thead>
            <tbody>
              {latestRequests.map((r) => (
                <tr key={r.id} className="border-t">
                  <Td>#{r.id}</Td>
                  <Td>{r.propertyId}</Td>
                  <Td>{r.serviceType}</Td>
                  <Td>
                    <StatusPill status={r.status} />
                  </Td>
                  <Td>{new Date(r.createdAt).toLocaleString()}</Td>
                  <Td>
                    <Link className="underline" to={`/app/tenant/requests/${r.id}`}>
                      Voir
                    </Link>
                  </Td>
                </tr>
              ))}
              {latestRequests.length === 0 && (
                <tr>
                  <Td colSpan={6} className="text-center p-4">
                    Aucune demande récente
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Derniers utilisateurs */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Derniers utilisateurs</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>ID</Th>
                <Th>Email</Th>
                <Th>Rôle</Th>
                <Th>Créé</Th>
              </tr>
            </thead>
            <tbody>
              {latestUsers.map((u) => (
                <tr key={u.id} className="border-t">
                  <Td>{u.id}</Td>
                  <Td>{u.email}</Td>
                  <Td>{u.role}</Td>
                  <Td>{new Date(u.createdAt).toLocaleString()}</Td>
                </tr>
              ))}
              {latestUsers.length === 0 && (
                <tr>
                  <Td colSpan={4} className="text-center p-4">
                    Aucun utilisateur récent
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded border p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-medium px-3 py-2">{children}</th>;
}
function Td({
  children,
  colSpan,
  className = '',
}: {
  children: React.ReactNode;
  colSpan?: number;
  className?: string;
}) {
  return <td colSpan={colSpan} className={`px-3 py-2 ${className}`}>{children}</td>;
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === 'OPEN'
      ? 'bg-green-100 text-green-700'
      : status === 'IN_PROGRESS'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 rounded text-xs ${cls}`}>{status}</span>;
}
