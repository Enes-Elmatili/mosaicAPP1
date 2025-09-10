"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cx"

type SwitchProps = {
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  label?: string
  className?: string
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  size = "md",
  label,
  className,
}: SwitchProps) {
  const sizes = {
    sm: { track: "w-8 h-4", thumb: "w-3 h-3", translate: "translate-x-4" },
    md: { track: "w-10 h-5", thumb: "w-4 h-4", translate: "translate-x-5" },
    lg: { track: "w-14 h-7", thumb: "w-6 h-6", translate: "translate-x-7" },
  }

  const { track, thumb, translate } = sizes[size]

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors focus:outline-none",
        track,
        checked
          ? "bg-primary"
          : "bg-neutral-300 dark:bg-neutral-700",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "inline-block rounded-full bg-white shadow transform",
          thumb,
          checked ? translate : "translate-x-1"
        )}
      />
    </button>
  )
}
Switch.displayName = "Switch"