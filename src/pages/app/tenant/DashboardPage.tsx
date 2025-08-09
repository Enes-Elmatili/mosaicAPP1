
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../../components/Layout/PageWrapper';

type Request = { id: number; status: string; description: string };

const DashboardPage: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/requests`)
      .then(res => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((data: Request[]) => setRequests(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading || error) {
    return (
      <PageWrapper title="Tableau de bord locataire">
        {loading && <p>Chargement…</p>}
        {error && <p className="text-red-600">{error}</p>}
      </PageWrapper>
    );
  }

  const total = requests.length;
  const pending = requests.filter(r => r.status === 'PUBLISHED').length;
  const others = total - pending;
  const recent = requests.slice(0, 5);

  return (
    <PageWrapper title="Tableau de bord locataire">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-medium">Total demandes</h2>
          <p className="text-2xl">{total}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-medium">En attente</h2>
          <p className="text-2xl">{pending}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-medium">Autres statuts</h2>
          <p className="text-2xl">{others}</p>
        </div>
      </div>
      <div className="flex space-x-4">
        <Link to="/app/tenant/requests/new" className="btn-primary">Nouvelle demande</Link>
        <Link to="/app/tenant/requests" className="btn-secondary">Voir mes demandes</Link>
      </div>
      <section>
        <h2 className="text-xl font-semibold">Dernières demandes</h2>
        {recent.length === 0 ? (
          <p>Aucune demande récente.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map(r => (
              <li key={r.id}>
                <Link to={`/app/tenant/requests/${r.id}`} className="text-blue-600 hover:underline">
                  #{r.id} – {r.description}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageWrapper>
  );
};

export default DashboardPage;
