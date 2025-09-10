"use client"

import * as React from "react"
import { ApiError, setApiErrorHandler } from "@/api/apiClient"
import { useToast } from "@/hooks/useToast"

type Props = { children: React.ReactNode }

/**
 * ApiErrorToastProvider
 * - Centralizes ApiError handling into lightweight toasts
 * - Softens expected 401/403 noise; surfaces 5xx and unknown errors
 */
export function ApiErrorToastProvider({ children }: Props) {
  const { push } = useToast()

  React.useEffect(() => {
    setApiErrorHandler((err: ApiError) => {
      // Don’t spam on auth endpoints
      const isAuth = typeof err.details === "object" && err?.details && (err as any).url?.includes?.("/api/auth")

      if (err.status === 401 || err.status === 403) {
        if (!isAuth) {
          push({ type: "warning", title: "Accès restreint", message: err.message || "Session requise" })
        }
        return
      }

      if (err.status >= 500) {
        push({ type: "error", title: "Erreur serveur", message: err.message || "Une erreur est survenue" })
        return
      }

      // Other client errors: keep minimal
      push({ type: "info", title: "Info", message: err.message || "Requête incorrecte" })
    })

    return () => setApiErrorHandler(() => {})
  }, [push])

  return <>{children}</>
}

export default ApiErrorToastProvider

