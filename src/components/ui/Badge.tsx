"use client"

import * as React from "react"
import { X } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cx"

type BadgeProps = {
  children: React.ReactNode
  variant?: "primary" | "success" | "warning" | "error" | "neutral"
  size?: "sm" | "md"
  onDismiss?: () => void
  className?: string
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  onDismiss,
  className,
}: BadgeProps) {
  const variants = {
    primary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    neutral: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
  }

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  }

  return (
    <motion.span
      role="status"
      aria-label={typeof children === "string" ? children : "Badge"}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-1 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition"
          aria-label="Supprimer le badge"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.span>
  )
}
Badge.displayName = "Badge"