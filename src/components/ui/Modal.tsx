"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/cx"
import { AnimatePresence, motion } from "framer-motion"

type ModalSize = "sm" | "md" | "lg" | "xl"
type ModalPlacement = "center" | "bottom"

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: ModalSize
  placement?: ModalPlacement
  dismissible?: boolean
}

const sizes: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = "md",
  placement = "center",
  dismissible = true,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null)

  // Focus trap
  React.useEffect(() => {
    if (!open || !modalRef.current) return
    const el = modalRef.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable[0]?.focus()
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={dismissible ? onClose : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            tabIndex={-1}
            initial={{ y: placement === "bottom" ? "100%" : 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: placement === "bottom" ? "100%" : 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "relative w-full bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-xl shadow-lg p-6",
              sizes[size],
              placement === "bottom" ? "sm:rounded-xl sm:my-8" : "my-8"
            )}
          >
            {/* Header */}
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
                {title}
              </h2>
            )}

            {/* Close button */}
            {dismissible && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition"
                aria-label="Fermer le modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Content */}
            <div className="text-neutral-700 dark:text-neutral-300">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 
Modal.displayName = "Modal"   
type LoaderProps = {
  label?: string
  size?: "sm" | "md" | "lg"
  variant?: "spinner" | "dots" | "bar"
  fullscreen?: boolean
  className?: string
}