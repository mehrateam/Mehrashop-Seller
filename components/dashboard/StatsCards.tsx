"use client"

import { useEffect, useState } from "react"
import {
  ChatCircleIcon,
  PackageIcon,
  ShoppingCartIcon,
  WalletIcon,
  type Icon,
} from "@phosphor-icons/react"
import { Card, CardContent } from "@/components/ui/card"
import { fetchSellerStats, type SellerStats } from "@/lib/stats"

const cards: { key: keyof SellerStats; title: string; icon: Icon }[] = [
  { key: "monthly_total", title: "مقدار فروش ماه (تومان)", icon: WalletIcon },
  { key: "monthly_order_count", title: "تعداد فروش ماه", icon: ShoppingCartIcon },
  { key: "comment_count", title: "تعداد دیدگاه ها", icon: ChatCircleIcon },
  { key: "product_count", title: "تعداد محصولات", icon: PackageIcon },
]

export default function StatsCards() {
  const [stats, setStats] = useState<SellerStats | null>(null)

  useEffect(() => {
    let alive = true
    fetchSellerStats()
      .then((data) => {
        if (alive) setStats(data)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => (
        <Card key={item.key} className="rounded-2xl ring-foreground/5">
          <CardContent className="pt-(--card-spacing)">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-muted-foreground">{item.title}</span>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <item.icon className="size-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {stats
                ? Number(stats[item.key]).toLocaleString("fa-IR", { maximumFractionDigits: 0 })
                : "—"}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
