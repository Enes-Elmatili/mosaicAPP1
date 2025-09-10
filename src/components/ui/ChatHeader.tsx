"use client"

import * as React from "react"
import { ArrowLeft, MoreVertical } from "lucide-react"
import { cn } from "@/lib/cx"
import { Avatar } from "./Avatar"

type ChatHeaderProps = {
  name: string
  avatarUrl?: string
  status?: "online" | "offline" | "busy" | "away"
  onBack?: () => void
  onOptions?: () => void
  className?: string
}

export function ChatHeader({
  name,
  avatarUrl,
  status = "offline",
  onBack,
  onOptions,
  className,
}: ChatHeaderProps) {
  const statusLabels: Record<typeof status, string> = {
    online: "En ligne",
    offline: "Hors ligne",
    busy: "Occupé",
    away: "Absent",
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2 border-b",
        "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
        className
      )}
    >
      {/* Back button (mobile) */}
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Retour"
          className="md:hidden p-2 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}

      {/* User info */}
      <div className="flex items-center gap-3 flex-1">
        <Avatar src={avatarUrl} name={name} status={status} size="sm" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {name}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {statusLabels[status]}
          </span>
        </div>
      </div>

      {/* Options */}
      {onOptions && (
        <button
          onClick={onOptions}
          aria-label="Options de conversation"
          className="p-2 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
ChatHeader.displayName = "ChatHeader"