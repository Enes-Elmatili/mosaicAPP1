"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cx"

type TypingIndicatorProps = {
  sender?: "client" | "provider"
  visible?: boolean
  className?: string
}

export function TypingIndicator({
  sender = "provider",
  visible = true,
  className,
}: TypingIndicatorProps) {
  if (!visible) return null

  const isClient = sender === "client"

  const dotVariants = {
    animate: {
      y: [0, -3, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full",
        isClient ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-2xl text-sm shadow-sm",
          isClient
            ? "bg-primary text-white rounded-br-sm"
            : "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-sm"
        )}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={cn(
              "h-2 w-2 rounded-full",
              isClient ? "bg-white" : "bg-neutral-500 dark:bg-neutral-300"
            )}
            variants={dotVariants}
            animate="animate"
            transition={{ delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  )
}
TypingIndicator.displayName = "TypingIndicator"