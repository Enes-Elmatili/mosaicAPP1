"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/api/apiClient"
import { Section, Button, Badge, Table } from "@/components/ui"

type Mission = {
  id: string
  title?: string | null
  description?: string | null
  status: "PENDING" | "ACCEPTED" | "DONE" | "CANCELLED"
  createdAt: string
  address?: string | null
  amount?: number | null
  rating?: number | null
}
type LocalMission = Mission & { actions?: null }

export default function MissionsPage(): JSX.Element {
  const [query, setQuery] = React.useState<string>("")
  const [status, setStatus] = React.useState<"ALL" | "DONE" | "ACCEPTED" | "CANCELLED">("ALL")

  const { data, isLoading } = useQuery<{ missions: Mission[] }>({
    queryKey: ["provider", "missions", "all"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; missions: Mission[] }>("/api/providers/missions")
      // Keep shape minimal; we will filter client-side
      return { missions: data.missions }
    },
  })

  const missions: LocalMission[] = React.useMemo(() => {
    const list = (data?.missions || []).filter((m) => (status === "ALL" ? true : m.status === status)) as LocalMission[]
    const q = query.trim().toLowerCase()
    return q
      ? list.filter((m) =>
          [m.id, m.title, m.description, m.address]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        )
      : list
  }, [data, query, status])

  function exportInvoice(id: string) {
    // S'il existe un endpoint d'export déjà prêt côté backend, ouvrez-le
    // Exemple: /api/admin/invoices/:id/pdf ou une route dédiée comme /api/requests/:id/invoice
    // Ici on tente d'ouvrir une route prévisible; adaptez si besoin.
    const candidates = [
      `/api/admin/invoices/${encodeURIComponent(id)}/pdf`,
      `/api/requests/${encodeURIComponent(id)}/invoice`,
    ]
    const url = candidates[0]
    window.open(url, "_blank")
  }

  return (
    <div className="space-y-8">
      <Section title="Missions">
        <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow p-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par ID, type, adresse…"
              className="w-full sm:w-80 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <div className="flex items-center gap-2">
              {(["ALL", "DONE", "ACCEPTED", "CANCELLED"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    status === s
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                  aria-pressed={status === s}
                >
                  {s === "ALL" ? "Toutes" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <Table<LocalMission>
            loading={isLoading}
            data={missions}
            columns={[
              { key: "id", label: "ID" },
              { key: "title", label: "Type", render: (_, row) => row.title || row.description || "—" },
              { key: "address", label: "Adresse", render: (v) => v || "—" },
              { key: "amount", label: "Montant", render: (v) => (v != null ? `${v} MAD` : "—") },
              { key: "rating", label: "Note", render: (v) => (v != null ? (
                <span className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-full px-2 py-0.5 text-xs">⭐ {v.toFixed(1)}</span>
              ) : "—") },
              { key: "status", label: "Statut", render: (v: Mission["status"]) => (
                <Badge
                  className="rounded-full"
                  variant={v === "DONE" ? "neutral" : v === "ACCEPTED" ? "warning" : v === "CANCELLED" ? "error" : "primary"}
                >
                  {v}
                </Badge>
              ) },
              { key: "createdAt", label: "Créé le", render: (v) => new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
              { key: "actions" as keyof LocalMission, label: "Facture", render: (_, row) => (
                <Button variant="outline" className="px-3 py-1 rounded-full text-xs" onClick={() => exportInvoice(String(row.id))}>
                  Exporter
                </Button>
              ) },
            ]}
          />
        </div>
      </Section>
    </div>
  )
}
