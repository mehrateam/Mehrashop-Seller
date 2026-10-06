import { apiFetch } from "@/lib/auth"
import { mediaUrl, toman } from "@/lib/orders"

const ROOT = "/dashboard/api/02/products/seller"

export const STATUS_TABS = [
  { id: "all", label: "همه" },
  { id: "confirmed", label: "تایید شده" },
  { id: "pending", label: "در انتظار تایید" },
  { id: "awaiting_category", label: "در انتظار دسته‌بندی" },
  { id: "draft", label: "پیش‌نویس" },
  { id: "rejected", label: "رد شده" },
] as const

export const SORTS = [
  { id: "newest", label: "جدیدترین" },
  { id: "oldest", label: "قدیمی‌ترین" },
] as const

export const STATUS_CLASS: Record<string, string> = {
  confirmed: "bg-primary/15 text-primary",
  pending: "bg-amber-100 text-amber-950",
  awaiting_category: "bg-amber-100 text-amber-950",
  draft: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/10 text-destructive",
}

export type SellerProduct = {
  id: number
  title: string
  image: string
  category: string
  price: string
  discount: string
  sale_price: string
  stock: number
  status: string
  status_label: string
  active: boolean
  admin_deactivated: boolean
  product_type: string
  is_original: boolean
}

type Ok<T> = { message?: unknown; data: T; is_success: boolean }

export type ProductListPage = {
  products: SellerProduct[]
  counts: Record<string, number>
  page: number
  pages: number
  total: number
}

function failText(message: unknown) {
  if (typeof message === "string" && message) return message
  return "خطا در ارتباط با سرور"
}

export function productImage(file: string) {
  return mediaUrl(file)
}

export function productPrice(product: SellerProduct) {
  return product.sale_price ? toman(product.sale_price) : "—"
}

export type DraftLimit = {
  count: number
  limit: number
  can_create: boolean
  message: string
}

export async function fetchDraftLimit() {
  const res = await apiFetch(`${ROOT}/draft-limit/`)
  const body = (await res.json().catch(() => null)) as Ok<DraftLimit> | null
  if (!res.ok || !body?.is_success) throw new Error(failText(body?.message))
  return body.data
}

export async function fetchProducts(status: string, sort: string, q: string, page = 1) {
  const params = new URLSearchParams()
  if (status !== "all") params.set("status", status)
  if (sort !== "newest") params.set("sort", sort)
  if (q) params.set("q", q)
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  const res = await apiFetch(`${ROOT}/${qs ? `?${qs}` : ""}`)
  const body = (await res.json().catch(() => null)) as Ok<ProductListPage> | null
  if (!res.ok || !body?.is_success) throw new Error(failText(body?.message))
  return body.data
}
