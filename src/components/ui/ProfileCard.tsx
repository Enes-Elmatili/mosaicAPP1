"use client"

import * as React from "react"
import { cn } from "@/lib/cx"
import { Camera } from "lucide-react"
import { Avatar } from "@/components/ui/Avatar"

type ProfileCardProps = {
  name: string
  email: string
  avatarUrl?: string
  onEdit?: () => void
  className?: string
}

export function ProfileCard({
  name,
  email,
  avatarUrl,
  onEdit,
  className,
}: ProfileCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm",
        className
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar src={avatarUrl} alt={name} size="lg" fallback={initials} />
        {onEdit && (
          <button
            onClick={onEdit}
            className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 shadow-md hover:scale-105 transition"
            aria-label="Changer la photo de profil"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Infos */}
      <div className="flex-1">
        <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {name}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{email}</p>
      </div>
    </div>
  )
}
ProfileCard.displayName = "ProfileCard"