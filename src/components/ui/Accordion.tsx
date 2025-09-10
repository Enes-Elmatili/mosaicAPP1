"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/cx"

type AccordionItemProps = {
  id: string
  title: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}

function AccordionItem({ id, title, children, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-700">
      <button
        id={`accordion-header-${id}`}
        aria-controls={`accordion-panel-${id}`}
        aria-expanded={isOpen}
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium",
          "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
        )}
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`accordion-panel-${id}`}
            role="region"
            aria-labelledby={`accordion-header-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden px-4 pb-3 text-sm text-neutral-600 dark:text-neutral-400"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type AccordionProps = {
  items: { id: string; title: string; content: React.ReactNode }[]
  singleOpen?: boolean
  defaultOpenIds?: string[]
  className?: string
}

export function Accordion({
  items,
  singleOpen = false,
  defaultOpenIds = [],
  className,
}: AccordionProps) {
  const [openIds, setOpenIds] = React.useState<string[]>(defaultOpenIds)

  function toggle(id: string) {
    setOpenIds((prev) => {
      if (singleOpen) {
        return prev.includes(id) ? [] : [id]
      }
      return prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    })
  }

  return (
    <div className={cn("rounded-lg border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-700", className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          title={item.title}
          isOpen={openIds.includes(item.id)}
          onToggle={() => toggle(item.id)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  )
}
Accordion.displayName = "Accordion"