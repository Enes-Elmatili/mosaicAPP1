"use client"

import * as React from "react"
import { cn } from "@/lib/cx"

type SkeletonProps = {
  variant?: "text" | "circle" | "rect" | "avatar" | "card"
  width?: number | string
  height?: number | string
  className?: string
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className,
}: SkeletonProps) {
  const baseStyles =
    "relative overflow-hidden bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse"
  const shimmer =
    "absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"

  const sizes = {
    text: "h-4 w-32 rounded",
    circle: "h-10 w-10 rounded-full",
    avatar: "h-12 w-12 rounded-full",
    rect: "h-6 w-24 rounded-md",
    card: "h-32 w-full rounded-xl",
  }

  return (
    <div
      className={cn(
        baseStyles,
        sizes[variant],
        className
      )}
      style={{ width, height }}
      aria-busy="true"
      aria-live="polite"
    >
      <div className={shimmer} />
    </div>
  )
}
Skeleton.displayName = "Skeleton"
