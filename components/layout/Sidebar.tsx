"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LockSimpleIcon, StorefrontIcon } from "@phosphor-icons/react"
import { TierMark } from "@/components/access/TierTrack"
import { isPanelNavActive, panelNavGroups } from "@/lib/panel-nav"
import { canSell } from "@/lib/tier"
import { useSeller } from "@/lib/use-seller"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const pathname = usePathname()
  const selling = canSell(useSeller())

  return (
    <aside className="sticky top-5 hidden h-[calc(100svh-2.5rem)] w-64 shrink-0 flex-col rounded-2xl border bg-card p-5 shadow-sm lg:flex">
      <div className="mb-6 flex items-center gap-3 border-b pb-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <StorefrontIcon weight="bold" className="size-5" />
        </div>
        <span className="text-base font-bold tracking-tight">پنل فروشنده</span>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
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
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        active && "bg-primary/10 font-semibold text-primary"
                      )}
                    >
                      <item.icon className="size-4.5" />
                      {item.label}
                      {item.sell && !selling ? <LockSimpleIcon className="ms-auto size-3.5 opacity-60" /> : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <TierMark />
    </aside>
  )
}
