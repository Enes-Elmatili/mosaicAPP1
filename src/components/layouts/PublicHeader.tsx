// src/components/layouts/PublicHeader.tsx
"use client"

import * as React from "react"
import { Link, NavLink } from "react-router-dom"
import { Button } from "@/components/ui"
import { Menu, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const navItems = [
    { label: "Comment ça marche", href: "#how" },
    { label: "Fonctionnalités", href: "#why" },
    { label: "Commencer", href: "#cta" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur dark:bg-neutral-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100"
        >
          Fixed
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex gap-8 text-sm font-medium text-neutral-700 dark:text-neutral-300"
          aria-label="Navigation principale"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions (desktop) */}
        <div className="hidden md:flex gap-3">
          <NavLink
            to="/login"
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-1.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Se connecter
          </NavLink>
          <NavLink
            to="/signup"
            className="rounded-md bg-black text-white px-4 py-1.5 text-sm font-semibold shadow-sm hover:bg-neutral-800"
          >
            S’inscrire
          </NavLink>
        </div>

        {/* Burger (mobile only) */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 md:hidden bg-white dark:bg-neutral-950 shadow-lg"
          >
            <div className="flex justify-between items-center h-16 px-4 border-b">
              <Link
                to="/"
                className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100"
                onClick={() => setMobileOpen(false)}
              >
                Fixed
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Fermer le menu"
              >
                <X size={22} />
              </button>
            </div>

            <nav
              className="flex flex-col px-6 py-8 gap-6 text-lg text-neutral-800 dark:text-neutral-200"
              aria-label="Navigation mobile"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ))}

              <div className="flex flex-col gap-4 mt-8">
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Se connecter
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md bg-black text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-neutral-800"
                >
                  S’inscrire
                </NavLink>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
