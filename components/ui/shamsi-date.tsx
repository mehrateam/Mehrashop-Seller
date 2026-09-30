"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarBlankIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"
import {
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  isoOf,
  jalaliLabel,
  monthLead,
  monthLength,
  partsOf,
  shiftMonth,
  todayIso,
  type Jalali,
} from "@/lib/jalali"

export function ShamsiDate({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const selected = partsOf(value)
  const today = partsOf(todayIso()) ?? { jy: 1405, jm: 1, jd: 1 }
  const [view, setView] = useState<Jalali>(selected ?? today)
  const lead = monthLead(view.jy, view.jm)
  const days = monthLength(view.jy, view.jm)
  const todayKey = todayIso()

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setView(selected ?? today)
          setOpen((current) => !current)
        }}
        className="flex h-10 w-full items-center gap-2 rounded-xl border bg-transparent px-3 text-start text-sm"
      >
        <CalendarBlankIcon className="size-4 text-muted-foreground" />
        <span className={value ? "" : "text-muted-foreground"}>{value ? jalaliLabel(value) : "انتخاب تاریخ"}</span>
      </button>
      {open ? (
        <div className="absolute z-20 mt-2 w-72 rounded-2xl border bg-card p-3 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" className="rounded-lg p-1 hover:bg-muted" onClick={() => setView(shiftMonth(view, 1))} aria-label="ماه بعد">
              <CaretLeftIcon className="size-4" />
            </button>
            <span className="text-sm font-semibold">
              {JALALI_MONTHS[view.jm - 1]} {view.jy}
            </span>
            <button type="button" className="rounded-lg p-1 hover:bg-muted" onClick={() => setView(shiftMonth(view, -1))} aria-label="ماه قبل">
              <CaretRightIcon className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
            {JALALI_WEEKDAYS.map((day) => (
              <span key={day} className="py-1">{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 text-center text-sm">
            {Array.from({ length: lead }, (_, index) => (
              <span key={`e-${index}`} />
            ))}
            {Array.from({ length: days }, (_, index) => {
              const day = index + 1
              const iso = isoOf({ jy: view.jy, jm: view.jm, jd: day })
              const future = iso > todayKey
              const picked = iso === value.slice(0, 10)
              return (
                <button
                  key={day}
                  type="button"
                  disabled={future}
                  onClick={() => {
                    onChange(`${iso}T12:00`)
                    setOpen(false)
                  }}
                  className={
                    picked
                      ? "mx-auto flex size-8 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground"
                      : future
                        ? "mx-auto flex size-8 items-center justify-center rounded-lg text-muted-foreground/40"
                        : "mx-auto flex size-8 items-center justify-center rounded-lg hover:bg-muted"
                  }
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
