import { fetchOrders, type SellerOrder } from "@/lib/orders"
import { fetchSellerStats, type SellerStats } from "@/lib/stats"
import { fetchStore, type StoreProduct } from "@/lib/store"
import { fetchNotifSummary, fetchTickets, type NotifSummary, type SupportTicket } from "@/lib/support"

export type DashboardData = {
  stats: SellerStats | null
  orders: SellerOrder[]
  counts: Record<string, number>
  notifs: NotifSummary | null
  shop: string
  products: StoreProduct[]
  tickets: SupportTicket[]
  ticketCounts: Record<string, number>
}

export async function loadDashboard(): Promise<DashboardData> {
  const [stats, orders, notifs, store, tickets] = await Promise.all([
    fetchSellerStats().catch(() => null),
    fetchOrders("all", "newest", "").catch(() => null),
    fetchNotifSummary().catch(() => null),
    fetchStore().catch(() => null),
    fetchTickets("all", "newest").catch(() => null),
  ])

  return {
    stats,
    orders: orders?.orders.slice(0, 5) ?? [],
    counts: orders?.counts ?? {},
    notifs,
    shop: store?.name_fa ?? "",
    products: store?.products ?? [],
    tickets: tickets?.tickets.slice(0, 4) ?? [],
    ticketCounts: tickets?.counts ?? {},
  }
}
