import { fetchNotifSummary, type NotifSummary } from "@/lib/support"
import { fetchOrders, type SellerOrder } from "@/lib/orders"
import { fetchSellerStats, type SellerStats } from "@/lib/stats"
import { fetchStore } from "@/lib/store"

export type DashboardData = {
  stats: SellerStats | null
  orders: SellerOrder[]
  counts: Record<string, number>
  notifs: NotifSummary | null
  shop: string
}

export async function loadDashboard(): Promise<DashboardData> {
  const [stats, orders, notifs, store] = await Promise.all([
    fetchSellerStats().catch(() => null),
    fetchOrders("all", "newest", "").catch(() => null),
    fetchNotifSummary().catch(() => null),
    fetchStore().catch(() => null),
  ])

  return {
    stats,
    orders: orders?.orders.slice(0, 5) ?? [],
    counts: orders?.counts ?? {},
    notifs,
    shop: store?.name_fa ?? "",
  }
}
