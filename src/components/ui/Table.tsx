"use client"

import * as React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/cx"
import { Skeleton } from "./Skeleton"

type Column<T> = {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

type TableProps<T> = {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  onSort?: (key: keyof T, dir: "asc" | "desc") => void
  sortBy?: { key: keyof T; dir: "asc" | "desc" }
  className?: string
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  page = 1,
  pageSize = 10,
  total,
  onPageChange,
  onSort,
  sortBy,
  className,
}: TableProps<T>) {
  const totalPages = total && pageSize ? Math.ceil(total / pageSize) : 1

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table role="table" className="min-w-full border-collapse">
        <thead>
          <tr className="bg-neutral-100 dark:bg-neutral-800 text-sm text-left">
            {columns.map((col) => {
              const isSorted = sortBy?.key === col.key
              return (
                <th
                  key={String(col.key)}
                  scope="col"
                  className="px-4 py-2 font-medium text-neutral-700 dark:text-neutral-200"
                >
                  {col.sortable ? (
                    <button
                      onClick={() =>
                        onSort?.(
                          col.key,
                          isSorted && sortBy?.dir === "asc" ? "desc" : "asc"
                        )
                      }
                      aria-sort={
                        isSorted ? (sortBy?.dir === "asc" ? "ascending" : "descending") : "none"
                      }
                      className="flex items-center gap-1"
                    >
                      {col.label}
                      {isSorted ? (
                        sortBy?.dir === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ChevronUp className="h-4 w-4 opacity-20" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(pageSize)].map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <Skeleton variant="text" width="100%" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length > 0 ? (
            data.map((row) => (
              <tr
                key={row.id}
                className="border-t border-neutral-200 dark:border-neutral-700 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-neutral-800 dark:text-neutral-200">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] as any)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400"
              >
                Aucune donnée disponible
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex justify-end items-center gap-2 mt-4 text-sm">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={cn(
              "px-3 py-1 rounded border transition",
              "border-neutral-300 dark:border-neutral-700",
              page === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            Précédent
          </button>
          <span>
            Page {page} sur {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className={cn(
              "px-3 py-1 rounded border transition",
              "border-neutral-300 dark:border-neutral-700",
              page === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  )
}
Table.displayName = "Table"