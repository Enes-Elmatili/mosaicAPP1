// src/components/layouts/PublicLayout.tsx
"use client"

import { ReactNode } from "react"
import { Outlet } from "react-router-dom"
import { PublicHeader } from "@/components/layouts/PublicHeader"

type Props = { children?: ReactNode }

/**
 * PublicLayout 2026
 * - Pas de sidebar (zéro offset)
 * - Header + Footer partagés sur toutes les pages publiques
 * - Accessibilité renforcée (skip link, landmarks ARIA, focus visible)
 * - Responsive container (max-w + px variables)
 * - Dark mode ready
 */
export function PublicLayout({ children }: Props) {
  return (
    <div
      data-layout="public"
      className="min-h-dvh flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50"
    >
      {/* Skip link (a11y) */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 px-3 py-2 rounded-md bg-primary text-white"
      >
        Aller au contenu principal
      </a>

      {/* Header global (branding + nav) */}
      <PublicHeader />

      {/* Main content */}
      <main
        id="main"
        role="main"
        className="flex-1"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children ?? <Outlet />}
        </div>
      </main>

      {/* Footer global */}
      <footer
        role="contentinfo"
        className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3 text-sm">
          {/* Branding */}
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Fixed</h3>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              La plateforme qui connecte clients et prestataires en toute sécurité.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-2" aria-label="Navigation secondaire">
            <a href="/features" className="hover:text-primary">Fonctionnalités</a>
            <a href="/faq" className="hover:text-primary">FAQ</a>
            <a href="/login" className="hover:text-primary">Connexion</a>
            <a href="/signup" className="hover:text-primary">Créer un compte</a>
          </nav>

          {/* Mentions légales / réseaux sociaux */}
          <div className="flex flex-col space-y-2">
            <a href="/legal" className="hover:text-primary">Mentions légales</a>
            <a href="/privacy" className="hover:text-primary">Politique de confidentialité</a>
            <div className="flex gap-4 mt-2">
              <a href="https://twitter.com" aria-label="Twitter" className="hover:text-primary">X</a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-primary">LinkedIn</a>
              <a href="https://instagram.com" aria-label="Instagram" className="hover:text-primary">Instagram</a>
            </div>
          </div>
        </div>

        {/* Bas de footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>© {new Date().getFullYear()} Fixed — Tous droits réservés</span>
            <span>Made with ❤️ by Fixed Team</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
