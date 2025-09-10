"use client"

import * as React from "react"
import { cn } from "@/lib/cx"
import { Avatar } from "./Avatar"

export type Conversation = {
  id: string
  name: string
  avatarUrl?: string
  status?: "online" | "offline" | "busy" | "away"
  lastMessage?: string
  lastTime?: string
  unreadCount?: number
}

type ChatSidebarProps = {
  conversations: Conversation[]
  activeId?: string
  onSelect: (id: string) => void
  className?: string
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  className,
}: ChatSidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col w-72 border-r bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800",
        className
      )}
    >
      <header className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        Conversations
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
        {conversations.map((conv) => {
          const isActive = conv.id === activeId
          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition",
                isActive
                  ? "bg-primary/10 dark:bg-primary/20"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              <Avatar
                src={conv.avatarUrl}
                name={conv.name}
                status={conv.status}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {conv.name}
                </p>
                {conv.lastMessage && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {conv.lastMessage}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end">
                {conv.lastTime && (
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {conv.lastTime}
                  </span>
                )}
                {conv.unreadCount ? (
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[11px]">
                    {conv.unreadCount}
                  </span>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
ChatSidebar.displayName = "ChatSidebar"