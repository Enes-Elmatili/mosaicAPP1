"use client"

import * as React from "react"
import { Notification } from "@/types/notifications"

export function useNotifications(initial: Notification[] = []) {
  const [notifications, setNotifications] = React.useState<Notification[]>(initial)

  const addNotification = (notif: Omit<Notification, "id" | "time" | "read">) => {
    const newNotif: Notification = {
      id: uuid(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
      ...notif,
    }
    setNotifications((prev) => [newNotif, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  }
}

function uuid(): string {
  throw new Error("Function not implemented.")
}
