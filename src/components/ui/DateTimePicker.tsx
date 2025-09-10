"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/cx"

type DateTimePickerProps = {
  value?: Date | null
  onChange: (date: Date | null) => void
  withTime?: boolean
  range?: boolean
  label?: string
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  withTime = false,
  range = false,
  label,
  className,
}: DateTimePickerProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = React.useState(
    value ? new Date(value) : new Date()
  )
  const [selected, setSelected] = React.useState<Date | null>(value ?? null)
  const [time, setTime] = React.useState({
    hours: value ? value.getHours() : 12,
    minutes: value ? value.getMinutes() : 0,
  })
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  // Fermer au clic externe
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  )
  const endOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  )

  const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => i + 1)

  // Décalage du premier jour (lundi = 0)
  const weekdayOffset = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1

  function selectDate(day: number) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
      time.hours,
      time.minutes
    )
    setSelected(date)
    onChange(date)
    if (!withTime) setOpen(false)
  }

  function handleTimeChange(type: "hours" | "minutes", val: number) {
    const newTime = { ...time, [type]: val }
    setTime(newTime)
    if (selected) {
      const updated = new Date(selected)
      updated.setHours(newTime.hours)
      updated.setMinutes(newTime.minutes)
      setSelected(updated)
      onChange(updated)
    }
  }

  return (
    <div className={cn("relative w-full", className)} ref={ref}>
      {label && (
        <p className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
          "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700",
          "text-neutral-900 dark:text-neutral-100",
          "focus:outline-none focus:ring-2 focus:ring-primary/40"
        )}
      >
        <span>
          {selected
            ? selected.toLocaleString([], {
                dateStyle: "medium",
                timeStyle: withTime ? "short" : undefined,
              })
            : "Choisir une date"}
        </span>
        <Calendar className="h-4 w-4 text-neutral-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 mt-1 w-full rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-lg p-4"
          >
            {/* Header calendrier */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                  )
                }
                aria-label="Mois précédent"
              >
                <ChevronLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
              </button>
              <p className="font-medium text-neutral-800 dark:text-neutral-100 capitalize">
                {currentMonth.toLocaleString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                  )
                }
                aria-label="Mois suivant"
              >
                <ChevronRight className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
              </button>
            </div>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              {["L", "M", "M", "J", "V", "S", "D"].map((d) => (
                <span key={d} className="flex justify-center">
                  {d}
                </span>
              ))}
            </div>

            {/* Jours */}
            <div className="grid grid-cols-7 gap-1 text-sm">
              {Array.from({ length: weekdayOffset }).map((_, i) => (
                <span key={`empty-${i}`} />
              ))}
              {daysInMonth.map((day) => {
                const date = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  day
                )
                const isSelected =
                  selected &&
                  date.toDateString() === selected.toDateString()
                const isToday = date.toDateString() === today.toDateString()

                return (
                  <button
                    key={day}
                    onClick={() => selectDate(day)}
                    className={cn(
                      "h-9 w-9 flex items-center justify-center rounded-full transition",
                      isSelected
                        ? "bg-primary text-white"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                      isToday &&
                        !isSelected &&
                        "border border-primary text-primary"
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Time Picker */}
            {withTime && (
              <div className="mt-4 flex items-center gap-4">
                <Clock className="h-4 w-4 text-neutral-400" />
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={time.hours}
                  onChange={(e) =>
                    handleTimeChange("hours", parseInt(e.target.value) || 0)
                  }
                  className="w-16 rounded-md border px-2 py-1 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
                :
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={time.minutes}
                  onChange={(e) =>
                    handleTimeChange("minutes", parseInt(e.target.value) || 0)
                  }
                  className="w-16 rounded-md border px-2 py-1 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
