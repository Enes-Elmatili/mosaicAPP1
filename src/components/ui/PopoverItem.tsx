"use client"

import * as React from "react"
import { cn } from "@/lib/cx"

type PopoverItemProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function PopoverItem({ children, onClick, className }: PopoverItemProps) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition",
        className
      )}
    >
      {children}
    </button>
  )
}
PopoverItem.displayName = "PopoverItem"