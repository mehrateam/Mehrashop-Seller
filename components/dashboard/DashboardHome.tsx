"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckIcon,
  HeadsetIcon,
  PackageIcon,
  ShoppingCartIcon,
  type Icon,
} from "@phosphor-icons/react"
import RevenueChart from "@/components/dashboard/RevenueChart"
import StatsCards from "@/components/dashboard/StatsCards"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDisplayName, getUser } from "@/lib/auth"
import { loadDashboard, type DashboardData } from "@/lib/dashboard"
import { JALALI_MONTHS, jalaliLabel, partsOf, todayIso } from "@/lib/jalali"
import { toman, type SellerOrder } from "@/lib/orders"

const WEEKDAYS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"]

const FLOW = [
  { key: "paid", name: "در انتظار تایید" },
  { key: "processing", name: "آماده‌سازی" },
  { key: "ready_for_shipping", name: "آماده ارسال" },
  { key: "shipped", name: "ارسال شده" },
  { key: "delivered", name: "تحویل شده" },
]

const BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  delivered: "default",
  paid: "secondary",
  processing: "secondary",
  cancelled: "destructive",
  rejected: "destructive",
  returned: "destructive",
}

export default function DashboardHome() {
  const router = useRouter()
  const [user] = useState(() => getUser())
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    let alive = true
    loadDashboard().then((next) => {
      if (alive) setData(next)
    })
    return () => {
      alive = false
    }
  }, [])

  const stats = data?.stats ?? null
  const orders = data?.orders ?? []
  const counts = data?.counts ?? {}
  const notifs = data?.notifs
  const name = user?.first_name || getDisplayName(user)
  const dateLabel = `${WEEKDAYS[new Date().getDay()]}، ${jalaliLabel(todayIso())}`
  const monthOrders = Number(stats?.monthly_order_count ?? 0)
  const monthSales = Number(stats?.monthly_total ?? 0).toLocaleString("fa-IR", { maximumFractionDigits: 0 })
  const summary = !data
    ? "خلاصه فروشگاه در حال آماده‌سازی است."
    : counts.paid
      ? `${Number(counts.paid).toLocaleString("fa-IR")} سفارش منتظر تایید شماست.`
      : monthOrders > 0
        ? `این ماه ${monthOrders.toLocaleString("fa-IR")} سفارش و ${monthSales} تومان فروش ثبت شده.`
        : "این ماه هنوز فروشی ثبت نشده. فروشگاه شما آماده‌ست."
  const points = (stats?.days ?? []).map((day, index, all) => {
    const j = partsOf(day.date)
    const prev = index ? partsOf(all[index - 1].date) : null
    const dayNo = j ? j.jd.toLocaleString("fa-IR") : day.date
    return {
      label: j && (!prev || prev.jm !== j.jm) ? `${dayNo} ${JALALI_MONTHS[j.jm - 1]}` : dayNo,
      revenue: day.total,
    }
  })
  const weekSum = (stats?.days ?? []).reduce((sum, day) => sum + day.total, 0)
  const flowTotal = FLOW.reduce((sum, item) => sum + (counts[item.key] || 0), 0)
  const tasks: { href: string; title: string; hint: string; icon: Icon }[] = []

  if (counts.paid) {
    tasks.push({
      href: "/orders?tab=paid",
      title: `${counts.paid.toLocaleString("fa-IR")} سفارش منتظر تایید`,
      hint: "مشتری منتظر پاسخ شماست",
      icon: ShoppingCartIcon,
    })
  }
  if (counts.ready_for_shipping) {
    tasks.push({
      href: "/orders?tab=ready_for_shipping",
      title: `${counts.ready_for_shipping.toLocaleString("fa-IR")} سفارش آماده ارسال`,
      hint: "می‌توانید برای ارسال اقدام کنید",
      icon: PackageIcon,
    })
  }
  if (notifs?.answered) {
    tasks.push({
      href: "/support?tab=answered",
      title: `${notifs.answered.toLocaleString("fa-IR")} پاسخ تازه پشتیبانی`,
      hint: "پیام جدید برایتان آمده",
      icon: HeadsetIcon,
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="rounded-2xl bg-primary/10 ring-foreground/5">
        <CardContent className="flex flex-col gap-4 pt-(--card-spacing) sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">{dateLabel}</p>
            <h1 className="text-2xl font-bold tracking-tight">سلام، {name}</h1>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {data?.shop ? (
              <span className="rounded-full border bg-card px-3 py-1 text-xs font-semibold">{data.shop}</span>
            ) : null}
            <Link href="/orders" className={buttonVariants({ size: "sm" })}>
              سفارش‌ها
            </Link>
            <Link href="/store" className={buttonVariants({ variant: "outline", size: "sm" })}>
              فروشگاه
            </Link>
          </div>
        </CardContent>
      </Card>

      <StatsCards stats={stats} />

      <section className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader>
            <CardTitle>فروش هفت روز اخیر</CardTitle>
            <CardDescription>
              {!data
                ? "در حال بارگذاری"
                : stats
                  ? `${weekSum.toLocaleString("fa-IR", { maximumFractionDigits: 0 })} تومان`
                  : "آمار فروش در دسترس نیست"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={points} />
            {stats && weekSum === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">در این هفت روز فروشی ثبت نشده.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader>
            <CardTitle>وضعیت سفارش‌ها</CardTitle>
            <CardDescription>
              {data ? `${flowTotal.toLocaleString("fa-IR")} سفارش در جریان` : "در حال بارگذاری"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {!data ? (
              <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
            ) : flowTotal === 0 ? (
              <p className="text-sm text-muted-foreground">سفارش فعالی در جریان نیست.</p>
            ) : (
              FLOW.map((item) => {
                const count = counts[item.key] || 0
                const share = flowTotal ? Math.round((count / flowTotal) * 100) : 0
                return (
                  <Link key={item.key} href={`/orders?tab=${item.key}`} className="block space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-muted-foreground">{count.toLocaleString("fa-IR")}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
                    </div>
                  </Link>
                )
              })
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader>
            <CardTitle>سفارش‌های اخیر</CardTitle>
            <CardAction>
              <Link href="/orders" className={buttonVariants({ variant: "outline", size: "sm" })}>
                مشاهده همه
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs font-bold tracking-wide text-muted-foreground">
                  <th className="px-3 py-3 text-start">سفارش</th>
                  <th className="px-3 py-3 text-start">مشتری</th>
                  <th className="px-3 py-3 text-start">مبلغ</th>
                  <th className="px-3 py-3 text-start">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {!data ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                      در حال بارگذاری...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                      هنوز سفارشی ثبت نشده.
                    </td>
                  </tr>
                ) : (
                  orders.map((order: SellerOrder) => (
                    <tr
                      key={order.id}
                      className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
                      onClick={() => router.push(`/orders?order=${order.id}`)}
                    >
                      <td className="px-3 py-3.5">
                        <p className="font-semibold">#{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.created_at}</p>
                      </td>
                      <td className="px-3 py-3.5">{order.customer_name || "—"}</td>
                      <td className="px-3 py-3.5 font-semibold">{toman(order.total)}</td>
                      <td className="px-3 py-3.5">
                        <Badge variant={BADGE[order.status] ?? "outline"}>{order.status_label}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader>
            <CardTitle>کارهای امروز</CardTitle>
            <CardDescription>چیزهایی که بهتر است همین حالا ببینید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!data ? (
              <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
            ) : tasks.length === 0 ? (
              <div className="flex gap-3.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckIcon className="size-3.5" weight="bold" />
                </div>
                <div>
                  <p className="text-sm font-semibold">همه‌چیز مرتب است</p>
                  <p className="text-xs text-muted-foreground">سفارش یا پیامی منتظر شما نیست.</p>
                </div>
              </div>
            ) : (
              tasks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex gap-3.5 rounded-xl p-1 transition-colors hover:bg-muted/60"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
                    <item.icon className="size-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.hint}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
