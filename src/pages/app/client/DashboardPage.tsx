"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "@/api/apiClient";
import { Section, Badge, Button } from "@/components/ui";
import { Wrench } from "lucide-react";

// Types alignés avec l'API backend /api/client/dashboard
interface DashboardData {
  me: { id: string; email: string; name: string; role: string; roles: string[] };
  stats: { activeRequests: number; paymentsCount: number };
  wallet: {
    balance: number;
    transactions: { id: string; amount: number; type: string; createdAt: string }[];
  };
  requests: { id: string; title: string; status: "PUBLISHED" | "ACCEPTED" | "ONGOING" | "DONE" | "CANCELLED"; createdAt: string }[];
  payments: { id: string; amount: number; status: string; createdAt: string }[];
  notifications: { id: string; title: string; message: string; createdAt: string }[];
  messages: { id: string; senderId: string; text: string; createdAt: string }[];
}

export default function DashboardPage(): JSX.Element {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["client-dashboard"],
    queryFn: async (): Promise<DashboardData> => {
      const { data } = await apiClient.get<DashboardData>("/api/client/dashboard");
      return data;
    },
  });

  if (isLoading) return <div className="p-6">Chargement…</div>;
  if (error || !data) return <div className="p-6 text-red-500">Erreur de chargement</div>;

  const hasActive = data.requests.some((r) => ["PUBLISHED", "ACCEPTED", "ONGOING"].includes(r.status));
  const ongoing = data.requests.find((r) => r.status === "ONGOING");

  function statusBadgeVariant(status: string): "neutral" | "success" | "warning" | "error" | "primary" {
    switch (status) {
      case "PUBLISHED":
        return "primary";
      case "ACCEPTED":
        return "warning";
      case "ONGOING":
        return "success";
      case "DONE":
        return "neutral";
      case "CANCELLED":
        return "error";
      default:
        return "neutral";
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        {/* Bloc principal */}
        <Section title="Tableau de bord client">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Bonjour {data.me.name || ""}</h2>
              <div className="mt-2">
                {hasActive ? (
                  <Badge variant="warning" className="rounded-full">En mission</Badge>
                ) : (
                  <Badge variant="success" className="rounded-full">Disponible</Badge>
                )}
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto"
                onClick={() => navigate("/app/requests/new")}
              >
                + Nouvelle requête
              </Button>
            </div>
          </div>
        </Section>

        {/* Historique récent */}
        <Section title="Historique récent">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.requests.map((r) => (
              <div key={r.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <Wrench className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium truncate">{r.title}</h3>
                    <Badge variant={statusBadgeVariant(r.status)} size="sm" className="shrink-0">
                      {r.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {new Date(r.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
            {data.requests.length === 0 && (
              <p className="text-sm text-neutral-500">Aucune requête pour le moment.</p>
            )}
          </div>
        </Section>

        {/* Suivi en temps réel */}
        {ongoing && (
          <Section title="Suivi en temps réel">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{ongoing.title}</h3>
                <Badge variant="success" className="rounded-full flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                  Mission en cours
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/app/messages")}>Chat</Button>
                <Button className="w-full sm:w-auto" onClick={() => console.log("Appel en cours…")}>Appeler</Button>
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
