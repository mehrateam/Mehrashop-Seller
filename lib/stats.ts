import { apiFetch } from "@/lib/auth"

export type SellerDay = {
  date: string
  total: number
  count: number
}

export type SellerStats = {
  monthly_total: number
  monthly_order_count: number
  comment_count: number
  product_count: number
  days?: SellerDay[]
}

export async function fetchSellerStats() {
  const res = await apiFetch("/dashboard/api/02/seller/stats/")
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.is_success) return null
  return body.data as SellerStats
}
