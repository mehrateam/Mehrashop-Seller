"use client"

import Link from "next/link"
import { PackageIcon } from "@phosphor-icons/react"
import { TierTrack } from "@/components/access/TierTrack"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { tierAt } from "@/lib/tier"
import { useSeller } from "@/lib/use-seller"
import { cn } from "@/lib/utils"

export function AccessCard() {
  const user = useSeller()
  const tier = tierAt(user?.tier)
  const count = user?.product_count ?? 0
  if (tier === "gold") return null

  const title = tier === "bronze" ? "اولین محصول را بگذارید" : "تا طلا چند محصول دیگر"
  const copy =
    tier === "bronze"
      ? "سطح شما برنز است. با گذاشتن اولین محصول نقره می‌شوید."
      : `سطح شما نقره است. با ${(10 - count).toLocaleString("fa-IR")} محصول دیگر طلایی می‌شوید.`

  return (
    <Card className="rounded-2xl bg-[#f3f6ec] ring-primary/25 xl:col-span-3">
      <CardContent className="flex flex-col gap-4 pt-(--card-spacing)">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-white">
              <PackageIcon className="size-6" weight="duotone" />
            </span>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                سطح {tier === "bronze" ? "برنز" : "نقره"} · {count.toLocaleString("fa-IR")} محصول
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">{title}</h2>
              <p className="mt-1 max-w-xl text-sm leading-7 text-muted-foreground">{copy}</p>
            </div>
          </div>
          <Link href="/products/new" className={cn(buttonVariants(), "h-12 w-full rounded-xl px-5 text-[15px] font-semibold sm:w-auto")}>
            گذاشتن محصول
          </Link>
        </div>
        <TierTrack current={tier} />
      </CardContent>
    </Card>
  )
}
