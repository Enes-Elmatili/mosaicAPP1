"use client"

import * as React from "react"
import { useNotifications } from "@/hooks/useNotifications"
import { Notification } from "@/types/notifications"

type NotificationsContextType = ReturnType<typeof useNotifications>

const NotificationsContext = React.createContext<NotificationsContextType | null>(null)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const notifState = useNotifications()

  return (
    <NotificationsContext.Provider value={notifState}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotificationsContext() {
  const ctx = React.useContext(NotificationsContext)
  if (!ctx) {
    throw new Error("useNotificationsContext must be used within NotificationsProvider")
  }
  return ctx
}