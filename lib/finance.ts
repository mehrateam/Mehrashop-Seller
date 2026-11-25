import { apiFetch } from "@/lib/auth"

export const KINDS = [
  { id: "sales", label: "فروش‌ها" },
  { id: "void", label: "لغو و مرجوع" },
] as const

export const SORTS = [
  { id: "newest", label: "جدیدترین" },
  { id: "oldest", label: "قدیمی‌ترین" },
] as const

export type Sale = {
  id: number
  status: string
  status_label: string
  customer_name: string
  subtotal: number
  shipping_cost: number
  total: number
  created_at: string
}

export type FinanceSummary = {
  sales_total: number
  sales_count: number
  month_total: number
  month_count: number
}

export type FinancePage = {
  summary: FinanceSummary
  transactions: Sale[]
  counts: Record<string, number>
  page: number
  pages: number
  total: number
}

async function read<T>(res: Response) {
  const body = (await res.json().catch(() => null)) as { message?: unknown; data: T; is_success: boolean } | null
  const message = body?.message
  if (!res.ok || !body?.is_success) {
    throw new Error(typeof message === "string" && message ? message : "خطا در دریافت تراکنش‌ها")
  }
  return body.data
}

export async function fetchFinance(kind: string, sort: string, q: string, page = 1) {
  const params = new URLSearchParams()
  if (kind === "void") params.set("kind", kind)
  if (sort !== "newest") params.set("sort", sort)
  if (q) params.set("q", q)
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return read<FinancePage>(await apiFetch(`/dashboard/api/02/seller/finance/${qs ? `?${qs}` : ""}`))
}
