"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cx"

type MessageSystemProps = {
  text: string
  type?: "info" | "success" | "warning" | "error"
  time?: string
  className?: string
}

export function MessageSystem({
  text,
  type = "info",
  time,
  className,
}: MessageSystemProps) {
  const colors = {
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100",
    success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100",
    error: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100",
  }

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className={cn("flex justify-center w-full", className)}
    >
      <div
        className={cn(
          "inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full font-medium shadow-sm",
          colors[type]
        )}
      >
        <span>{text}</span>
        {time && <span className="opacity-70">{time}</span>}
      </div>
    </motion.div>
  )
}
MessageSystem.displayName = "MessageSystem"