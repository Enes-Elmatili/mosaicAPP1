"use client"

import * as React from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { ToastList } from "@/components/ui/ToastList"
import { useToast } from "@/hooks/useToast"
import { ErrorBoundary } from "@/components/layouts/ErrorBoundary"
import { TopBarNav } from "@/components/layouts/TopNavBar"
import { TabBarNav, TabBarLink } from "@/components/layouts/TabBarNav"
import { NotificationsProvider } from "@/context/notificationsContext" // ✅
import { SocketProvider } from "@/context/SocketContext"
import { ApiErrorToastProvider } from "@/context/ApiErrorToastProvider"
 

export type NavLinkItem = TabBarLink & {
  roles?: string[]
}

interface AppShellProps {
  children?: React.ReactNode
  navLinks: NavLinkItem[]
  variant?: "responsive" | "minimal"
}

export function AppShell({ children, navLinks, variant = "responsive" }: AppShellProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { toasts, dismiss } = useToast()
 

  // Filtrer les liens selon le rôle
  const filteredLinks = navLinks.filter(
    (l) => !user?.roles || !l.roles || l.roles.some((r) => user.roles.includes(r))
  )

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  return (
    <ErrorBoundary>
      {/* ✅ Notifications accessibles partout */}
      <ApiErrorToastProvider>
      <NotificationsProvider>
      <SocketProvider>
        <div className="flex h-screen flex-col bg-gray-50 dark:bg-neutral-950">
          {/* --- Topbar (desktop / tablette) --- */}
          {variant === "responsive" && (
            <TopBarNav
              title={`Espace ${user?.roles?.[0] ?? "Utilisateur"}`}
              email={user?.email}
              onLogout={handleLogout}
              links={filteredLinks}
            />
          )}

          {/* --- Contenu principal --- */}
          <main className="flex-1 overflow-y-auto p-6">
            {children ?? <Outlet />}
          </main>

          {/* --- TabBar (mobile uniquement) --- */}
          {variant === "responsive" && <TabBarNav links={filteredLinks} />}

          {/* --- Toasts global --- */}
          <ToastList toasts={toasts} onDismiss={dismiss} />
        </div>
      </SocketProvider>
      </NotificationsProvider>
      </ApiErrorToastProvider>
    </ErrorBoundary>
  )
}
AppShell.displayName = "AppShell"
