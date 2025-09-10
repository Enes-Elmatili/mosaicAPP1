"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cx"

type Tab = {
  id: string
  label: string
  content: React.ReactNode
}

type TabsProps = {
  tabs: Tab[]
  defaultTabId?: string
  onChange?: (id: string) => void
  className?: string
}

export function Tabs({ tabs, defaultTabId, onChange, className }: TabsProps) {
  const [active, setActive] = React.useState(defaultTabId ?? tabs[0].id)
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  const activeIndex = tabs.findIndex((t) => t.id === active)

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      const next = (index + 1) % tabs.length
      tabRefs.current[next]?.focus()
      setActive(tabs[next].id)
      onChange?.(tabs[next].id)
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      const prev = (index - 1 + tabs.length) % tabs.length
      tabRefs.current[prev]?.focus()
      setActive(tabs[prev].id)
      onChange?.(tabs[prev].id)
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onChange?.(tabs[index].id)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Tab headers */}
      <div
        role="tablist"
        className="relative flex gap-6 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto scrollbar-none"
      >
        {tabs.map((tab, i) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[i] = el)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => {
                setActive(tab.id)
                onChange?.(tab.id)
              }}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={cn(
                "relative py-2 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "text-primary"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
              )}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary"
                  transition={{ duration: 0.25 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab panels */}
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            hidden={tab.id !== active}
            className="focus:outline-none"
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
Tabs.displayName = "Tabs"