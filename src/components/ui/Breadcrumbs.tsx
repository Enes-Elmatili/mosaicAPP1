"use client"

import * as React from "react"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/cx"

type Crumb = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: Crumb[]
  className?: string
  collapseAfter?: number // combien d’items visibles avant collapse
}

export function Breadcrumbs({
  items,
  className,
  collapseAfter = 3,
}: BreadcrumbsProps) {
  const [expanded, setExpanded] = React.useState(false)
  const visibleItems =
    !expanded && items.length > collapseAfter
      ? [items[0], { label: "…", href: undefined }, ...items.slice(-2)]
      : items

  return (
    <nav
      aria-label="breadcrumb"
      className={cn("flex items-center text-sm", className)}
    >
      <ol role="list" className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
        {visibleItems.map((item, i) => {
          const isLast = i === visibleItems.length - 1
          const isEllipsis = item.label === "…"

          return (
            <li key={i} role="listitem" className="flex items-center gap-1">
              {isEllipsis ? (
                <button
                  onClick={() => setExpanded(true)}
                  className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  aria-label="Voir tout le chemin"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              ) : item.href && !isLast ? (
                <a
                  href={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    isLast
                      ? "font-medium text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-600 dark:text-neutral-400"
                  )}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-600" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
Breadcrumbs.displayName = "Breadcrumbs"