"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { cn } from "@/lib/cx"

type StarRatingProps = {
  value: number
  onChange?: (val: number) => void
  max?: number
  readOnly?: boolean
  allowHalf?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StarRating({
  value,
  onChange,
  max = 5,
  readOnly = false,
  allowHalf = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hover, setHover] = React.useState<number | null>(null)

  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const handleClick = (index: number, half: boolean) => {
    if (readOnly || !onChange) return
    const newValue = half && allowHalf ? index + 0.5 : index + 1
    onChange(newValue)
  }

  const displayedValue = hover ?? value

  return (
    <div
      role="radiogroup"
      aria-label="Évaluation"
      className={cn("flex items-center gap-1", className)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const full = displayedValue >= i + 1
        const half = allowHalf && displayedValue >= i + 0.5 && displayedValue < i + 1
        return (
          <div
            key={i}
            role="radio"
            aria-checked={value === i + 1}
            className="relative cursor-pointer"
            onMouseEnter={() => !readOnly && setHover(i + 1)}
            onMouseLeave={() => !readOnly && setHover(null)}
            onClick={() => handleClick(i, false)}
          >
            {/* Full star */}
            <motion.div
              whileHover={!readOnly ? { scale: 1.1 } : {}}
              whileTap={!readOnly ? { scale: 0.9 } : {}}
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                full || half ? "text-yellow-500" : "text-neutral-300 dark:text-neutral-600"
              )}
            >
              <Star className={sizes[size]} fill={full ? "currentColor" : "none"} />
            </motion.div>

            {/* Half star overlay */}
            {half && (
              <motion.div
                className={cn(
                  "absolute inset-0 flex items-center justify-center overflow-hidden text-yellow-500"
                )}
                style={{ width: "50%", clipPath: "inset(0 50% 0 0)" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Star className={sizes[size]} fill="currentColor" />
              </motion.div>
            )}

            {/* Invisible button for accessibility */}
            <button
              type="button"
              className="absolute inset-0 opacity-0"
              aria-label={`${i + 1} étoile${i + 1 > 1 ? "s" : ""}`}
              onClick={() => handleClick(i, false)}
            />
            {allowHalf && (
              <button
                type="button"
                className="absolute inset-y-0 left-0 w-1/2 opacity-0"
                aria-label={`${i + 0.5} étoile`}
                onClick={() => handleClick(i, true)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
StarRating.displayName = "StarRating"