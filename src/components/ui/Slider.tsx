"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cx"

type SliderProps = {
  value: number | [number, number]
  onChange: (value: number | [number, number]) => void
  min?: number
  max?: number
  step?: number
  label?: string
  showValue?: boolean
  range?: boolean
  disabled?: boolean
  className?: string
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  range = false,
  disabled = false,
  className,
}: SliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)

  const values = Array.isArray(value) ? value : [value]
  const percent = values.map((v) => ((v - min) / (max - min)) * 100)

  const updateValue = (index: number, clientX: number) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = (clientX - rect.left) / rect.width
    let newVal = Math.round((min + ratio * (max - min)) / step) * step
    newVal = Math.max(min, Math.min(newVal, max))

    if (range) {
      const newRange: [number, number] = [...values] as [number, number]
      newRange[index] = newVal
      if (newRange[0] > newRange[1]) newRange.sort((a, b) => a - b)
      onChange(newRange)
    } else {
      onChange(newVal)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    let delta = 0
    if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = step
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -step
    if (delta !== 0) {
      e.preventDefault()
      const newVal = Math.max(min, Math.min(values[index] + delta, max))
      if (range) {
        const newRange: [number, number] = [...values] as [number, number]
        newRange[index] = newVal
        onChange(newRange)
      } else {
        onChange(newVal)
      }
    }
  }

  return (
    <div className={cn("w-full", disabled && "opacity-50", className)}>
      {label && (
        <p className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {label}
        </p>
      )}
      <div
        ref={trackRef}
        className={cn(
          "relative h-2 rounded-full bg-neutral-200 dark:bg-neutral-800"
        )}
      >
        {/* Track filled */}
        <div
          className="absolute h-2 bg-primary rounded-full"
          style={{
            left: `${range ? percent[0] : 0}%`,
            right: `${range ? 100 - percent[1] : 100 - percent[0]}%`,
          }}
        />

        {/* Handles */}
        {values.map((v, i) => (
          <motion.div
            key={i}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuenow={v}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-label={range ? `Valeur ${i + 1}` : "Valeur"}
            onKeyDown={(e) => handleKeyDown(i, e)}
            drag="x"
            dragConstraints={trackRef}
            dragElastic={0}
            onDrag={(e, info) => updateValue(i, info.point.x)}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow cursor-pointer flex items-center justify-center",
              "focus:outline-none focus:ring-2 focus:ring-primary/40"
            )}
            style={{ left: `${percent[i]}%`, x: "-50%" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              layoutId="slider-dot"
              className="h-2.5 w-2.5 rounded-full bg-primary"
            />
          </motion.div>
        ))}
      </div>

      {showValue && (
        <div className="mt-2 flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <span>{min}</span>
          <span>
            {range ? `${values[0]} – ${values[1]}` : values[0]}
          </span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}
Slider.displayName = "Slider"