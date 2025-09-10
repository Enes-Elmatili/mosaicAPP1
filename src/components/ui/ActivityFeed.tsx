"use client"

import * as React from "react"
import { cn } from "@/lib/cx"
import {
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Briefcase,
} from "lucide-react"

export type ActivityType = "info" | "success" | "warning" | "error"

export type Activity = {
  id: string
  type: ActivityType
  title: string
  description?: string
  time: string
  user?: {
    name: string
    avatarUrl?: string
  }
}

type ActivityFeedProps = {
  activities: Activity[]
  className?: string
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  const typeIcons: Record<ActivityType, React.ReactNode> = {
    info: <FileText className="h-4 w-4 text-blue-500" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    warning: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
  }

  return (
    <div className={cn("space-y-6", className)}>
      {activities.length > 0 ? (
        <ul className="relative border-l border-neutral-200 dark:border-neutral-700 pl-4">
          {activities.map((a) => (
            <li key={a.id} className="mb-6 ml-2 relative">
              {/* Point timeline */}
              <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-neutral-900 ring-2 ring-primary">
                {typeIcons[a.type]}
              </span>

              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {a.title}
                </p>
                {a.description && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {a.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  {a.user?.avatarUrl ? (
                    <img
                      src={a.user.avatarUrl}
                      alt={a.user.name}
                      className="h-5 w-5 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-neutral-400" />
                  )}
                  <span>{a.user?.name ?? "Système"}</span>
                  <span>·</span>
                  <span>{a.time}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-neutral-500 dark:text-neutral-400 text-sm">
          <Clock className="h-6 w-6 mb-2 opacity-50" />
          Aucune activité récente
        </div>
      )}
    </div>
  )
}
ActivityFeed.displayName = "ActivityFeed"