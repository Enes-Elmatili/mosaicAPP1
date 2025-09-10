"use client"

import React, { useEffect, useState } from "react"
import { apiClient } from "@/api/apiClient"
import { motion } from "framer-motion"
import io from "socket.io-client"
import { getSocketUrl } from "@/lib/socket"
import { Bell, Check, Trash } from "lucide-react"
import { useToast } from "@/hooks/useToast"

type Notification = {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  createdAt: string
  readAt: string | null
}

const socket = io(getSocketUrl(), {
  withCredentials: true,
  path: "/socket.io",
  autoConnect: true,
})

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { push } = useToast()

  async function loadNotifications() {
    try {
      const { data } = await apiClient.get<{ data: Notification[] }>("/api/notifications")
      setNotifications(data.data)
    } catch {
      setError("Impossible de charger les notifications.")
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    try {
      await apiClient.patch(`/api/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      )
    } catch (err) {
      console.error("Erreur marquage lecture:", err)
    }
  }

  async function deleteNotif(id: string) {
    try {
      await apiClient.delete(`/api/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      console.error("Erreur suppression:", err)
    }
  }

  useEffect(() => {
    loadNotifications()

    // Temps réel
    socket.on("notification:received", (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev])
      push({
        title: notif.title,
        message: notif.message,
        type: notif.type === "error" ? "error" : notif.type,
      })
    })

    return () => {
      socket.off("notification:received")
    }
  }, [])

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bell className="h-6 w-6" /> Notifications
      </h1>

      {loading && <p className="text-sm text-neutral-500">Chargement…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-4">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`flex items-start justify-between rounded-lg border p-4 shadow-sm ${
              n.readAt ? "bg-white dark:bg-neutral-900" : "bg-neutral-50 dark:bg-neutral-800"
            }`}
          >
            <div>
              <h2 className="font-semibold">{n.title}</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{n.message}</p>
              <p className="text-xs text-neutral-400 mt-1">
                {new Date(n.createdAt).toLocaleString("fr-FR")}
              </p>
            </div>

            <div className="flex gap-2">
              {!n.readAt && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  aria-label="Marquer comme lue"
                >
                  <Check className="h-4 w-4 text-green-600" />
                </button>
              )}
              <button
                onClick={() => deleteNotif(n.id)}
                className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
                aria-label="Supprimer"
              >
                <Trash className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </motion.div>
        ))}

        {!loading && notifications.length === 0 && (
          <p className="text-center text-neutral-500">Aucune notification.</p>
        )}
      </div>
    </main>
  )
}

export default NotificationsPage
