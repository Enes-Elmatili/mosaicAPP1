"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/cx"
import { AnimatePresence, motion } from "framer-motion"

type SheetSize = "25" | "50" | "90"

type SheetProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  size?: SheetSize
  dismissible?: boolean
}

const sizes: Record<SheetSize, string> = {
  "25": "h-1/4",
  "50": "h-1/2",
  "90": "h-[90%]",
}

export const Sheet: React.FC<SheetProps> = ({
  open,
  onClose,
  children,
  title,
  size = "50",
  dismissible = true,
}) => {
  const sheetRef = React.useRef<HTMLDivElement>(null)

  // focus trap initial
  React.useEffect(() => {
    if (!open || !sheetRef.current) return
    const el = sheetRef.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable[0]?.focus()
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center"
          onClick={dismissible ? onClose : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={sheetRef}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "sheet-title" : undefined}
            tabIndex={-1}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 rounded-t-2xl shadow-lg p-6",
              sizes[size]
            )}
          >
            {/* Handle bar (style iOS) */}
            <div className="flex justify-center mb-4">
              <div className="h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            </div>

            {/* Title */}
            {title && (
              <h2
                id="sheet-title"
                className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4"
              >
                {title}
              </h2>
            )}

            {/* Close button */}
            {dismissible && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition"
                aria-label="Fermer le panneau"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Content */}
            <div className="overflow-y-auto max-h-full text-neutral-700 dark:text-neutral-300">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
Sheet.displayName = "Sheet"