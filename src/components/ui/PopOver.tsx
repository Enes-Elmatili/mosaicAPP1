"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/cx"

type PopoverProps = {
  trigger: React.ReactNode
  children: React.ReactNode
  placement?: "top" | "bottom" | "left" | "right"
  className?: string
}

export function Popover({
  trigger,
  children,
  placement = "bottom",
  className,
}: PopoverProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const id = React.useId()

  // fermer au clic externe
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // fermer avec ESC
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="focus:outline-none"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: placement === "top" ? -6 : 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: placement === "top" ? -6 : 6 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 min-w-[160px] rounded-md border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-lg py-2",
              placement === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
              placement === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
              placement === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
              placement === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
              className
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
Popover.displayName = "Popover"
