import { useEffect, useState } from "react";

type AdminRequest = {
  id: string;
  client: string;
  description: string;
  status: "pending" | "in_progress" | "done" | "closed";
  createdAt: string;
};

const statusColor: Record<AdminRequest["status"], string> = {
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  done: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/requests`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setRequests(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-lg backdrop-blur-md">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">
        Demandes d’intervention (Admin)
      </h1>

      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : error ? (
        <p className="text-red-600">Erreur: {error}</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500">Aucune demande trouvée.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-medium text-gray-600">
                <th className="px-4 py-2 border-b">ID</th>
                <th className="px-4 py-2 border-b">Client</th>
                <th className="px-4 py-2 border-b">Description</th>
                <th className="px-4 py-2 border-b">Statut</th>
                <th className="px-4 py-2 border-b">Créée le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{req.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{req.client}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{req.description}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor[req.status]}`}
                    >
                      {req.status === "pending" && "En attente"}
                      {req.status === "in_progress" && "En cours"}
                      {req.status === "done" && "Terminée"}
                      {req.status === "closed" && "Clôturée"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(req.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
