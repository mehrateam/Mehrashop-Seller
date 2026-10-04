"use client"

import { ListIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
import { NotifyBell } from "@/components/layout/NotifyBell"
import { UserProfile } from "@/components/layout/UserProfile"

export default function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-card px-3.5 py-3 shadow-sm lg:flex lg:h-[76px] lg:justify-between lg:px-7 lg:py-0">
      <button
        type="button"
        className="col-start-1 row-start-1 flex size-11 items-center justify-center rounded-xl border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="باز کردن منو"
        onClick={onOpenMenu}
      >
        <ListIcon className="size-4.5" />
      </button>

      <button
        type="button"
        className="col-span-3 row-start-2 flex w-full items-center gap-3 rounded-xl border bg-muted/60 px-4 py-2.5 text-start text-sm text-muted-foreground transition-colors hover:bg-background lg:col-auto lg:row-auto lg:max-w-80"
      >
        <MagnifyingGlassIcon className="size-4 shrink-0" />
        <span className="flex-1">جستجو...</span>
        <kbd className="hidden rounded-md border bg-card px-1.5 py-0.5 text-[11px] font-semibold sm:inline">
          ⌘ K
        </kbd>
      </button>

      <div className="col-start-3 row-start-1 flex items-center gap-3 lg:col-auto lg:row-auto lg:ms-4">
        <NotifyBell />
        <UserProfile />
      </div>
    </header>
  )
}
