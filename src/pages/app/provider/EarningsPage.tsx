"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/api/apiClient"
import { Section, Table, Badge } from "@/components/ui"

type Payment = {
  id: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | string
  createdAt: string
  // Placeholders for future backend expansion
  clientId?: string | null
  clientEmail?: string | null
  requestId?: number | null
  invoiceUrl?: string | null
}

export default function EarningsPage(): JSX.Element {
  const [query, setQuery] = React.useState<string>("")
  const [filter, setFilter] = React.useState<"ALL" | "pending" | "completed" | "failed">("ALL")

  const [page, setPage] = React.useState<number>(1)
  const pageSize = 20
  const { data, isLoading } = useQuery<{ code: string; data: Payment[]; page: number; limit: number; total: number }>({
    queryKey: ["provider", "earnings", "list", page],
    queryFn: async () => (await apiClient.get<{ code: string; data: Payment[]; page: number; limit: number; total: number }>(`/api/payments?page=${page}&limit=${pageSize}`)).data,
    keepPreviousData: true,
  })

  const rows = React.useMemo<Payment[]>(() => {
    const list = (data?.data || [])
      .filter((p) => (filter === "ALL" ? true : p.status === filter))
      .filter((p) => {
        const q = query.trim().toLowerCase()
        if (!q) return true
        return [p.id, p.clientId, p.clientEmail].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      })
    return list
  }, [data, query, filter])

  return (
    <div className="space-y-8">
      <Section title="Revenus / Paiements">
        <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow p-4 space-y-4">
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par ID paiement / client…"
              className="w-full sm:w-96 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <div className="flex items-center gap-2">
              {(["ALL", "pending", "completed", "failed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    filter === s
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                  aria-pressed={filter === s}
                >
                  {s === "ALL" ? "Tous" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Tableau */}
          <Table<Payment>
            loading={isLoading}
            data={rows}
            page={data?.page}
            pageSize={data?.limit}
            total={data?.total}
            onPageChange={(p) => setPage(p)}
            columns={[
              { key: "id", label: "Paiement ID" },
              { key: "clientEmail", label: "Client", render: (v, row) => v || "—" },
              { key: "clientId", label: "Client ID", render: (v) => v || "—" },
              { key: "amount", label: "Montant", render: (v, row) => `${v?.toLocaleString("fr-FR")} ${row.currency || "MAD"}` },
              { key: "createdAt", label: "Date", render: (v) => new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
              { key: "status", label: "Statut", render: (v: Payment["status"]) => (
                <Badge className="rounded-full" variant={v === "completed" ? "neutral" : v === "pending" ? "warning" : "error"}>
                  {v}
                </Badge>
              ) },
              { key: "invoiceUrl", label: "Facture", render: (v, row) => (
                v ? (
                  <a
                    href={v}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Exporter
                  </a>
                ) : (
                  <span className="text-xs text-neutral-400">—</span>
                )
              ) },
            ]}
          />
        </div>
      </Section>
    </div>
  )
}
