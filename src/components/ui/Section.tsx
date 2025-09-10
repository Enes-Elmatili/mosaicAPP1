"use client"

import * as React from "react"
import { cn } from "@/lib/cx"

type SectionProps = {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Section({ title, description, children, className }: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {/* Header */}
      <header>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        )}
      </header>

      {/* Content */}
      <div className="space-y-4">{children}</div>
    </section>
  )
}
