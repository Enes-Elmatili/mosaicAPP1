import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Request = {
  id: number;
  title: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
};

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      // === MOCK DATA ===
      setRequests([
        { id: 1, title: 'Demande A', status: 'open', createdAt: '2025-08-05' },
        { id: 2, title: 'Demande B', status: 'in_progress', createdAt: '2025-08-04' },
      ]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <section className="mb-6 text-center">
        <h1 className="text-3xl font-bold">MOSAIC</h1>
        <p className="mt-2 text-gray-700">Gérez vos demandes en 2 clics.</p>
        <div className="flex justify-center gap-4 mt-4">
          <Link to="/app/tenant/requests/new" className="btn-primary">
            Créer une demande
          </Link>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Actions rapides</h2>
        <ul className="flex gap-6">
          <li>
            <Link to="/app/tenant/requests/new" className="text-primary-600 hover:underline">
              + Nouvelle demande
            </Link>
          </li>
          <li>
            <Link to="/app/tenant/requests" className="text-primary-600 hover:underline">
              Mes demandes
            </Link>
          </li>
          <li>
            <Link to="/settings" className="text-primary-600 hover:underline">
              Paramètres
            </Link>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Dernières demandes</h2>
        {loading ? (
          <ul className="space-y-2">
            {[1, 2, 3].map((i) => (
              <li key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </ul>
        ) : requests.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600">Aucune demande pour le moment.</p>
            <Link to="/app/tenant/requests/new" className="btn-primary mt-3 inline-block">
              Créer la première demande
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {requests.map((r) => (
              <li key={r.id} className="border border-gray-200 rounded p-4">
                <Link
                  to={`/app/tenant/requests/${r.id}`}
                  className="flex justify-between items-center"
                >
                  <strong>{r.title}</strong>
                  <span className="capitalize text-sm text-gray-500">{r.status.replace('_', ' ')}</span>
                  <time className="text-sm text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
