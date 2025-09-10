"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/api/apiClient"
import { Button, Badge, Section } from "@/components/ui"
import { useSocket } from "@/context/SocketContext"

type DashboardData = {
  me: { id: string; email: string; name: string; role: string; roles: string[] }
  stats: { activeRequests: number; paymentsCount: number }
  wallet: { balance: number; transactions: { id: string; amount: number; type: string; createdAt: string }[] }
  requests: { id: string; title: string; status: string; createdAt: string }[]
  payments: { id: string; amount: number; status: string; createdAt: string }[]
  notifications: { id: string; title: string; message: string; createdAt: string }[]
  messages: { id: string; senderId: string; text: string; createdAt: string }[]
}

export default function ClientDashboardPage(): JSX.Element {
  const navigate = useNavigate()
  const { socket } = useSocket()

  // Fetch dashboard
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["client-dashboard"],
    queryFn: async () => (await apiClient.get<DashboardData>("/api/client/dashboard")).data,
  })

  // Socket hooks ready for realtime tracking
  React.useEffect(() => {
    if (!socket) return
    const onRequestUpdate = () => {
      // Future: invalidate queries to refresh ongoing mission status
    }
    socket.on("request:accepted", onRequestUpdate)
    socket.on("request:ongoing", onRequestUpdate)
    socket.on("request:done", onRequestUpdate)
    return () => {
      socket.off("request:accepted", onRequestUpdate)
      socket.off("request:ongoing", onRequestUpdate)
      socket.off("request:done", onRequestUpdate)
    }
  }, [socket])

  const ongoing = data?.requests?.find((r) => r.status === "ONGOING")

  return (
    <div className="space-y-8">
      {/* Top: Greeting + New Request (client has no status) */}
      <div className="rounded-2xl border bg-white shadow p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Bonjour {data?.me?.name || ""}</h2>
        <Button onClick={() => navigate("/app/requests/new")}>+ Nouvelle requête</Button>
      </div>

      {/* Recent History (Requests) */}
      <Section title="Historique récent">
        <div className="rounded-2xl border bg-white shadow p-4 space-y-3">
          {isLoading && <div className="text-sm text-neutral-500">Chargement…</div>}
          {!isLoading && (data?.requests?.length ?? 0) === 0 && (
            <div className="text-sm text-neutral-500">Aucune demande pour le moment.</div>
          )}
          {(data?.requests || []).map((r) => (
            <div key={r.id} className="rounded-2xl border bg-white shadow p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-neutral-500">{new Date(r.createdAt).toLocaleString("fr-FR")}</div>
              </div>
              <Badge variant={r.status === "DONE" ? "neutral" : r.status === "CANCELLED" ? "error" : "primary"} className="rounded-full">
                {r.status}
              </Badge>
            </div>
          ))}
        </div>
      </Section>

      {/* Real-time Tracking */}
      <Section title="Suivi en temps réel">
        {ongoing ? (
          <div className="rounded-2xl border bg-white shadow p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{ongoing.title}</div>
              <Badge variant="success" className="rounded-full">En cours</Badge>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/app/messages")}>Chat</Button>
              <Button onClick={() => console.log("Call")}>Appeler</Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border bg-white shadow p-4 text-sm text-neutral-500">Aucune mission en cours.</div>
        )}
      </Section>
    </div>
  )
}
