"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/cx"

type CalendarEvent = {
  id: string
  date: Date
  title: string
  description?: string
}

type CalendarProps = {
  events?: CalendarEvent[]
  onSelectDate?: (date: Date) => void
  onSelectEvent?: (event: CalendarEvent) => void
  className?: string
}

export function Calendar({
  events = [],
  onSelectDate,
  onSelectEvent,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startDay = startOfMonth.getDay() === 0 ? 7 : startOfMonth.getDay()
  const daysInMonth = endOfMonth.getDate()

  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  const today = () => setCurrentMonth(new Date())

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()

  return (
    <div
      className={cn(
        "w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-semibold">
          {currentMonth.toLocaleString("fr-FR", { month: "long", year: "numeric" })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      {/* Grid days */}
      <div className="grid grid-cols-7 gap-1 text-sm">
        {Array.from({ length: startDay - 1 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          const dayEvents = events.filter((e) => isSameDay(e.date, date))
          const isToday = isSameDay(date, new Date())

          return (
            <button
              key={day}
              onClick={() => onSelectDate?.(date)}
              className={cn(
                "flex flex-col items-center justify-start p-2 rounded-lg border transition min-h-[60px] relative",
                isToday
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              <span className="text-xs font-medium">{day}</span>
              <div className="flex flex-col gap-0.5 mt-1 w-full">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectEvent?.(event)
                    }}
                    className="text-[10px] truncate px-1 py-0.5 rounded bg-primary/20 text-primary cursor-pointer"
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[10px] text-neutral-400">
                    +{dayEvents.length - 2} autres
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Today button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={today}
          className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primary/90 transition"
        >
          <CalendarIcon className="h-4 w-4" />
          Aujourd’hui
        </button>
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"
