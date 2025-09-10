"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, PlusCircle, MessageSquare, User, LogOut } from "lucide-react"
import { cn } from "@/lib/cx"
import { Avatar } from "./Avatar"

type MenuItem = {
  label: string
  icon: React.ReactNode
  action: () => void
}

type UserMenuProps = {
  userName: string
  userAvatar?: string
  onNavigate?: (to: string) => void
  onLogout?: () => void
  className?: string
}

export function UserMenu({
  userName,
  userAvatar,
  onNavigate,
  onLogout,
  className,
}: UserMenuProps) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const menuItems: MenuItem[] = [
    {
      label: "Accueil",
      icon: <Home className="h-4 w-4" />,
      action: () => onNavigate?.("/"),
    },
    {
      label: "Créer une demande",
      icon: <PlusCircle className="h-4 w-4" />,
      action: () => onNavigate?.("/requests/new"),
    },
    {
      label: "Messages",
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => onNavigate?.("/messages"),
    },
    {
      label: "Profil",
      icon: <User className="h-4 w-4" />,
      action: () => onNavigate?.("/profile"),
    },
  ]

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <Avatar src={userAvatar} name={userName} size="sm" status="online" />
        <span className="hidden sm:inline text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {userName}
        </span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg z-50 overflow-hidden"
          >
            {menuItems.map((item) => (
              <button
                key={item.label}
                role="menuitem"
                onClick={() => {
                  item.action()
                  setOpen(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            {onLogout && (
              <button
                role="menuitem"
                onClick={() => {
                  onLogout()
                  setOpen(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 transition"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
UserMenu.displayName = "UserMenu"