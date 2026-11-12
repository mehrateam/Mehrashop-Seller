"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LockSimpleIcon } from "@phosphor-icons/react"
import { buttonVariants } from "@/components/ui/button"
import { isFreePath } from "@/lib/panel-nav"
import { canSell } from "@/lib/tier"
import { useSeller } from "@/lib/use-seller"
import { cn } from "@/lib/utils"

export function SellLock({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const user = useSeller()
  if (!user) return null
  if (canSell(user) || isFreePath(pathname)) return children

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
      <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <LockSimpleIcon className="size-7" weight="duotone" />
      </span>
      <div className="max-w-md">
        <h1 className="text-lg font-bold">در انتظار تایید مدیر</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          ثبت‌نام شما دریافت شد. تا تایید مدیر، فقط پشتیبانی و تنظیمات باز است.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/support" className={cn(buttonVariants(), "h-11 rounded-xl px-5")}>
          پشتیبانی
        </Link>
        <Link href="/store/edit" className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-xl px-5")}>
          تنظیمات
        </Link>
      </div>
    </div>
  )
}
