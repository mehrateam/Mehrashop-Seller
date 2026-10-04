"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { StorefrontIcon, XIcon } from "@phosphor-icons/react"
import { isPanelNavActive, panelNavGroups } from "@/lib/panel-nav"
import { cn } from "@/lib/utils"

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)")
    const onChange = () => {
      if (desktop.matches) onClose()
    }
    desktop.addEventListener("change", onChange)
    return () => desktop.removeEventListener("change", onChange)
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <nav
      className={cn(
        "fixed inset-0 z-[140] lg:hidden",
        open ? "visible" : "invisible pointer-events-none"
      )}
      aria-label="منوی ناوبری"
      aria-hidden={!open}
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-[rgba(23,26,20,0.42)] backdrop-blur-[4px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
        aria-label="بستن منو"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute inset-y-0 start-0 flex w-[min(100%,320px)] flex-col border-e bg-card px-4 py-5 shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal={open}
        aria-label="منوی پنل فروشنده"
      >
        <div className="mb-2 flex items-center justify-between gap-3 border-b pb-4.5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <StorefrontIcon weight="bold" className="size-5" />
            </div>
            <span className="text-base font-bold tracking-tight">پنل فروشنده</span>
          </div>
          <button
            type="button"
            className="grid size-9 shrink-0 place-items-center rounded-[10px] border bg-card text-xl leading-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="بستن منو"
            tabIndex={open ? 0 : -1}
            onClick={onClose}
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto py-1">
          {panelNavGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isPanelNavActive(pathname, item.href)
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        tabIndex={open ? 0 : -1}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                          active && "bg-primary/10 font-semibold text-primary"
                        )}
                      >
                        <item.icon className="size-4.5" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-auto border-t pt-4">
          <div className="flex items-center gap-2.5 rounded-lg bg-muted px-3 py-3 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-primary shadow-[0_0_0_3px] shadow-primary/20" />
            سیستم فعال است
          </div>
        </div>
      </aside>
    </nav>,
    document.body
  )
}
