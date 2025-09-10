"use client"

import { useState, useCallback } from "react"

export type BannerType = "info" | "success" | "warning" | "error"

export type Banner = {
  id: string
  type: BannerType
  title?: string
  description?: string
  closable?: boolean
  actions?: {
    label: string
    onClick: () => void
    variant?: "primary" | "secondary" | "outline"
  }[]
  placement?: "top-floating" | "inline"
  duration?: number // ms (0 = permanent)
}

export const useBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([])

  // ➕ Ajouter une bannière
  const addBanner = useCallback(
    ({
      type = "info",
      title,
      description,
      closable = true,
      actions,
      placement = "inline",
      duration = 0,
    }: Omit<Banner, "id">) => {
      const id = crypto.randomUUID()
      const newBanner: Banner = {
        id,
        type,
        title,
        description,
        closable,
        actions,
        placement,
        duration,
      }

      setBanners((prev) => [...prev, newBanner])

      if (duration > 0) {
        setTimeout(() => {
          setBanners((prev) => prev.filter((b) => b.id !== id))
        }, duration)
      }

      return id
    },
    []
  )

  // ❌ Supprimer une bannière par ID
  const dismiss = useCallback((id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id))
  }, [])

  // 🔄 Tout supprimer
  const clear = useCallback(() => {
    setBanners([])
  }, [])

  return { banners, addBanner, dismiss, clear }
}
