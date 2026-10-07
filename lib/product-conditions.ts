import { apiFetch } from "@/lib/auth"
import { mediaUrl } from "@/lib/orders"

const ROOT = "/dashboard/api/02/products/seller"

type Ok<T> = { message?: unknown; data: T; is_success: boolean }

export type Place = { id: number; name: string }

export type Province = Place & { city: Place[] }

export type DeliveryMethod = { id: number; name: string; icon: string }

export type StepFive = {
  shipping_all_over_iran: boolean
  shipping_provinces: number[]
  shipping_cities: number[]
  returnable: boolean
  returnable_days: number
  returnable_items: number[]
  returnable_causes: number[]
  shipping_delivery: number[]
  provinces: Province[]
  items: Place[]
  causes: Place[]
  methods: DeliveryMethod[]
  product_status: string
}

export type StepFiveInput = {
  shipping_all_over_iran: boolean
  shipping_provinces: number[]
  shipping_cities: number[]
  returnable: boolean
  returnable_days: number
  returnable_items: number[]
  returnable_causes: number[]
  shipping_delivery: number[]
}

function failText(message: unknown) {
  if (typeof message === "string" && message) return message
  return "خطا در ارتباط با سرور"
}

function ids(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === "number" ? item : Number((item as { id?: number })?.id || 0)))
    .filter((item) => item > 0)
}

async function read<T>(res: Response) {
  const body = (await res.json().catch(() => null)) as Ok<T> | null
  if (!res.ok || !body?.is_success) throw new Error(failText(body?.message))
  return body.data
}

function normalize(raw: Record<string, unknown>): StepFive {
  const provinces = (Array.isArray(raw.all_provinces) ? raw.all_provinces : []) as Province[]
  const shippingProvinces = ids(raw.shipping_provinces)
  const shippingCities = ids(raw.shipping_cities)
  return {
    shipping_all_over_iran: Boolean(raw.shipping_all_over_iran) || (shippingProvinces.length === 0 && shippingCities.length === 0),
    shipping_provinces: shippingProvinces,
    shipping_cities: shippingCities,
    returnable: Boolean(raw.returnable),
    returnable_days: Number(raw.returnable_days) || 0,
    returnable_items: ids(raw.returnable_items),
    returnable_causes: ids(raw.returnable_causes),
    shipping_delivery: ids(raw.shipping_delivery),
    provinces: provinces.map((item) => ({ id: item.id, name: item.name, city: item.city || [] })),
    items: ((raw.all_returnable_items as { id: number; item_name: string }[]) || []).map((item) => ({ id: item.id, name: item.item_name })),
    causes: ((raw.all_returnable_causes as { id: number; cause_name: string }[]) || []).map((item) => ({ id: item.id, name: item.cause_name })),
    methods: ((raw.shipping_delivery_info as { id: number; name: string; delivery_icon?: string }[]) || []).map((item) => ({
      id: item.id,
      name: item.name,
      icon: item.delivery_icon ? mediaUrl(item.delivery_icon) : "",
    })),
    product_status: String(raw.product_status || ""),
  }
}

export async function fetchStepFive(productId: number) {
  const res = await apiFetch(`${ROOT}/step5/${productId}/`)
  return normalize((await read<Record<string, unknown>>(res)) || {})
}

export async function saveStepFive(productId: number, body: StepFiveInput) {
  const res = await apiFetch(`${ROOT}/step5/${productId}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return normalize((await read<Record<string, unknown>>(res)) || {})
}

export function publishText(status: string) {
  return status === "awaiting_category"
    ? "محصول ثبت شد و برای تعیین دسته‌بندی به مدیریت ارسال شد"
    : "محصول با موفقیت انتشار یافت"
}
