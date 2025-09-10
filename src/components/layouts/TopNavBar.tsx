import { Bell, Menu } from "lucide-react"
import { useState } from "react"
import { NotificationsPanel } from "@/components/ui/NotificationsPanel"
import { useNotificationsContext } from "@/context/notificationsContext"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/cx"
import type { TabBarLink } from "@/components/layouts/TabBarNav"
import { Sheet } from "@/components/ui/Sheet"

export function TopBarNav({ title, email, onLogout, links = [] }: { title?: string; email?: string; onLogout?: () => void; links?: TabBarLink[] }) {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { notifications } = useNotificationsContext()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <header className="hidden md:flex items-center justify-between border-b bg-white dark:bg-neutral-900 px-6 h-16 shadow-sm relative">
      <div className="flex items-center gap-4">
        <button onClick={() => { setMenuOpen(true); }} className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="Ouvrir le menu">
          <Menu className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
        </button>
        <NavLink to="/app/dashboard" className="font-semibold text-gray-800 dark:text-neutral-100 tracking-tight">
          FIXED
        </NavLink>
      </div>
      <div className="flex items-center gap-4">
        {/* Bouton Notifications */}
        <button onClick={() => setOpen(true)} className="relative">
          <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
              {unread}
            </span>
          )}
        </button>

        {email && <span className="hidden lg:block text-sm text-gray-600 dark:text-neutral-300">{email}</span>}
        {onLogout && (
          <button
            onClick={onLogout}
            className="rounded-md bg-gray-100 dark:bg-neutral-800 px-3 py-1.5 text-sm text-gray-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-neutral-700"
          >
            Déconnexion
          </button>
        )}

        <NotificationsPanel open={open} onClose={() => setOpen(false)} notifications={[]} />
      </div>

      {/* Mobile sheet for menu (triggered on desktop via button; ensures visible background) */}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Navigation" size="50">
        <div className="flex flex-col gap-3">
          {links.map((l) => (
            <NavLink
              key={l.path}
              to={l.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block rounded-md px-3 py-2 text-sm shadow-sm bg-white dark:bg-neutral-900",
                  isActive ? "text-primary" : "text-neutral-700 dark:text-neutral-200"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </Sheet>
    </header>
  )
}
