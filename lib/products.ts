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
  needs_review: boolean
  product_type: string
  is_original: boolean
}

export type SaleState = "active" | "inactive" | "draft" | "waiting" | "blocked"

export const SALE_LABEL: Record<SaleState, string> = {
  active: "فعال",
  inactive: "غیرفعال",
  draft: "پیش‌نویس",
  waiting: "در انتظار تعیین دسته‌بندی",
  blocked: "غیرفعال توسط مدیریت",
}

export const SALE_CLASS: Record<SaleState, string> = {
  active: "bg-primary/15 text-primary",
  inactive: "bg-destructive/10 text-destructive",
  draft: "bg-muted text-muted-foreground",
  waiting: "bg-[#DD794F]/15 text-[#9a4e2c]",
  blocked: "bg-destructive/10 text-destructive",
}

export function saleState(product: SellerProduct): SaleState {
  if (product.admin_deactivated) return "blocked"
  if (product.status === "awaiting_category") return "waiting"
  if (!product.active) return "inactive"
  if (product.status === "draft") return "draft"
  return "active"
}

export function editLabel(product: SellerProduct) {
  if (product.status === "awaiting_category") return "مشاهده وضعیت"
  if (product.needs_review) return "بررسی اطلاعات"
  return "ویرایش"
}

export function productLink(id: number) {
  return `https://mehrashop.com/product/pId-${id}/`
}

export function editLink(id: number) {
  return `/products/new?step=1&product=${id}`
}

export type ProductSku = {
  id: number
  price: string
  discount: string
  count: number
  variety: string
}

export type ProductSkuGroup = {
  id: number
  title: string
  image: string
  skus: ProductSku[]
}

export type SkuUpdate = {
  id: number
  price: number
  discount_percentage: number
  count: number
}

export function groupDigits(value: string) {
  if (!value) return ""
  const [whole, fraction] = value.split(".")
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return fraction === undefined ? grouped : `${grouped}.${fraction}`
}

export function nextSkuPrice(price: number, value: number, up: boolean, percent: boolean) {
  if (percent) return up ? price + (price * value) / 100 : price - (price * value) / 100
  if (up) return price + value
  if (value < price) return price - value
  return price
}

export async function bulkProductActive(ids: number[], active: boolean) {
  const res = await apiFetch(`${ROOT}/status/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, action: active ? "activate" : "deactivate" }),
  })
  const body = (await res.json().catch(() => null)) as Ok<{ active: boolean; count: number }> | null
  if (!res.ok || !body?.is_success) throw new Error(failText(body?.message))
  return body.data
}

export async function fetchProductSkus(ids: number[]) {
  const res = await apiFetch(`${ROOT}/skus/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products: ids }),
  })
  const body = (await res.json().catch(() => null)) as Ok<{ products: ProductSkuGroup[] }> | null
  if (!res.ok || !body?.is_success) throw new Error(failText(body?.message))
  return body.data.products
}

export async function updateProductSkus(skus: SkuUpdate[]) {
  const res = await apiFetch(`${ROOT}/skus/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skus }),
  })
  const body = (await res.json().catch(() => null)) as Ok<{ count: number }> | null
  if (!res.ok || !body?.is_success) throw new Error(failText(body?.message))
  return body.data
}

export async function setProductActive(id: number, active: boolean) {
  const res = await apiFetch(`${ROOT}/${id}/status/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: active ? "activate" : "deactivate" }),
  })
  const body = (await res.json().catch(() => null)) as Ok<{ active: boolean }> | null
  if (!res.ok || !body?.is_success) throw new Error(failText(body?.message))
  return body.data.active
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

export type CatalogProduct = {
  id: number
  title: string
  en_name: string
  image: string
  categories: string[]
}

export async function searchCatalog(q: string) {
  const params = new URLSearchParams({ q })
  const res = await apiFetch(`${ROOT}/choose/?${params}`)
  const body = (await res.json().catch(() => null)) as Ok<{ products: CatalogProduct[] }> | null
  if (!res.ok || !body?.is_success) throw new Error(failText(body?.message))
  return body.data.products
}

export async function chooseProduct(product: number) {
  const res = await apiFetch(`${ROOT}/choose/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product }),
  })
  const body = (await res.json().catch(() => null)) as Ok<{ offering: number; product: number }> | null
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
