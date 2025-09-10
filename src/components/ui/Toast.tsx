"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/cx"

export type ToastType = "info" | "success" | "warning" | "error"

export type ToastAction = {
  label: string
  onClick: () => void
}

export type ToastProps = {
  id: string
  type?: ToastType
  title?: string
  message: string
  duration?: number // ms avant auto-dismiss (par défaut 5000)
  action?: ToastAction
  onDismiss?: (id: string) => void
}

const variants = {
  info: {
    icon: <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />,
    classes: "bg-blue-600 text-white",
    role: "status" as const,
    live: "polite" as const,
  },
  success: {
    icon: <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />,
    classes: "bg-green-600 text-white",
    role: "status" as const,
    live: "polite" as const,
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />,
    classes: "bg-yellow-600 text-white",
    role: "alert" as const,
    live: "assertive" as const,
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />,
    classes: "bg-red-600 text-white",
    role: "alert" as const,
    live: "assertive" as const,
  },
}

export const Toast = React.memo(
  ({
    id,
    type = "info",
    title,
    message,
    duration = 5000,
    action,
    onDismiss,
  }: ToastProps) => {
    const variant = variants[type]

    // Auto-dismiss timer
    React.useEffect(() => {
      if (duration === 0 || !onDismiss) return
      const timer = setTimeout(() => onDismiss(id), duration)
      return () => clearTimeout(timer)
    }, [id, duration, onDismiss])

    const handleActionClick = React.useCallback(() => {
      if (action) {
        action.onClick()
        onDismiss?.(id)
      }
    }, [action, onDismiss, id])

    const handleDismissClick = React.useCallback(() => {
      onDismiss?.(id)
    }, [onDismiss, id])

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.5 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        role={variant.role}
        aria-live={variant.live}
        className={cn(
          "relative flex w-full max-w-sm items-start gap-3 rounded-xl p-4 shadow-lg backdrop-blur-md",
          variant.classes
        )}
      >
        {/* Icon */}
        <div className="flex-shrink-0">{variant.icon}</div>

        {/* Content */}
        <div className="flex-1">
          {title && <p className="font-semibold">{title}</p>}
          <p>{message}</p>

          {action && (
            <button
              onClick={handleActionClick}
              className="mt-2 text-xs font-semibold uppercase tracking-wider underline underline-offset-2 hover:opacity-90"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close */}
        {onDismiss && (
          <button
            onClick={handleDismissClick}
            className="ml-2 flex-shrink-0 text-white/70 transition hover:text-white"
            aria-label="Fermer la notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </motion.div>
    )
  }
)
Toast.displayName = "Toast"

type ToastContainerProps = {
  toasts: ToastProps[]
  onDismiss?: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-start gap-3 p-4 sm:justify-end"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}
ToastContainer.displayName = "ToastContainer"
