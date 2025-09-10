"use client"

import * as React from "react"

declare global {
  interface Window { mapboxgl?: any }
}

type MapboxMapProps = { center?: [number, number]; zoom?: number; className?: string }

const DEFAULT_TOKEN = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_MAPBOX_TOKEN ||
  "pk.eyJ1IjoiZW5lc2VsbWF0aWxpIiwiYSI6ImNtZmN0MWpnMzAyYzEyb3FuZHgyYjB0c3cifQ.y3WJ37nHLyYhAXr1pReOlw"

export default function MapboxMap({ center = [-7.5898, 33.5731], zoom = 12, className }: MapboxMapProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const mapRef = React.useRef<any | null>(null)
  const centerRef = React.useRef<[number, number]>(center)
  const [ready, setReady] = React.useState(false)
  const [isDark, setIsDark] = React.useState<boolean>(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') || window.matchMedia?.('(prefers-color-scheme: dark)').matches : false
  )

  // 1) Load scripts/styles once
  React.useEffect(() => {
    if (window.mapboxgl) { setReady(true); return }
    const cssHref = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
    if (!document.querySelector(`link[href='${cssHref}']`)) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = cssHref
      document.head.appendChild(link)
    }
    const script = document.createElement("script")
    script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"
    script.async = true
    script.onload = () => setReady(true)
    script.onerror = () => setReady(false)
    document.head.appendChild(script)
    return () => { /* script stays; no-op */ }
  }, [])

  // Listen to dark mode changes (class or media)
  React.useEffect(() => {
    const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
    const onMedia = (e: MediaQueryListEvent) => setIsDark(e.matches)
    if (mql) {
      try { mql.addEventListener('change', onMedia) } catch { mql.addListener(onMedia) }
    }
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      if (mql) {
        try { mql.removeEventListener('change', onMedia) } catch { mql.removeListener(onMedia) }
      }
      observer.disconnect()
    }
  }, [])

  // 2) Create map when ready
  React.useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return
    const mapboxgl = window.mapboxgl
    if (!mapboxgl || typeof mapboxgl.Map !== "function") return

    mapboxgl.accessToken = DEFAULT_TOKEN
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: isDark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v12",
      center,
      zoom,
      attributionControl: true,
    })
    mapRef.current = map

    const size = 100
    const pulsingDot = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),
      context: null as CanvasRenderingContext2D | null,
      onAdd(this: any) {
        const canvas = document.createElement("canvas")
        canvas.width = this.width
        canvas.height = this.height
        this.context = canvas.getContext("2d", { willReadFrequently: true } as any)
      },
      render(this: any) {
        const duration = 1200
        const t = (performance.now() % duration) / duration
        const radius = (size / 2) * 0.2
        const outerRadius = (size / 2) * 0.2 + (size / 2) * 0.3 * t
        const ctx = this.context as CanvasRenderingContext2D
        ctx.clearRect(0, 0, this.width, this.height)
        ctx.beginPath(); ctx.arc(size / 2, size / 2, outerRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(34,197,94,${1 - t})`; ctx.fill()
        ctx.beginPath(); ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2)
        ctx.fillStyle = "#22c55e"; ctx.strokeStyle = "white"; ctx.lineWidth = 2 + 2 * (1 - t)
        ctx.fill(); ctx.stroke()
        this.data = ctx.getImageData(0, 0, this.width, this.height).data
        map.triggerRepaint(); return true
      },
    } as unknown as ImageData & { onAdd: () => void; render: () => boolean }

    function addLayers() {
      if (!map.hasImage("pulsing-dot")) map.addImage("pulsing-dot", pulsingDot as any, { pixelRatio: 2 })
      if (!map.getSource("provider-point")) {
        map.addSource("provider-point", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [ { type: "Feature", geometry: { type: "Point", coordinates: centerRef.current }, properties: {} } ] },
        })
      }
      if (!map.getLayer("provider-point-layer")) {
        map.addLayer({ id: "provider-point-layer", type: "symbol", source: "provider-point", layout: { "icon-image": "pulsing-dot" } })
      }
    }

    const onLoad = () => addLayers()
    map.on("load", onLoad)
    return () => { try { map.off("load", onLoad); map.remove() } catch {} mapRef.current = null }
  }, [ready, center, zoom, isDark])

  // 3) Update center
  React.useEffect(() => {
    centerRef.current = center
    const map = mapRef.current
    if (!map) return
    try {
      map.easeTo({ center, duration: 600 })
      const src = map.getSource("provider-point") as any
      if (src) src.setData({ type: "FeatureCollection", features: [ { type: "Feature", geometry: { type: "Point", coordinates: center }, properties: {} } ] })
    } catch {}
  }, [center])

  return (
    <div className={"relative h-72 w-full rounded-2xl overflow-hidden " + (className || "") }>
      <div ref={containerRef} className="absolute inset-0" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 text-neutral-500 text-sm">
          Carte indisponible
        </div>
      )}
    </div>
  )
}
