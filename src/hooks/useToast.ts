"use client"

import { useState, useCallback } from "react"

export type ToastType = "info" | "success" | "warning" | "error"

export type Toast = {
  id: string
  title?: string
  message: string
  type: ToastType
  duration?: number // ms
  action?: {
    label: string
    onClick: () => void
  }
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  // ➕ Add toast
  const addToast = useCallback(
    ({
      title,
      message,
      type = "info",
      duration = 4000,
      action,
    }: Omit<Toast, "id">) => {
      const id = crypto.randomUUID()
      const newToast: Toast = { id, title, message, type, duration, action }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
      }

      return id
    },
    []
  )

  // ❌ Dismiss toast by id
  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // 🔄 Clear all
  const clear = useCallback(() => {
    setToasts([])
  }, [])

  return { toasts, addToast, dismiss, clear, useToast: addToast, push: addToast }
}
