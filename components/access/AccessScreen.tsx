"use client"

import { useEffect } from "react"
import Link from "next/link"
import { PackageIcon, StarIcon } from "@phosphor-icons/react"
import { ProfileComplete } from "@/components/access/ProfileComplete"
import { TierTrack } from "@/components/access/TierTrack"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ensureSession } from "@/lib/auth"
import { tierAt } from "@/lib/tier"
import { useSeller } from "@/lib/use-seller"
import { cn } from "@/lib/utils"

export function AccessScreen() {
  const user = useSeller()
  const tier = tierAt(user?.tier)
  const count = user?.product_count ?? 0

  useEffect(() => {
    ensureSession().catch(() => {})
  }, [])

  if (!user) return null

  const next =
    tier === "bronze"
      ? "با گذاشتن اولین محصول سطح نقره می‌شوید."
      : tier === "silver"
        ? `تا طلا ${(10 - count).toLocaleString("fa-IR")} محصول دیگر.`
        : "سطح طلایی فعال است."

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">سطح حساب</h1>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          برنز با ثبت‌نام، نقره با اولین محصول، طلا با ۱۰ محصول. محصولات از همین حالا باز است.
        </p>
      </div>

      <TierTrack current={tier} />
      <ProfileComplete />

      <Card className="overflow-hidden rounded-3xl bg-[#f3f6ec] ring-primary/20">
        <CardContent className="flex flex-col items-center gap-5 px-6 py-12 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-white shadow-[0_10px_30px_rgba(128,173,1,0.18)]">
            {tier === "gold" ? (
              <StarIcon className="size-10 text-[#e0b84a]" weight="fill" />
            ) : (
              <PackageIcon className="size-10 text-primary" weight="duotone" />
            )}
          </span>
          <div className="max-w-sm">
            <p className="text-xs font-bold text-primary">سطح {tier === "bronze" ? "برنز" : tier === "silver" ? "نقره" : "طلا"}</p>
            <h2 className="mt-2 text-2xl font-bold">{count.toLocaleString("fa-IR")} محصول</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{next}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/products/new" className={cn(buttonVariants(), "h-11 rounded-xl px-5")}>
              گذاشتن محصول
            </Link>
            <Link href="/store/edit" className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-xl bg-white px-5")}>
              ویرایش فروشگاه
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
