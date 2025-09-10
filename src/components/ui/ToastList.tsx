"use client"

import * as React from "react"
import { AnimatePresence } from "framer-motion"
import { Toast, ToastProps } from "./Toast"

type ToastListProps = {
  toasts: ToastProps[]
  onDismiss?: (id: string) => void
}

export function ToastList({ toasts, onDismiss }: ToastListProps) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}
