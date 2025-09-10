"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/cx"

type Option = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

type CheckboxGroupProps = {
  options: Option[]
  value: string[]
  onChange: (val: string[]) => void
  label?: string
  helperText?: string
  className?: string
}

export function CheckboxGroup({
  options,
  value,
  onChange,
  label,
  helperText,
  className,
}: CheckboxGroupProps) {
  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("space-y-2", className)}
    >
      {label && (
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">
          {label}
        </p>
      )}
      {options.map((opt) => {
        const checked = value.includes(opt.value)
        return (
          <button
            key={opt.value}
            role="checkbox"
            aria-checked={checked}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && toggle(opt.value)}
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
                "flex h-5 w-5 items-center justify-center rounded-md border",
                checked
                  ? "bg-primary border-primary text-white"
                  : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
              )}
            >
              {checked && <Check className="h-4 w-4" />}
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
CheckboxGroup.displayName = "CheckboxGroup"