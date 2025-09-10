"use client"

import * as React from "react"
import { cn } from "@/lib/cx"
import { motion } from "framer-motion"
import { Search, Inbox, AlertTriangle, Info } from "lucide-react"

type EmptyStateVariant = "default" | "search" | "error" | "info"

type EmptyStateProps = {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  variant?: EmptyStateVariant
  fullHeight?: boolean
  className?: string
}

const variantIcons: Record<EmptyStateVariant, React.ReactNode> = {
  default: <Inbox className="h-16 w-16 text-neutral-400" aria-hidden="true" />,
  search: <Search className="h-16 w-16 text-blue-500" aria-hidden="true" />,
  error: <AlertTriangle className="h-16 w-16 text-red-500" aria-hidden="true" />,
  info: <Info className="h-16 w-16 text-blue-500" aria-hidden="true" />,
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  variant = "default",
  fullHeight = false,
  className,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12 text-neutral-600 dark:text-neutral-300",
        fullHeight && "min-h-[60vh]",
        className
      )}
    >
      {/* Illustration / Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mb-4"
      >
        {icon ?? variantIcons[variant]}
      </motion.div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm max-w-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}

      {/* Action */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
EmptyState.displayName = "EmptyState"