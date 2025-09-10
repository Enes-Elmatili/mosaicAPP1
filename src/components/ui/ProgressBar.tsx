// src/components/ui/Progress.tsx
"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cx"

type ProgressProps = {
  value: number // 0–100
  max?: number
  label?: string
  variant?: "bar" | "circle"
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  className?: string
}

export function Progress({
  value,
  max = 100,
  label,
  variant = "bar",
  size = "md",
  showValue = true,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max(value, 0), max)

  const sizes = {
    sm: { height: "h-2", radius: 20, stroke: 3 },
    md: { height: "h-3", radius: 24, stroke: 4 },
    lg: { height: "h-4", radius: 32, stroke: 6 },
  }

  const { height, radius, stroke } = sizes[size]

  if (variant === "bar") {
    return (
      <div className={cn("w-full", className)}>
        {label && (
          <p className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </p>
        )}
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={max}
          className={cn(
            "relative w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden",
            height
          )}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(percentage / max) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full bg-black dark:bg-white rounded-full" // 👈 forcé noir/blanc
          />
        </div>
        {showValue && (
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            {percentage}%
          </p>
        )}
      </div>
    )
  }

  // --- Variante cercle ---
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / max) * circumference

  return (
    <div
      className={cn("flex flex-col items-center justify-center", className)}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <svg
        className="transform -rotate-90"
        width={radius * 2 + stroke * 2}
        height={radius * 2 + stroke * 2}
      >
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          strokeWidth={stroke}
          className="fill-none stroke-neutral-200 dark:stroke-neutral-800"
        />
        <motion.circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          className="fill-none stroke-black dark:stroke-white" // 👈 forcé noir/blanc
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </svg>
      {label && (
        <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </p>
      )}
      {showValue && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          {percentage}%
        </p>
      )}
    </div>
  )
}
Progress.displayName = "Progress"
