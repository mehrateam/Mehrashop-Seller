import {
  ChatCircleIcon,
  PackageIcon,
  ShoppingCartIcon,
  WalletIcon,
  type Icon,
} from "@phosphor-icons/react"
import { Card, CardContent } from "@/components/ui/card"
import type { SellerStats } from "@/lib/stats"

const cards: {
  key: "monthly_total" | "monthly_order_count" | "product_count" | "comment_count"
  title: string
  icon: Icon
}[] = [
  { key: "monthly_total", title: "فروش ماه (تومان)", icon: WalletIcon },
  { key: "monthly_order_count", title: "سفارش این ماه", icon: ShoppingCartIcon },
  { key: "product_count", title: "محصولات فعال", icon: PackageIcon },
  { key: "comment_count", title: "دیدگاه‌ها", icon: ChatCircleIcon },
]

export default function StatsCards({ stats }: { stats: SellerStats | null }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => (
        <Card key={item.key} className="rounded-2xl ring-foreground/5">
          <CardContent className="pt-(--card-spacing)">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-muted-foreground">{item.title}</span>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="size-4.5" weight="duotone" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight tabular-nums">
              {stats
                ? Number(stats[item.key] ?? 0).toLocaleString("fa-IR", { maximumFractionDigits: 0 })
                : "—"}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
