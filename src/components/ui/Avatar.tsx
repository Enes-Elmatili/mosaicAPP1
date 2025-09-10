"use client"

import * as React from "react"
import { cn } from "@/lib/cx"

type AvatarProps = {
  src?: string
  alt?: string
  size?: "sm" | "md" | "lg" | "xl"
  fallback?: string // ex: initiales "JD"
  className?: string
}

export function Avatar({
  src,
  alt,
  size = "md",
  fallback,
  className,
}: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-24 h-24 text-lg",
  }

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-semibold text-neutral-700 dark:text-neutral-200",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? "Avatar"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  )
}
Avatar.displayName = "Avatar"