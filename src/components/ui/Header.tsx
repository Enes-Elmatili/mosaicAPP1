"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Bell } from "lucide-react"
import { cn } from "@/lib/cx"
import { NotificationsPanel } from "./NotificationsPanel"
import { UserMenu } from "./UserMenu"

type NavLink = { label: string; href: string }

type HeaderProps = {
  brand?: string
  links?: NavLink[]
  userName: string
  userAvatar?: string
  onNavigate?: (to: string) => void
  onLogout?: () => void
  className?: string
}

export function Header({
  brand = "FIXED",
  links = [],
  userName,
  userAvatar,
  onNavigate,
  onLogout,
  className,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [notifOpen, setNotifOpen] = React.useState(false)

  return (
    <header
      role="navigation"
      className={cn(
        "w-full border-b bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
        {/* Brand */}
        <div
          className="flex items-center gap-2 font-bold text-lg text-primary cursor-pointer"
          onClick={() => onNavigate?.("/")}
        >
          {brand}
        </div>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-neutral-700 dark:text-neutral-200 hover:text-primary transition"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            onClick={() => setNotifOpen(true)}
            aria-label="Notifications"
            className="relative p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white dark:border-neutral-900"></span>
          </button>

          {/* User menu */}
          <UserMenu
            userName={userName}
            userAvatar={userAvatar}
            onNavigate={onNavigate}
            onLogout={onLogout}
          />

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Menu mobile"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-neutral-900 shadow-lg z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
              <span className="font-bold text-lg">{brand}</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Fermer le menu">
                <X className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="block text-sm text-neutral-700 dark:text-neutral-200 hover:text-primary transition"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              ))}
            </nav>
            {onLogout && (
              <button
                onClick={onLogout}
                className="m-4 px-3 py-2 rounded-md bg-red-500 text-white text-sm hover:bg-red-600 transition"
              >
                Déconnexion
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Panel */}
      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={[
          {
            id: "1",
            type: "info",
            title: "Nouvelle mission",
            description: "Un client a créé une nouvelle demande",
            time: "Il y a 2 min",
            read: false,
          },
        ]}
        onMarkAllRead={() => console.log("Tout lu")}
        onClearAll={() => console.log("Notifications effacées")}
      />
    </header>
  )
}
Header.displayName = "Header"