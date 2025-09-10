"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/cx"

export type CheckboxProps = {
  label?: string
  description?: string
  error?: string
  success?: string
  indeterminate?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      success,
      indeterminate = false,
      checked,
      onChange,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const internalRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate
      }
    }, [indeterminate])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e.target.checked)
    }

    return (
      <div className={cn("flex items-start gap-3", disabled && "opacity-50", className)}>
        <label className="relative flex items-center cursor-pointer select-none">
          <input
            ref={(el) => {
              internalRef.current = el
              if (typeof ref === "function") ref(el)
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el
            }}
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            {...props}
          />
          <span
            className={cn(
              "flex items-center justify-center h-5 w-5 rounded-md border transition-colors",
              "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700",
              "group-hover:border-neutral-400",
              checked || indeterminate
                ? "bg-primary border-primary text-white"
                : "text-transparent",
              error && "border-red-500",
              success && "border-green-500"
            )}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={
                checked
                  ? { scale: 1, opacity: 1 }
                  : indeterminate
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0, opacity: 0 }
              }
              transition={{ duration: 0.2 }}
            >
              {indeterminate ? (
                <Minus className="h-3 w-3" strokeWidth={3} />
              ) : (
                <Check className="h-3 w-3" strokeWidth={3} />
              )}
            </motion.div>
          </span>
        </label>

        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {description}
            </span>
          )}
          {error && <span className="text-xs text-red-500">{error}</span>}
          {success && <span className="text-xs text-green-500">{success}</span>}
        </div>
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"