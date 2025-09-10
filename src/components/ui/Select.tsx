"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/cx"

type Option = { value: string; label: string }

type SelectProps = {
  options: Option[]
  value: string | string[] | null
  onChange: (val: string | string[] | null) => void
  multiple?: boolean
  searchable?: boolean
  placeholder?: string
  label?: string
  className?: string
}

export function Select({
  options,
  value,
  onChange,
  multiple = false,
  searchable = false,
  placeholder = "Sélectionner…",
  label,
  className,
}: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)
  const id = React.useId()

  // clic externe → fermer
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // ✅ on force le bon type selon multiple
  const selectedValues: string[] = multiple
    ? (value as string[] | null) ?? []
    : value && typeof value === "string"
    ? [value]
    : []

  const filteredOptions = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  const handleSelect = (val: string) => {
    if (multiple) {
      if (selectedValues.includes(val)) {
        onChange(selectedValues.filter((v: string) => v !== val))
      } else {
        onChange([...selectedValues, val])
      }
    } else {
      onChange(val)
      setOpen(false)
    }
  }

  const handleRemoveTag = (val: string) => {
    if (multiple) {
      onChange(selectedValues.filter((v: string) => v !== val))
    } else {
      onChange(null)
    }
  }

  return (
    <div className={cn("w-full", className)} ref={ref}>
      {label && (
        <p className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={id}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm",
          "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700",
          "text-neutral-900 dark:text-neutral-100",
          "focus:outline-none focus:ring-2 focus:ring-primary/40"
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {multiple ? (
            selectedValues.length > 0 ? (
              selectedValues.map((val: string) => {
                const opt = options.find((o) => o.value === val)
                return (
                  <span
                    key={val}
                    className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary"
                  >
                    {opt?.label ?? val}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveTag(val)
                      }}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              })
            ) : (
              <span className="text-neutral-400">{placeholder}</span>
            )
          ) : selectedValues.length > 0 ? (
            options.find((o) => o.value === selectedValues[0])?.label ?? placeholder
          ) : (
            <span className="text-neutral-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-neutral-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-labelledby={id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-1 w-full rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-lg max-h-60 overflow-auto"
          >
            {searchable && (
              <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher…"
                  className="w-full px-2 py-1 text-sm rounded-md bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                />
              </div>
            )}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value)
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition",
                      "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                      isSelected && "bg-primary/10 text-primary"
                    )}
                  >
                    {opt.label}
                    {isSelected && <Check className="h-4 w-4" />}
                  </li>
                )
              })
            ) : (
              <li className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                Aucune option
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
Select.displayName = "Select"
