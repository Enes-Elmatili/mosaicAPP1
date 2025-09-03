import { useEffect, useState } from "react";

type Request = {
  id: string;
  description: string;
  status: "pending" | "in_progress" | "done" | "closed";
  createdAt: string;
};

const statusLabels: Record<Request["status"], string> = {
  pending: "En attente",
  in_progress: "En cours",
  done: "Terminée",
  closed: "Clôturée",
};

const statusColors: Record<Request["status"], string> = {
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  done: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function RequestsListPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/client/requests", {
          credentials: "include", // 👈 pour cookie JWT
        });
        if (!res.ok) throw new Error("Erreur API");
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error("Erreur fetch requests:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/70 p-6 shadow-lg backdrop-blur-md">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">
        Mes demandes
      </h1>

      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500">Aucune demande trouvée.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-medium text-gray-600">
                <th className="px-4 py-2 border-b">ID</th>
                <th className="px-4 py-2 border-b">Description</th>
                <th className="px-4 py-2 border-b">Statut</th>
                <th className="px-4 py-2 border-b">Créée le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                    {req.id}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {req.description}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[req.status]}`}
                    >
                      {statusLabels[req.status]}
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
