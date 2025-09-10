"use client"

import * as React from "react"
import { cn } from "@/lib/cx"

type CardProps = {
  variant?: "surface" | "elevated" | "outline"
  fullWidth?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export function Card({
  variant = "surface",
  fullWidth = false,
  className,
  children,
  ...props
}: CardProps) {
  const variants: Record<typeof variant, string> = {
    surface: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800",
    elevated:
      "bg-white dark:bg-neutral-900 shadow-lg shadow-neutral-200/50 dark:shadow-black/30",
    outline:
      "bg-transparent border border-neutral-300 dark:border-neutral-700",
  }

  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-200",
        variants[variant],
        fullWidth && "w-full",
        "hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* Sub-components */

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold text-neutral-900 dark:text-neutral-100",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

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

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-neutral-700 dark:text-neutral-300", className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-4 flex items-center justify-end gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}
CardHeader.displayName = "Card.Header" 