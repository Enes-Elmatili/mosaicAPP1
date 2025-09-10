"use client"

import * as React from "react"
import ioClient, { Socket } from "socket.io-client"
import { getSocketUrl, getApiBase } from "@/lib/socket"

type ProviderStatus = "READY" | "BUSY" | "PAUSED" | "OFFLINE"

type DashboardSummary = {
  stats?: { activeRequests: number; paymentsCount: number }
  notifications?: number
  requests?: number
}

type SocketContextValue = {
  socket: Socket | null
  providerStatuses: Record<string, ProviderStatus>
  dashboard: DashboardSummary
}

const SocketContext = React.createContext<SocketContextValue | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = React.useState<Socket | null>(null)
  const [providerStatuses, setProviderStatuses] = React.useState<Record<string, ProviderStatus>>({})
  const [dashboard, setDashboard] = React.useState<DashboardSummary>({})

  React.useEffect(() => {
    let cancelled = false
    let timer: number | undefined

    async function connectWhenHealthy() {
      try {
        const res = await fetch(`${getApiBase()}/health`)
        if (!res.ok) throw new Error('unhealthy')
        if (cancelled) return

        const s = ioClient(getSocketUrl(), {
          withCredentials: true,
          path: "/socket.io",
          autoConnect: true,
        })

        s.on("connect_error", () => {
          try { s.close() } catch {}
          if (!cancelled) timer = window.setTimeout(connectWhenHealthy, 4000)
        })

        setSocket(s)

        s.on("provider:status_update", ({ providerId, status }: { providerId: string; status: ProviderStatus }) => {
          setProviderStatuses((prev) => ({ ...prev, [providerId]: status }))
        })
        s.on("dashboard:update", (partial: DashboardSummary) => {
          setDashboard((prev) => ({ ...prev, ...partial }))
        })
        s.on("payment:created", () => {
          setDashboard((prev) => ({ ...prev, stats: { ...(prev.stats || {}), paymentsCount: (prev.stats?.paymentsCount || 0) + 1 } }))
        })
      } catch {
        if (!cancelled) timer = window.setTimeout(connectWhenHealthy, 4000)
      }
    }

    connectWhenHealthy()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
      if (socket) {
        try { socket.removeAllListeners(); socket.close() } catch {}
      }
      setSocket(null)
    }
  }, [])

  const value: SocketContextValue = React.useMemo(() => ({ socket, providerStatuses, dashboard }), [socket, providerStatuses, dashboard])
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket(): SocketContextValue {
  const ctx = React.useContext(SocketContext)
  if (!ctx) throw new Error("useSocket must be used within SocketProvider")
  return ctx
}

export default SocketContext
