// src/pages/app/provider/DashboardPage.tsx
import { useState, useEffect } from "react";
import MapView from "@/components/MapView";
import getSocket from "@/lib/socket";
import { MaintenanceRequest } from "@/pages/app/services/requests";
import { useProviderStatus } from "@/hooks/useProviderStatus";
import { ProviderStatus } from "@/types/providers";

export default function DashboardPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const { status, setStatus } = useProviderStatus();

  useEffect(() => {
    const socket = getSocket();

    socket.on("new-request", (req: MaintenanceRequest) => {
      setRequests((prev) => [req, ...prev]);
    });

    socket.on("request-updated", (req: MaintenanceRequest) => {
      setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, ...req } : r)));
    });

    socket.on("request-deleted", ({ id }: { id: number }) => {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    });

    return () => {
      socket.off("new-request");
      socket.off("request-updated");
      socket.off("request-deleted");
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Header */}
      <div className="rounded-3xl border border-white/20 bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-700 text-white p-10 shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">⚡ Tableau de bord Prestataire</h1>
          <p className="mt-2 text-base opacity-90">
            Suivez vos missions, revenus et zones d’intervention.
          </p>
        </div>

        {/* Sélecteur de statut */}
        <div className="flex items-center gap-3">
          {([ProviderStatus.READY, ProviderStatus.PAUSED, ProviderStatus.OFFLINE] as ProviderStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                status === s
                  ? "bg-white text-indigo-600 shadow"
                  : "bg-indigo-800/50 text-white hover:bg-indigo-700"
              }`}
            >
              {s === ProviderStatus.READY && "✅ Disponible"}
              {s === ProviderStatus.PAUSED && "⏸️ Pause"}
              {s === ProviderStatus.OFFLINE && "🚫 Hors ligne"}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs rapides */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Demandes reçues", value: requests.length, color: "bg-blue-500" },
          { label: "À traiter", value: requests.filter((r) => r.status === "PUBLISHED").length, color: "bg-yellow-500" },
          { label: "En cours", value: requests.filter((r) => r.status === "IN_PROGRESS").length, color: "bg-purple-500" },
          { label: "Terminées", value: requests.filter((r) => r.status === "DONE").length, color: "bg-green-500" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl bg-white/90 backdrop-blur-md border border-gray-200 p-6 shadow-md hover:shadow-lg transition">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-4xl font-extrabold text-gray-900 flex items-center gap-2">
              {stat.value}
              <span className={`h-3 w-3 rounded-full ${stat.color}`}></span>
            </p>
          </div>
        ))}
      </section>

      {/* Revenus (fake graph) */}
      <div className="rounded-3xl bg-white border border-gray-200 p-8 shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenus de la semaine</h2>
        <div className="flex items-end gap-4 h-40">
          {[120, 250, 180, 300, 200, 400, 350].map((val, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-lg transition-all hover:opacity-80"
                style={{ height: `${val / 4}px` }}
              />
              <span className="mt-2 text-xs text-gray-600">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Missions récentes */}
      <div className="rounded-3xl bg-white border border-gray-200 p-8 shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Missions récentes</h2>
        <ul className="divide-y divide-gray-200">
          {requests.length === 0 && <li className="py-4 text-gray-500">Aucune mission pour le moment.</li>}
          {requests.map((mission) => (
            <li key={mission.id} className="py-4 flex items-center justify-between">
              <span className="text-gray-800 font-medium">{mission.description}</span>
              <span className="text-sm font-semibold text-indigo-600">{mission.serviceType}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Carte interactive */}
      <div className="rounded-3xl bg-white border border-gray-200 p-8 shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Zones d’intervention</h2>
        <MapView
          markers={requests
            .filter((r) => typeof r.lat === "number" && typeof r.lng === "number")
            .map((r) => ({
              lat: Number(r.lat),
              lng: Number(r.lng),
              label: r.description,
            }))}
        />
      </div>
    </div>
  );
}
