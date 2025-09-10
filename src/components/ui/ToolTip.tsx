"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/cx"

type TooltipProps = {
  children: React.ReactNode
  content: React.ReactNode
  placement?: "top" | "bottom" | "left" | "right"
  delay?: number
  className?: string
}

export function Tooltip({
  children,
  content,
  placement = "top",
  delay = 150,
  className,
}: TooltipProps) {
  const [visible, setVisible] = React.useState(false)
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null)
  const childRef = React.useRef<HTMLDivElement>(null)
  const id = React.useId()

  const show = () => {
    const id = setTimeout(() => setVisible(true), delay)
    setTimeoutId(id)
  }
  const hide = () => {
    if (timeoutId) clearTimeout(timeoutId)
    setVisible(false)
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onTouchStart={() => setVisible((v) => !v)} // mobile fallback
      ref={childRef}
    >
      <div aria-describedby={id}>{children}</div>

      <AnimatePresence>
        {visible && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, scale: 0.95, y: placement === "top" ? -4 : 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: placement === "top" ? -4 : 4 }}
            transition={{ duration: 0.15 }}
            role="tooltip"
            id={id}
            className={cn(
              "absolute z-50 px-2 py-1 text-xs rounded-md shadow-lg",
              "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black",
              placement === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
              placement === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
              placement === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
              placement === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
Tooltip.displayName = "Tooltip"