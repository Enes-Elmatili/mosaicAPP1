"use client"

import * as React from "react"
import { cn } from "@/lib/cx"
import { ChevronRight } from "lucide-react"

type ListProps = {
  children: React.ReactNode
  className?: string
}

export function List({ children, className }: ListProps) {
  return (
    <div
      role="list"
      className={cn(
        "divide-y divide-neutral-200 dark:divide-neutral-800 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900",
        className
      )}
    >
      {children}
    </div>
  )
}

type CellProps = {
  title: string
  description?: string
  leading?: React.ReactNode
  action?: React.ReactNode
  onClick?: () => void
  chevron?: boolean
  destructive?: boolean
  className?: string
}

export function Cell({
  title,
  description,
  leading,
  action,
  onClick,
  chevron = false,
  destructive = false,
  className,
}: CellProps) {
  const Wrapper = onClick ? "button" : "div"

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 text-left transition",
        onClick && "hover:bg-neutral-50 dark:hover:bg-neutral-800",
        destructive && "text-red-600 dark:text-red-400",
        className
      )}
    >
      {/* Contenu gauche */}
      <div className="flex items-center gap-3">
        {leading && <div className="text-neutral-500">{leading}</div>}
        <div className="flex flex-col">
          <span
            className={cn(
              "text-sm font-medium",
              destructive
                ? "text-red-600 dark:text-red-400"
                : "text-neutral-900 dark:text-neutral-100"
            )}
          >
            {title}
          </span>
          {description && (
            <span
              className={cn(
                "text-xs",
                destructive
                  ? "text-red-500 dark:text-red-300"
                  : "text-neutral-500 dark:text-neutral-400"
              )}
            >
              {description}
            </span>
          )}
        </div>
      </div>

      {/* Action / Chevron */}
      <div className="flex items-center gap-2 ml-3">
        {action}
        {chevron && (
          <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
        )}
      </div>
    </Wrapper>
  )
}
Cell.displayName = "Cell"