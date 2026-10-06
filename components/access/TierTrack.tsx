"use client"

import Link from "next/link"
import { TIERS, tierAt } from "@/lib/tier"
import { useSeller } from "@/lib/use-seller"
import { cn } from "@/lib/utils"

export function TierTrack({ current }: { current?: string | null }) {
  const at = TIERS.findIndex((item) => item.id === tierAt(current))

  return (
    <ol className="grid grid-cols-3 gap-2">
      {TIERS.map((tier, index) => {
        const state = index < at ? "done" : index === at ? "now" : "wait"
        return (
          <li
            key={tier.id}
            className={cn(
              "rounded-2xl px-1.5 py-3 text-center",
              state === "now" && "bg-primary text-white shadow-sm",
              state === "done" && "bg-primary/10 text-[#3d5a00]",
              state === "wait" && "bg-[#f3f5ef] text-[#8b917f]"
            )}
          >
            <span className={cn("mx-auto mb-2 block size-2 rounded-full", tier.dot, state === "now" && "bg-white")} />
            <p className="text-sm font-bold">{tier.label}</p>
            <p className={cn("mt-0.5 text-[11px] leading-4", state === "now" ? "text-white/80" : "opacity-80")}>
              {tier.hint}
            </p>
          </li>
        )
      })}
    </ol>
  )
}

export function TierMark() {
  const user = useSeller()
  const tier = TIERS.find((item) => item.id === tierAt(user?.tier)) ?? TIERS[0]

  return (
    <Link href="/access" className="mt-auto flex items-center gap-2.5 rounded-lg bg-muted px-3 py-3 text-xs transition-colors hover:bg-primary/10">
      <span className={cn("size-2.5 rounded-full", tier.dot)} />
      <span className="font-semibold text-foreground">سطح {tier.label}</span>
    </Link>
  )
}
