"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { BellIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  fetchNotifSummary,
  readNotifications,
  type NotifSummary,
} from "@/lib/support"

type GroupId = keyof Omit<NotifSummary, "total">

const GROUPS: { id: GroupId; label: string; hint: string; href: string }[] = [
  { id: "answered", label: "پاسخ پشتیبانی", hint: "اعلان خوانده‌نشده", href: "/support?tab=answered" },
  { id: "open", label: "تیکت‌های باز", hint: "اعلان خوانده‌نشده", href: "/support?tab=open" },
  { id: "in_review", label: "در حال بررسی", hint: "اعلان خوانده‌نشده", href: "/support?tab=in_review" },
]

export function NotifyBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [counts, setCounts] = useState<NotifSummary>({
    answered: 0,
    open: 0,
    in_review: 0,
    total: 0,
  })

  const groups = GROUPS.map((g) => ({ ...g, count: counts[g.id] })).filter((g) => g.count > 0)
  const badge = counts.total

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const data = await fetchNotifSummary()
        if (alive) setCounts(data)
      } catch {
        /* silent */
      }
    }
    load()
    const timer = setInterval(load, 30_000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    addEventListener("keydown", onKey)
    fetchNotifSummary()
      .then(setCounts)
      .catch(() => {})
    return () => {
      removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <div className="nb">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="relative size-11 rounded-xl"
        aria-label="اعلان‌ها"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon className="size-4.5" />
        {badge > 0 ? <span className="notification-indicator" /> : null}
      </Button>

      {open
        ? createPortal(
            <div className="nb-layer" onClick={() => setOpen(false)}>
              <div
                className="nb-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="nb-title"
                onClick={(e) => e.stopPropagation()}
              >
                <header className="nb-head">
                  <div>
                    <h2 id="nb-title">اعلان‌ها</h2>
                    <p className="nb-sub">
                      {badge > 0
                        ? `${badge} مورد جدید در ${groups.length} دسته`
                        : "فعلاً مورد جدیدی نیست"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="nb-x"
                    aria-label="بستن"
                    onClick={() => setOpen(false)}
                  >
                    ×
                  </button>
                </header>

                {groups.length > 0 ? (
                  <div className="nb-grid">
                    {groups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        className="nb-card clickable"
                        onClick={() => {
                          setOpen(false)
                          readNotifications().catch(() => {})
                          setCounts({ answered: 0, open: 0, in_review: 0, total: 0 })
                          router.push(g.href)
                        }}
                      >
                        <span className="nb-num">{g.count}</span>
                        <span className="nb-label">{g.label}</span>
                        <span className="nb-hint">{g.hint}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="nb-empty">
                    <span className="nb-empty-icon" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.73 21a2 2 0 0 1-3.46 0"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.5 11.5l1.8 1.8 3.7-3.8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <strong>همه‌چیز مرتبه!</strong>
                    <p>اعلان جدیدی برای رسیدگی نیست</p>
                  </div>
                )}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
