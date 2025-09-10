"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/api/apiClient"
import { Button, Badge, Section } from "@/components/ui"
import MapboxMap from "@/components/MapboxMap"
import { useSocket } from "@/context/SocketContext"
import { Star, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/useToast"

type EarningsPayload = { earnings: { monthTotal: number; currency: string }; wallet: { balance: number }; rating: { avgRating: number } }
type ProviderStatus = "READY" | "PAUSED" | "OFFLINE" | "BUSY"
type ProviderMe = { id: string; status: ProviderStatus }
type Mission = { id: string; title?: string; description?: string; status: "PENDING" | "ACCEPTED" | "DONE" | "CANCELLED"; createdAt: string }

export default function ProviderDashboardPage(): JSX.Element {
  const navigate = useNavigate()
  const { socket } = useSocket()
  const qc = useQueryClient()
  const { push } = useToast()
  const [geo, setGeo] = React.useState<{ lat: number; lng: number } | null>(null)
  const [geoDenied, setGeoDenied] = React.useState<boolean>(false)

  const { data: earnings } = useQuery<EarningsPayload>({
    queryKey: ["provider", "earnings"],
    queryFn: async () => (await apiClient.get<EarningsPayload>("/api/providers/earnings")).data,
  })

  const { data: me } = useQuery<{ success: boolean; provider: ProviderMe}>({
    queryKey: ["provider", "me"],
    queryFn: async () => (await apiClient.get<{ success: boolean; provider: ProviderMe}>("/api/providers/me")).data,
  })

  const { data: mine } = useQuery<{ missions: Mission[] }>({
    queryKey: ["provider", "missions", "mine"],
    queryFn: async () => (await apiClient.get<{ success: boolean; missions: Mission[] }>("/api/providers/missions")).data,
    select: (d) => ({ missions: d.missions }),
  })

  const assigned = (mine?.missions || []).filter((m) => m.status === "ACCEPTED")
  const history = (mine?.missions || []).filter((m) => m.status === "DONE" || m.status === "CANCELLED")

  React.useEffect(() => {
    if (!socket) return
    const onAccepted = () => {
      qc.invalidateQueries({ queryKey: ["provider", "missions"] })
      qc.invalidateQueries({ queryKey: ["provider", "missions", "mine"] })
    }
    const onDone = () => {
      qc.invalidateQueries({ queryKey: ["provider", "missions"] })
      qc.invalidateQueries({ queryKey: ["provider", "missions", "mine"] })
      qc.invalidateQueries({ queryKey: ["provider", "earnings"] })
    }
    socket.on("mission:accepted", onAccepted)
    socket.on("mission:done", onDone)
    return () => {
      socket.off("mission:accepted", onAccepted)
      socket.off("mission:done", onDone)
    }
  }, [socket, qc])

  // Geolocation for map centering
  React.useEffect(() => {
    if (!("geolocation" in navigator)) return
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setGeoDenied(false)
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      (err) => {
        if (err && (err as GeolocationPositionError).code === 1) {
          setGeoDenied(true)
        }
      },
      { enableHighAccuracy: true, maximumAge: 10_000 }
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  function requestGeolocation() {
    if (!("geolocation" in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoDenied(false)
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      (err) => {
        if (err && (err as GeolocationPositionError).code === 1) setGeoDenied(true)
      },
      { enableHighAccuracy: true }
    )
  }

  const [updating, setUpdating] = React.useState<ProviderStatus | null>(null)

  async function updateStatus(next: ProviderStatus) {
    try {
      setUpdating(next)
      // Update backend (Prisma) and broadcast via socket
      await apiClient.patch("/api/providers/status", { status: next })
      socket?.emit("provider:set_status", { providerId: me?.provider.id, status: next })
      // Optimistically update cache for immediate UI feedback
      qc.setQueryData(["provider", "me"], (prev: unknown) => {
        if (!prev || typeof prev !== "object" || !("provider" in (prev as any))) return prev
        const p = (prev as { success: boolean; provider: ProviderMe })
        return { ...p, provider: { ...p.provider, status: next } }
      })
      push({ type: "success", title: "Statut", message: `Statut mis à jour: ${next}` })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Échec de mise à jour du statut"
      push({ type: "error", title: "Statut", message: msg })
    } finally {
      setUpdating(null)
    }
  }

  const currentStatus = me?.provider.status || "OFFLINE"

  return (
    <div className="space-y-8">
      {/* Top: Wallet (left) + Status (center) + Rating (right) */}
      <div className="rounded-2xl shadow-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
        {/* Wallet + Withdraw (left) */}
        <div className="flex items-center justify-between md:justify-start md:gap-5 w-full">
          <div>
            <div className="text-neutral-600 dark:text-neutral-400 text-[clamp(0.8rem,1.2vw,0.95rem)]">Solde Wallet</div>
            <div className="font-semibold text-[clamp(1.25rem,2.5vw,1.75rem)]">{(earnings?.wallet.balance ?? 0).toLocaleString("fr-FR")} MAD</div>
          </div>
          <Button
            variant="outline"
            className="rounded-full px-4 py-2 text-[clamp(0.8rem,1vw,0.95rem)]"
          >
            Withdraw
          </Button>
        </div>

        {/* Status segmented (center) */}
        <div className="flex items-center justify-center">
          <div className="inline-flex rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100/60 dark:bg-neutral-800/60 p-1">
            {(["READY", "PAUSED", "OFFLINE"] as const).map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={[
                  "px-4 py-1.5 text-[clamp(0.75rem,1vw,0.9rem)] rounded-full transition",
                  currentStatus === s
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60",
                ].join(" ")}
                aria-pressed={currentStatus === s}
                disabled={Boolean(updating)}
              >
                {updating === s ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {s}
                  </span>
                ) : (
                  s
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Rating (right) */}
        <div className="flex items-center justify-end w-full">
          <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-full px-3 py-1 text-[clamp(0.75rem,1vw,0.9rem)]">
            ⭐ {(earnings?.rating.avgRating ?? 0).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Map (full-width) */}
      <div className="w-full relative">
        <div className={geoDenied ? "opacity-50" : undefined}>
          <MapboxMap center={geo ? [geo.lng, geo.lat] : undefined} />
        </div>
        {geoDenied && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/20 backdrop-blur-sm">
            <div className="rounded-xl bg-white dark:bg-neutral-900 px-4 py-3 shadow text-sm text-neutral-700 dark:text-neutral-200">
              Autorisez la localisation pour centrer la carte sur votre position.
            </div>
            <Button variant="outline" onClick={requestGeolocation}>Activer la localisation</Button>
          </div>
        )}
      </div>

      {/* Assigned Missions */}
      <Section title="Missions assignées">
        <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow p-4 space-y-3">
          {assigned.length === 0 && <div className="text-sm text-neutral-500">Aucune mission assignée.</div>}
          {assigned.map((m) => (
            <div key={m.id} className="rounded-2xl border bg-white shadow p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{m.title || "Mission"}</div>
                <div className="text-xs text-neutral-500">{new Date(m.createdAt).toLocaleString("fr-FR")}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" className="rounded-full">{m.status}</Badge>
                <Button variant="outline" onClick={() => navigate(`/app/provider/missions/${m.id}`)}>Voir détails</Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Mission history */}
      <Section title="Historique des missions">
        <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow p-4 space-y-3">
          {history.length === 0 && <div className="text-sm text-neutral-500">Pas d’historique pour le moment.</div>}
          {history.map((m) => (
            <div key={m.id} className="rounded-2xl border bg-white shadow p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-[clamp(0.95rem,1.2vw,1rem)]">{m.title || "Mission"}</div>
                <div className="text-xs text-neutral-500">
                  {new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <Badge variant={m.status === "DONE" ? "neutral" : "error"} className="rounded-full">{m.status}</Badge>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
