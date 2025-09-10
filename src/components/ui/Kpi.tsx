"use client"

import * as React from "react"
import { cn } from "@/lib/cx"

/* ---------------- KpiCard ---------------- */

type KpiCardProps = {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number // ex: +12 ou -5
    label: string // ex: "vs mois dernier"
  }
  variant?: "default" | "success" | "warning" | "danger" | "info"
  className?: string
}

export function KpiCard({
  title,
  value,
  icon,
  trend,
  variant = "default",
  className,
}: KpiCardProps) {
  const variants: Record<NonNullable<KpiCardProps["variant"]>, string> = {
    default:
      "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800",
    success:
      "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-700",
    warning:
      "bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-700",
    danger:
      "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700",
    info: "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700",
  }

  return (
    <div
      className={cn(
        "rounded-2xl p-4 flex flex-col gap-3 shadow-sm transition hover:shadow-md",
        variants[variant],
        className
      )}
    >
      {/* Header avec icône */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {title}
        </p>
        {icon && <div className="text-neutral-500">{icon}</div>}
      </div>

      {/* Valeur */}
      <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        {value}
      </p>

      {/* Tendance */}
      {trend && (
        <p
          className={cn(
            "text-xs font-medium",
            trend.value > 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}{" "}
          <span className="text-neutral-500 dark:text-neutral-400 font-normal">
            {trend.label}
          </span>
        </p>
      )}
    </div>
  )
}

/* ---------------- KpiGrid ---------------- */

type KpiGridProps = {
  children: React.ReactNode
  className?: string
}

export function KpiGrid({ children, className }: KpiGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr",
        className
      )}
    >
      {children}
    </div>
  )
}