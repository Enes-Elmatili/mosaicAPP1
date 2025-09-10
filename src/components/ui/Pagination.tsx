"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/cx"

type PaginationProps = {
  page: number
  totalPages: number
  onChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) onChange(p)
  }

  const getPages = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, "…", totalPages)
      } else if (page >= totalPages - 3) {
        pages.push(1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "…", page - 1, page, page + 1, "…", totalPages)
      }
    }
    return pages
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1 mt-4", className)}
    >
      {/* Previous */}
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page === 1}
        aria-label="Page précédente"
        className={cn(
          "p-2 rounded-md border text-sm flex items-center justify-center transition",
          "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          page === 1 && "opacity-50 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Pages */}
      {getPages().map((p, i) =>
        typeof p === "number" ? (
          <motion.button
            key={i}
            onClick={() => goToPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm transition",
              p === page
                ? "bg-primary text-white"
                : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            {p}
          </motion.button>
        ) : (
          <span
            key={i}
            className="px-2 text-neutral-400 dark:text-neutral-600"
            aria-hidden="true"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        )
      )}

      {/* Next */}
      <button
        onClick={() => goToPage(page + 1)}
        disabled={page === totalPages}
        aria-label="Page suivante"
        className={cn(
          "p-2 rounded-md border text-sm flex items-center justify-center transition",
          "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          page === totalPages && "opacity-50 cursor-not-allowed"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
Pagination.displayName = "Pagination"