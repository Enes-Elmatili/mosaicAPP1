"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { apiClient } from "@/api/apiClient"
import { Button, Badge } from "@/components/ui"
import { useSocket } from "@/context/SocketContext"
import { MapPin, Clock, } from "lucide-react"

type ProviderMe = { id: string; status: "READY" | "BUSY" | "PAUSED" | "OFFLINE"; avgRating?: number }
type Earnings = { monthTotal: number; currency: string }
type Wallet = { balance: number }
type Mission = {
  id: string
  title?: string
  description?: string
  address?: string
  city?: string | null
  when?: string | null
  price?: number | null
  status: "PENDING" | "ACCEPTED" | "DONE" | "CANCELLED"
}

function statusLabel(s: ProviderMe["status"]): { label: string; variant: "success" | "warning" | "error" } {
  switch (s) {
    case "READY":
      return { label: "Disponible", variant: "success" }
    case "BUSY":
      return { label: "Occupé", variant: "warning" }
    case "PAUSED":
    case "OFFLINE":
    default:
      return { label: "Hors ligne", variant: "error" }
  }
}

export default function ProviderDashboardPage(): JSX.Element {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { socket } = useSocket()

  const { data: meData } = useQuery({
    queryKey: ["provider", "me"],
    queryFn: async (): Promise<{ provider: ProviderMe }> => {
      const { data } = await apiClient.get<{ success: boolean; provider: ProviderMe }>("/api/providers/me")
      return { provider: data.provider }
    },
  })

  const providerId = meData?.provider.id

  const { data: earningsData } = useQuery({
    queryKey: ["provider", "earnings"],
    queryFn: async (): Promise<{ earnings: Earnings; wallet: Wallet; rating: { avgRating: number } }> => {
      const { data } = await apiClient.get<{ success: boolean; earnings: Earnings; wallet: Wallet; rating: { avgRating: number } }>("/api/providers/earnings")
      return { earnings: data.earnings, wallet: data.wallet, rating: data.rating }
    },
  }) as any

  const { data: availableMissions = { missions: [] as Mission[] } } = useQuery({
    queryKey: ["provider", "missions", "available"],
    queryFn: async (): Promise<{ missions: Mission[] }> => {
      const { data } = await apiClient.get<{ success: boolean; missions: Mission[] }>("/api/providers/missions?available=true")
      return { missions: data.missions }
    },
  })

  const { data: myMissions = { missions: [] as Mission[] } } = useQuery({
    queryKey: ["provider", "missions", "mine"],
    queryFn: async (): Promise<{ missions: Mission[] }> => {
      const { data } = await apiClient.get<{ success: boolean; missions: Mission[] }>("/api/providers/missions")
      return { missions: data.missions }
    },
  })

  // Socket subscriptions
  React.useEffect(() => {
    if (!socket) return

    const onNewRequest = (payload: any) => {
      // ideally payload contains mission id; re-fetch available list
      qc.invalidateQueries({ queryKey: ["provider", "missions", "available"] })
    }
    const onStatus = ({ providerId: pid, status }: { providerId: string; status: ProviderMe["status"] }) => {
      if (pid === providerId) {
        qc.setQueryData(["provider", "me"], (prev: any) => ({ provider: { ...(prev?.provider || {}), status } }))
      }
    }
    const onEarnings = ({ monthTotal }: { monthTotal: number }) => {
      qc.setQueryData(["provider", "earnings"], (prev: any) => ({
        ...(prev || {}),
        earnings: { ...(prev?.earnings || { currency: "MAD" }), monthTotal },
      }))
    }

    socket.on("new_request", onNewRequest)
    socket.on("provider:status_update", onStatus)
    socket.on("status_update", onStatus)
    socket.on("earnings_update", onEarnings)

    return () => {
      socket.off("new_request", onNewRequest)
      socket.off("provider:status_update", onStatus)
      socket.off("status_update", onStatus)
      socket.off("earnings_update", onEarnings)
    }
  }, [socket, providerId, qc])

  const status = meData?.provider.status || "OFFLINE"
  const statusMeta = statusLabel(status as ProviderMe["status"]) 
  const earnings = earningsData?.earnings
  const wallet = earningsData?.wallet
  const ratingVal = earningsData?.rating?.avgRating ?? meData?.provider.avgRating ?? 0

  // Actions
  const cycleStatus = () => {
    const next = status === "READY" ? "BUSY" : status === "BUSY" ? "PAUSED" : "READY"
    if (socket && providerId) {
      socket.emit("provider:set_status", { providerId, status: next })
    }
  }

  async function acceptMission(id: string) {
    await apiClient.post(`/api/providers/missions/${id}/accept`, {})
    socket?.emit("mission:accepted", { missionId: id })
    qc.invalidateQueries({ queryKey: ["provider", "missions"] })
    qc.invalidateQueries({ queryKey: ["provider", "missions", "available"] })
  }

  async function completeMission(id: string) {
    await apiClient.post(`/api/providers/missions/${id}/done`, {})
    socket?.emit("mission:done", { missionId: id })
    qc.invalidateQueries({ queryKey: ["provider", "missions"] })
  }

  const ongoing = myMissions.missions.find((m) => m.status === "ACCEPTED")

  return (
    <div className="space-y-6">
      {/* Header block */}
      <div className="bg-neutral-900 text-white rounded-2xl flex flex-col md:flex-row justify-between items-stretch md:items-center p-4 gap-4">
        {/* Status */}
        <div className="flex items-center gap-3">
          <Badge variant={statusMeta.variant} className="rounded-full">{statusMeta.label}</Badge>
          <Button variant="secondary" onClick={cycleStatus}>Set status</Button>
        </div>
        {/* Earnings */}
        <div className="text-center">
          <div className="text-sm opacity-80">Gains ce mois</div>
          <div className="text-2xl font-semibold">{(earnings?.monthTotal ?? 0).toLocaleString("fr-FR")} {earnings?.currency ?? "MAD"}</div>
        </div>
        {/* Rating + Withdraw */}
        <div className="flex items-center gap-3 justify-end">
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold">{ratingVal.toFixed(1)}</span>
          </div>
          {wallet?.balance > 0 && (
            <Button className="bg-black text-white rounded-lg px-4 py-2 hover:bg-neutral-800">Withdraw</Button>
          )}
        </div>
      </div>

      {/* Available missions */}
      <div className="rounded-2xl border bg-white shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Missions disponibles</h2>
          <Badge variant="primary" className="rounded-full">{availableMissions.missions.length}</Badge>
        </div>

        <div>
          {availableMissions.missions.map((m) => (
            <div key={m.id} className="rounded-2xl border bg-white shadow p-4 mb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium truncate">{m.title || "Mission"}</h3>
                  <p className="text-sm text-neutral-600 truncate">{m.description || "—"}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {m.city || m.address || ""}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {m.when || ""}</span>
                  </div>
                </div>
                <div className="text-right">
                  {m.price != null && (
                    <div className="text-lg font-semibold">{m.price.toLocaleString("fr-FR")} €</div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                {m.status === "PENDING" ? (
                  <Button onClick={() => acceptMission(m.id)} className="bg-black text-white rounded-lg px-4 py-2 hover:bg-neutral-800">
                    Accepter la mission
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => navigate(`/app/provider/missions/${m.id}`)}>Voir détails</Button>
                )}
              </div>
            </div>
          ))}
          {availableMissions.missions.length === 0 && (
            <p className="text-sm text-neutral-500">Aucune mission disponible pour le moment.</p>
          )}
        </div>
      </div>

      {/* Ongoing mission */}
      {ongoing && (
        <div className="rounded-2xl border bg-white shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Mission en cours</h2>
            <Badge variant="success" className="rounded-full">En cours</Badge>
          </div>
          <div className="text-sm text-neutral-700">{ongoing.title || "Mission"} — {ongoing.description || ""}</div>
          <div className="mt-3 flex gap-3">
            <Button variant="outline" onClick={() => navigate("/app/messages")}>Contacter</Button>
            <Button onClick={() => completeMission(ongoing.id)} className="bg-black text-white rounded-lg px-4 py-2 hover:bg-neutral-800">Terminer</Button>
          </div>
        </div>
      )}
    </div>
  )
}
