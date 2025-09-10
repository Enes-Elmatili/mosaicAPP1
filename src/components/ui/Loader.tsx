"use client"

import * as React from "react"
import { cn } from "@/lib/cx"

type LoaderProps = {
  label?: string
  size?: "sm" | "md" | "lg"
  variant?: "spinner" | "dots" | "bar"
  fullscreen?: boolean
  className?: string
}

export const Loader: React.FC<LoaderProps> = ({
  label,
  size = "md",
  variant = "spinner",
  fullscreen = false,
  className,
}) => {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-neutral-700 dark:text-neutral-300",
        fullscreen && "fixed inset-0 bg-white/70 dark:bg-black/70 z-50",
        className
      )}
    >
      {/* Spinner variant */}
      {variant === "spinner" && (
        <div
          className={cn(
            "rounded-full border-t-transparent border-primary animate-spin",
            sizes[size]
          )}
        />
      )}

      {/* Dots variant */}
      {variant === "dots" && (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "w-2 h-2 rounded-full bg-primary animate-bounce",
                i === 1 && "animation-delay-150",
                i === 2 && "animation-delay-300"
              )}
            />
          ))}
        </div>
      )}

      {/* Progress bar variant */}
      {variant === "bar" && (
        <div className="w-40 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-primary animate-[progress_1.5s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Label */}
      {label && <p className="mt-3 text-sm font-medium">{label}</p>}
    </div>
  )
}
Loader.displayName = "Loader"