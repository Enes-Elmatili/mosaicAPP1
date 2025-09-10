"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Trash,
  Circle,
} from "lucide-react"
import { cn } from "@/lib/cx"

export type NotificationType = "info" | "success" | "warning" | "error"

export type Notification = {
  id: string
  type: NotificationType
  title: string
  description?: string
  time: string
  read?: boolean
  onClick?: () => void
}

type NotificationsPanelProps = {
  open: boolean
  onClose: () => void
  notifications: Notification[]
  onMarkAllRead?: () => void
  onClearAll?: () => void
  width?: number | string
  className?: string
}

const variants: Record<
  NotificationType,
  { icon: React.ReactNode; classes: string }
> = {
  info: {
    icon: <Info className="h-5 w-5 text-blue-500" />,
    classes: "border-l-2 border-blue-200 dark:border-blue-800",
  },
  success: {
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    classes: "border-l-2 border-green-200 dark:border-green-800",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    classes: "border-l-2 border-yellow-200 dark:border-yellow-800",
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    classes: "border-l-2 border-red-200 dark:border-red-800",
  },
}

export function NotificationsPanel({
  open,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  width = 320,
  className,
}: NotificationsPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "fixed right-0 top-0 bottom-0 bg-white dark:bg-neutral-900 shadow-xl z-50 flex flex-col",
              className
            )}
            style={{ width }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
              <h2
                id="notifications-title"
                className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2"
              >
                <Bell className="h-4 w-4" /> Notifications
              </h2>
              <button onClick={onClose} aria-label="Fermer">
                <X className="h-5 w-5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center px-4 py-2 text-xs text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700">
              <button
                onClick={onMarkAllRead}
                disabled={!onMarkAllRead}
                className="hover:text-primary transition disabled:opacity-50"
              >
                Tout marquer comme lu
              </button>
              <button
                onClick={onClearAll}
                disabled={!onClearAll}
                className="flex items-center gap-1 hover:text-red-500 transition disabled:opacity-50"
              >
                <Trash className="h-3 w-3" /> Vider
              </button>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length > 0 ? (
                <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {notifications.map((n: Notification) => {
                    const variant = variants[n.type] // ✅ typé
                    return (
                      <li
                        key={n.id}
                        onClick={n.onClick}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 cursor-pointer",
                          "hover:bg-neutral-50 dark:hover:bg-neutral-800 transition",
                          !n.read && "bg-neutral-50 dark:bg-neutral-800/50",
                          variant.classes
                        )}
                      >
                        {!n.read && (
                          <Circle className="h-2 w-2 text-primary mt-1" />
                        )}
                        {variant.icon}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {n.title}
                          </p>
                          {n.description && (
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                              {n.description}
                            </p>
                          )}
                          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                            {n.time}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 dark:text-neutral-400 text-sm">
                  <Bell className="h-6 w-6 mb-2 opacity-50" />
                  Aucune notification
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
NotificationsPanel.displayName = "NotificationsPanel"