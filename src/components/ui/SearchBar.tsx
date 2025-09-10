"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Mic } from "lucide-react"
import { cn } from "@/lib/cx"

type SearchBarProps = {
  value: string
  onChange: (val: string) => void
  onSearch?: (val: string) => void
  suggestions?: string[]
  placeholder?: string
  enableVoice?: boolean
  className?: string
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  suggestions = [],
  placeholder = "Rechercher…",
  enableVoice = false,
  className,
}: SearchBarProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listboxId = React.useId()

  // Voice input (Web Speech API)
  const handleVoice = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("La reconnaissance vocale n’est pas supportée par ce navigateur.")
      return
    }
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = "fr-FR"
    recognition.start()
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onChange(transcript)
      onSearch?.(transcript)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) =>
        prev === null || prev === suggestions.length - 1 ? 0 : prev + 1
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) =>
        prev === null || prev === 0 ? suggestions.length - 1 : prev - 1
      )
    } else if (e.key === "Enter") {
      if (activeIndex !== null && suggestions[activeIndex]) {
        onChange(suggestions[activeIndex])
        onSearch?.(suggestions[activeIndex])
        setActiveIndex(null)
      } else {
        onSearch?.(value)
      }
    }
  }

  return (
    <div role="search" className={cn("relative w-full max-w-md", className)}>
      <div className="flex items-center gap-2 rounded-lg border bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 px-3 py-2 focus-within:ring-2 focus-within:ring-primary/40">
        <Search className="h-4 w-4 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={suggestions.length > 0}
          aria-activedescendant={
            activeIndex !== null ? `suggestion-${activeIndex}` : undefined
          }
          className="flex-1 bg-transparent outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            aria-label="Effacer"
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4 text-neutral-500" />
          </button>
        )}
        {enableVoice && (
          <button
            onClick={handleVoice}
            aria-label="Recherche vocale"
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Mic className="h-4 w-4 text-neutral-500" />
          </button>
        )}
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.ul
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-lg"
          >
            {suggestions.map((s, i) => (
              <li
                key={i}
                id={`suggestion-${i}`}
                role="option"
                aria-selected={activeIndex === i}
                onMouseDown={() => {
                  onChange(s)
                  onSearch?.(s)
                  setActiveIndex(null)
                }}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer",
                  activeIndex === i
                    ? "bg-primary text-white"
                    : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                )}
              >
                {s}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
SearchBar.displayName = "SearchBar"