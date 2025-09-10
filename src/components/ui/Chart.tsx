"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart as ReAreaChart,
  Area,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts"
import clsx from "clsx"

// Type générique pour les datasets
export type ChartData = Record<string, string | number>

// Variantes possibles
type ChartVariant = "line" | "area" | "bar" | "pie"

export type ChartProps = {
  variant: ChartVariant
  data: ChartData[]
  dataKey: string
  nameKey?: string
  color?: string
  colors?: string[] // ✅ palette multiple
  height?: number
  className?: string
  legend?: boolean
  tooltip?: boolean
  children?: React.ReactNode
}

/* ---------------- Custom Tooltip ---------------- */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: any[]
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white dark:bg-neutral-900 p-2 shadow">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
          {label}
        </p>
        {payload.map((p) => (
          <p
            key={p.dataKey}
            className="text-xs text-neutral-700 dark:text-neutral-300"
          >
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

/* ---------------- Chart Wrapper ---------------- */
export function Chart({
  variant,
  data,
  dataKey,
  nameKey,
  color = "#2563eb", // primary-600 par défaut
  colors,
  height = 300,
  className,
  legend = true,
  tooltip = true,
  children,
}: ChartProps) {
  // palette fallback pour pie chart
  const pieColors =
    colors ??
    ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#9333ea", "#14b8a6"]

  return (
    <div
      className={clsx("w-full", className)}
      style={{ height }}
      role="img"
      aria-label={`${variant} chart of ${dataKey}`}
    >
      <ResponsiveContainer>
        {variant === "line" && (
          <ReLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            {nameKey && <XAxis dataKey={nameKey} />}
            <YAxis />
            {tooltip && <Tooltip content={<CustomTooltip />} />}
            {legend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
            {children}
          </ReLineChart>
        )}

        {variant === "area" && (
          <ReAreaChart data={data}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            {nameKey && <XAxis dataKey={nameKey} />}
            <YAxis />
            {tooltip && <Tooltip content={<CustomTooltip />} />}
            {legend && <Legend />}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill="url(#areaFill)"
            />
            {children}
          </ReAreaChart>
        )}

        {variant === "bar" && (
          <ReBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            {nameKey && <XAxis dataKey={nameKey} />}
            <YAxis />
            {tooltip && <Tooltip content={<CustomTooltip />} />}
            {legend && <Legend />}
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            {children}
          </ReBarChart>
        )}

        {variant === "pie" && (
          <RePieChart>
            {tooltip && <Tooltip content={<CustomTooltip />} />}
            {legend && <Legend />}
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              outerRadius={100}
              label
            >
              {data.map((_, i) => (
                <Cell key={i} fill={pieColors[i % pieColors.length]} />
              ))}
            </Pie>
            {children}
          </RePieChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
Chart.displayName = "Chart"