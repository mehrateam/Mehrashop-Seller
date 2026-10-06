"use client"

import Link from "next/link"
import { IdentificationCardIcon } from "@phosphor-icons/react"
import { TierTrack } from "@/components/access/TierTrack"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { tierAt } from "@/lib/tier"
import { useSeller } from "@/lib/use-seller"
import { cn } from "@/lib/utils"

export function AccessCard() {
  const user = useSeller()
  const tier = tierAt(user?.tier)
  if (tier === "gold" && user?.gold_done) return null
  const upload = tier === "bronze" && Boolean(user?.bronze_done)
  const logo = tier === "bronze" && !user?.bronze_done
  const shop = tier === "gold"
  const action = upload
    ? { href: "/access#upload", label: "آپلود کارت ملی" }
    : logo
      ? { href: "/access#upload", label: "گذاشتن لوگو" }
      : tier === "silver"
        ? { href: "/access", label: "دیدن وضعیت مدارک" }
        : { href: "/access#shop", label: "تکمیل پروفایل و آدرس" }
  const title = upload
    ? "کارت ملی را آپلود کنید"
    : logo
      ? "لوگوی فروشگاه را بگذارید"
      : tier === "silver"
        ? "مدارک در انتظار تایید است"
        : "پروفایل و آدرس را کامل کنید"
  const copy = upload
    ? "سطح شما برنز است. آپلود همین دکمه سبز است؛ عکس رو و پشت کارت را آنجا می‌گذارید."
    : logo
      ? "سطح شما برنز است. اول لوگو یا عکس پروفایل را بگذارید."
      : tier === "silver"
        ? "سطح شما نقره است. بعد از تایید مدیر، پروفایل و بنر و آدرس را در طلا کامل می‌کنید."
        : "سطح شما طلاست. پروفایل و آدرس را ذخیره کنید تا محصولات باز شود. بنر اختیاری است."

  return (
    <Card className={cn("rounded-2xl xl:col-span-3", upload || logo || shop ? "bg-[#f3f6ec] ring-primary/25" : "ring-foreground/5")}>
      <CardContent className="flex flex-col gap-4 pt-(--card-spacing)">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {upload ? (
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-white">
                <IdentificationCardIcon className="size-6" weight="duotone" />
              </span>
            ) : null}
            <div>
              <p className="text-xs font-semibold text-muted-foreground">سطح {tier === "bronze" ? "برنز" : tier === "silver" ? "نقره" : "طلا"}</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">{title}</h2>
              <p className="mt-1 max-w-xl text-sm leading-7 text-muted-foreground">{copy}</p>
            </div>
          </div>
          <Link
            href={action.href}
            className={cn(buttonVariants(), "h-12 w-full rounded-xl px-5 text-[15px] font-semibold sm:w-auto")}
          >
            {action.label}
          </Link>
        </div>
        <TierTrack current={tier} />
      </CardContent>
    </Card>
  )
}
