"use client"

import * as React from "react"
import { cn } from "@/lib/cx"

type ChatContainerProps = {
  children: React.ReactNode
  className?: string
}

export function ChatContainer({ children, className }: ChatContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Scroll auto vers le bas à chaque nouveau message
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [children])

  return (
    <div
      ref={containerRef}
      role="log"
      aria-live="polite"
      className={cn(
        "flex-1 overflow-y-auto px-4 py-3 space-y-3",
        "bg-neutral-50 dark:bg-neutral-950",
        "scroll-smooth scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700",
        className
      )}
    >
      {children}
    </div>
  )
}
ChatContainer.displayName = "ChatContainer"