"use client"

import { useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

const sizes = {
  sm: "max-w-[360px]",
  md: "max-w-[560px]",
  lg: "max-w-[760px]",
  xl: "max-w-[960px]",
} as const

export type ModalSize = keyof typeof sizes

export function Modal({
  open,
  onClose,
  size = "md",
  closeOnBackdrop = true,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  size?: ModalSize
  closeOnBackdrop?: boolean
  children: ReactNode
  className?: string
}) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    addEventListener("keydown", onKey)
    return () => {
      removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open || typeof document === "undefined") return null

  return createPortal(
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-[#171a14]/[0.42] p-5 backdrop-blur-[4px]"
      role="presentation"
      onClick={() => {
        if (closeOnBackdrop) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full animate-[welcome-pop_220ms_cubic-bezier(0.16,1,0.3,1)] rounded-2xl border border-border bg-card p-6 shadow-[0_16px_50px_rgba(20,30,10,0.08)]",
          sizes[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="بستن"
          onClick={onClose}
          className="absolute top-2.5 start-3 flex size-8 items-center justify-center rounded-[10px] border border-border bg-card text-xl leading-none text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          ×
        </button>
        <div className="mt-1">{children}</div>
      </div>
    </div>,
    document.body
  )
}
