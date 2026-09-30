import { apiFetch } from "@/lib/auth"

const ROOT = "/dashboard/api/02/orders/seller"

export const STATUS_TABS = [
  { id: "all", label: "همه" },
  { id: "paid", label: "در انتظار تایید" },
  { id: "processing", label: "آماده‌سازی" },
  { id: "ready_for_shipping", label: "آماده ارسال" },
  { id: "shipped", label: "ارسال شده" },
  { id: "delivered", label: "تحویل شده" },
  { id: "rejected", label: "رد شده" },
  { id: "cancelled", label: "لغو شده" },
  { id: "returned", label: "مرجوعی" },
] as const

export const SORTS = [
  { id: "newest", label: "جدیدترین" },
  { id: "oldest", label: "قدیمی‌ترین" },
] as const

export const REJECT_REASONS = [
  "اتمام موجودی",
  "نیازمند تماس",
  "ناموجود در انبار",
  "افزایش قیمت",
  "ایراد فنی کالا",
  "درخواست مشتری",
  "دلایل دیگر",
]

export const ORDER_FLOW = [
  { id: "paid", label: "در انتظار تایید" },
  { id: "processing", label: "در حال آماده‌سازی" },
  { id: "ready_for_shipping", label: "آماده ارسال" },
  { id: "shipped", label: "ارسال شده" },
] as const

export function flowIndex(status: string) {
  if (status === "shipped" || status === "delivered") return ORDER_FLOW.length - 1
  return ORDER_FLOW.findIndex((step) => step.id === status)
}

export const STATUS_CLASS: Record<string, string> = {
  paid: "bg-amber-100 text-amber-950",
  processing: "bg-amber-100 text-amber-950",
  ready_for_shipping: "bg-primary/15 text-primary",
  shipped: "bg-primary/15 text-primary",
  delivered: "bg-primary/15 text-primary",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
  returned: "bg-muted text-muted-foreground",
}

export type OrderItem = {
  id: number
  product_id: number | null
  title: string
  variety: string
  image: string
  quantity: number
  stock: number
  price: string
  discount: string
  line_total: string
  status: string
  status_label: string
  rejection_reason: string
}

export type SellerOrder = {
  id: number
  status: string
  status_label: string
  customer_name: string
  city: string
  province: string
  total: string
  created_at: string
  updated_at: string
  phone?: string
  postal_code?: string
  address?: string
  subtotal?: string
  shipping_cost?: string
  tracking_code?: string
  items?: OrderItem[]
}

type Ok<T> = { message?: unknown; data: T; is_success: boolean }

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.mehrashop.com"

export function mediaUrl(file: string) {
  if (!file) return ""
  if (file.startsWith("http")) return file
  return `${API}${file.startsWith("/") ? file : `/${file}`}`
}

export function toman(value: string | number | undefined) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return "—"
  return `${amount.toLocaleString("fa-IR", { maximumFractionDigits: 0 })} تومان`
}

function failText(message: unknown) {
  if (typeof message === "string" && message) return message
  if (message && typeof message === "object") {
    const first = Object.values(message as Record<string, unknown>)[0]
    const value = Array.isArray(first) ? first[0] : first
    if (typeof value === "string") return value
  }
  return "خطا در ارتباط با سرور"
}

async function read<T>(res: Response) {
  const body = (await res.json().catch(() => null)) as Ok<T> | null
  if (!res.ok || !body?.is_success) throw new Error(failText(body?.message))
  return body.data
}

export type OrderListPage = {
  orders: SellerOrder[]
  counts: Record<string, number>
  page: number
  pages: number
  total: number
}

export async function fetchOrders(status: string, sort: string, q: string, page = 1) {
  const params = new URLSearchParams()
  if (status !== "all") params.set("status", status)
  if (sort !== "newest") params.set("sort", sort)
  if (q) params.set("q", q)
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return read<OrderListPage>(await apiFetch(`${ROOT}/${qs ? `?${qs}` : ""}`))
}

export async function fetchOrder(id: string) {
  return read<SellerOrder>(await apiFetch(`${ROOT}/${id}/`))
}

export async function postOrder(
  id: string,
  action: "approve" | "reject" | "status" | "ship",
  payload?: object
) {
  return read<SellerOrder>(
    await apiFetch(`${ROOT}/${id}/${action}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {}),
    })
  )
}

export async function rejectOrderItem(itemId: number, reason: string, description: string) {
  return read<SellerOrder>(
    await apiFetch(`${ROOT}/items/${itemId}/reject/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, description }),
    })
  )
}

export async function downloadInvoice(id: string) {
  const res = await apiFetch(`${ROOT}/${id}/invoice/`)
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as Ok<unknown> | null
    throw new Error(failText(body?.message))
  }
  const url = URL.createObjectURL(await res.blob())
  const link = document.createElement("a")
  link.href = url
  link.download = `invoice-${id}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
