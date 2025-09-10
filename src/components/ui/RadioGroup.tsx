"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cx"

type Option = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

type RadioGroupProps = {
  options: Option[]
  value: string
  onChange: (val: string) => void
  label?: string
  helperText?: string
  className?: string
}

export function RadioGroup({
  options,
  value,
  onChange,
  label,
  helperText,
  className,
}: RadioGroupProps) {
  const groupRef = React.useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = options.findIndex((o) => o.value === value)
    let newIndex = currentIndex

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      newIndex = (currentIndex + 1) % options.length
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      newIndex = (currentIndex - 1 + options.length) % options.length
    }

    if (newIndex !== currentIndex) {
      e.preventDefault()
      onChange(options[newIndex].value)
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      ref={groupRef}
      onKeyDown={handleKeyDown}
      className={cn("space-y-2", className)}
    >
      {label && (
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
          {label}
        </p>
      )}
      {options.map((opt) => {
        const checked = value === opt.value
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={checked}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange(opt.value)}
            className={cn(
              "flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition",
              "border-neutral-300 dark:border-neutral-700",
              "hover:bg-neutral-50 dark:hover:bg-neutral-800",
              checked &&
                "border-primary bg-primary/5 text-primary",
              opt.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <motion.span
              layout
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border",
                checked
                  ? "border-primary bg-primary text-white"
                  : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
              )}
            >
              {checked && (
                <motion.span
                  layoutId="dot"
                  className="h-2.5 w-2.5 rounded-full bg-white"
                />
              )}
            </motion.span>
            <span className="flex-1">
              <span className="block font-medium">{opt.label}</span>
              {opt.description && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {opt.description}
                </span>
              )}
            </span>
          </button>
        )
      })}
      {helperText && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {helperText}
        </p>
      )}
    </div>
  )
}
RadioGroup.displayName = "RadioGroup"
