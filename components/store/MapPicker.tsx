"use client"

import { useEffect, useRef, useState } from "react"
import { MinusIcon, PlusIcon } from "@phosphor-icons/react"
import { mapPoint, pointToLatLng } from "@/lib/store"

const tehran = { lat: 35.6892, lng: 51.389 }

export function MapPicker({
  lat,
  lng,
  onPick,
}: {
  lat: number
  lng: number
  onPick: (lat: number, lng: number) => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; lat: number; lng: number } | null>(null)
  const moved = useRef(false)
  const [zoom, setZoom] = useState(lat || lng ? 15 : 11)
  const [center, setCenter] = useState(lat || lng ? { lat, lng } : tehran)
  const [size, setSize] = useState({ w: 640, h: 288 })

  useEffect(() => {
    if (lat || lng) setCenter({ lat, lng })
  }, [lat, lng])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      setZoom((value) => Math.min(18, Math.max(5, value + (event.deltaY < 0 ? 1 : -1))))
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      observer.disconnect()
      el.removeEventListener("wheel", onWheel)
    }
  }, [])

  const origin = mapPoint(center.lat, center.lng, zoom)
  const left = origin.x - size.w / 2
  const top = origin.y - size.h / 2
  const count = 2 ** zoom
  const tiles = []
  const x0 = Math.floor(left / 256)
  const x1 = Math.floor((left + size.w) / 256)
  const y0 = Math.max(0, Math.floor(top / 256))
  const y1 = Math.min(count - 1, Math.floor((top + size.h) / 256))
  for (let x = x0; x <= x1; x += 1) {
    for (let y = y0; y <= y1; y += 1) {
      tiles.push({
        key: `${zoom}-${x}-${y}`,
        src: `https://tile.openstreetmap.org/${zoom}/${((x % count) + count) % count}/${y}.png`,
        left: x * 256 - left,
        top: y * 256 - top,
      })
    }
  }
  const pin = lat || lng ? mapPoint(lat, lng, zoom) : null

  return (
    <div className="relative overflow-hidden rounded-xl border bg-muted">
      <div
        ref={box}
        className="relative h-56 cursor-crosshair touch-none"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) return
          moved.current = false
          drag.current = { x: event.clientX, y: event.clientY, lat: center.lat, lng: center.lng }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          const start = drag.current
          if (!start) return
          const dx = event.clientX - start.x
          const dy = event.clientY - start.y
          if (Math.hypot(dx, dy) > 4) moved.current = true
          const from = mapPoint(start.lat, start.lng, zoom)
          setCenter(pointToLatLng(from.x - dx, from.y - dy, zoom))
        }}
        onPointerUp={(event) => {
          drag.current = null
          if (moved.current || !box.current) return
          const rect = box.current.getBoundingClientRect()
          const next = pointToLatLng(left + event.clientX - rect.left, top + event.clientY - rect.top, zoom)
          onPick(Number(next.lat.toFixed(6)), Number(next.lng.toFixed(6)))
        }}
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            alt=""
            draggable={false}
            src={tile.src}
            className="pointer-events-none absolute size-64 max-w-none"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
        {pin ? (
          <span
            className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-primary shadow-md"
            style={{ left: size.w / 2 + pin.x - origin.x, top: size.h / 2 + pin.y - origin.y }}
          />
        ) : (
          <span className="pointer-events-none absolute inset-x-0 top-3 text-center">
            <span className="rounded-full bg-card/95 px-3 py-1 text-xs font-medium shadow-sm">روی نقشه کلیک کنید</span>
          </span>
        )}
        <span className="pointer-events-none absolute bottom-1.5 end-2 rounded bg-card/80 px-1.5 text-[10px] text-muted-foreground">
          © OSM
        </span>
      </div>
      <div className="absolute top-3 start-3 flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
        <button type="button" aria-label="بزرگ‌نمایی" className="grid size-8 place-items-center hover:bg-muted" onClick={() => setZoom((value) => Math.min(18, value + 1))}>
          <PlusIcon className="size-4" />
        </button>
        <button type="button" aria-label="کوچک‌نمایی" className="grid size-8 place-items-center border-t hover:bg-muted" onClick={() => setZoom((value) => Math.max(5, value - 1))}>
          <MinusIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}
