"use client"

import * as React from "react"
import { cn } from "@/lib/cx"
import { ChevronRight } from "lucide-react"
import { Cell } from "recharts"

/* ---------------- LIST ITEM ---------------- */

type ListItemProps = {
  title: string
  description?: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  chevron?: boolean
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
  className?: string
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  description,
  leading,
  trailing,
  chevron = false,
  onClick,
  disabled = false,
  destructive = false,
  className,
}) => {
  const Wrapper = onClick ? "button" : "div"

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-4 px-4 py-3 text-left transition",
        onClick && !disabled && "hover:bg-neutral-50 dark:hover:bg-neutral-800",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Leading icon/avatar */}
      {leading && <div className="flex-shrink-0">{leading}</div>}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            destructive
              ? "text-red-600 dark:text-red-400"
              : "text-neutral-900 dark:text-neutral-100"
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "text-xs truncate",
              destructive
                ? "text-red-500 dark:text-red-300"
                : "text-neutral-500 dark:text-neutral-400"
            )}
          >
            {description}
          </p>
        )}
      </div>

      {/* Trailing meta/element */}
      {trailing && <div className="flex-shrink-0">{trailing}</div>}

      {/* Chevron */}
      {chevron && (
        <ChevronRight className="h-4 w-4 text-neutral-400 flex-shrink-0" />
      )}
    </Wrapper>
  )
}

ListItem.displayName = "ListItem"

/* ---------------- LIST SECTION ---------------- */

type ListSectionProps = {
  title: string
  children: React.ReactNode
  className?: string
}

export const ListSection: React.FC<ListSectionProps> = ({
  title,
  children,
  className,
}) => {
  return (
    <div className={cn("mb-6", className)}>
      <h4 className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
        {title}
      </h4>
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {children}
      </div>
    </div>
  )
}

ListSection.displayName = "ListSection"

/* ---------------- LIST CONTAINER ---------------- */

type ListContainerProps = {
  children: React.ReactNode
  className?: string
}

export const ListContainer: React.FC<ListContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "divide-y divide-neutral-200 dark:divide-neutral-800 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900",
        className
      )}
    >
      {children}
    </div>
  )
}

ListContainer.displayName = "ListContainer"

/* ---------------- CARD DESCRIPTION ---------------- */

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-neutral-600 dark:text-neutral-400", className)}
      {...props}
    >
      {children}
    </p>
  )
}
Cell.displayName = "Cell"