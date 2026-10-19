"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { LockSimpleIcon } from "@phosphor-icons/react"
import { buttonVariants } from "@/components/ui/button"
import { canSell } from "@/lib/tier"
import { useSeller } from "@/lib/use-seller"
import { cn } from "@/lib/utils"

export function SellLock({ children }: { children: ReactNode }) {
  const user = useSeller()
  if (!user) return null
  if (canSell(user)) return children

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
      <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <LockSimpleIcon className="size-7" weight="duotone" />
      </span>
      <div className="max-w-md">
        <h1 className="text-lg font-bold">این بخش قفل است</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          تا کامل شدن مدارک، محصولات و سفارش‌ها بسته است.
        </p>
      </div>
      <Link href="/access" className={cn(buttonVariants(), "h-11 rounded-xl px-5")}>
        تکمیل مدارک
      </Link>
    </div>
  )
}
