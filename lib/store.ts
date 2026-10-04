import { apiFetch } from "@/lib/auth"
import { mediaUrl, toman } from "@/lib/orders"

export type StoreBranch = {
  id: number
  name: string
  address: string
  phone_company: string
  postal_code?: string | null
  x_coordination: number
  y_coordination: number
  unit?: number | null
  no?: number | null
  province?: number | null
  city?: number | null
}

export type BranchInput = {
  name: string
  address: string
  phone_company: string
  postal_code: string
  unit: number
  no: number
  city: number
  province: number
  x_coordination: number
  y_coordination: number
}

export type ProvinceOption = {
  id: number
  name: string
  city: { id: number; name: string }[]
}

export type StoreProduct = {
  id: number
  fa_name: string
  image_cover: string
  price: number
  discounted_price: number
  discounted_percentage: number
  avg_score: number | null
  count: number
}

export type SellerStore = {
  id: number
  name_fa: string
  province: string | null
  city: string | null
  business_license: string | null
  score: number | null
  instagram: string | null
  telegram: string | null
  website_url: string | null
  whatsapp: string | null
  logo: string | null
  descriptions: string | null
  banner: string | null
  images: { id: number; image: string }[]
  branches: StoreBranch[]
  products: StoreProduct[]
  discount_permit: boolean
}

export function storeFile(file: string | null | undefined) {
  return file ? mediaUrl(file) : ""
}

export function storePrice(product: StoreProduct) {
  const amount = product.discounted_percentage ? product.discounted_price : product.price
  return toman(amount)
}

export async function fetchStore() {
  const res = await apiFetch("/api/oo/dashboard/seller-store/store/")
  if (!res.ok) throw new Error("خطا در دریافت اطلاعات فروشگاه")
  const data = (await res.json()) as SellerStore | null
  if (!data?.id) throw new Error("فروشگاهی یافت نشد")
  return data
}

function readError(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") return fallback
  const record = data as Record<string, unknown>
  if (typeof record.detail === "string") return record.detail
  if (typeof record.message === "string" && record.is_success === false) return record.message
  const first = Object.values(record)[0]
  const message = Array.isArray(first) ? first[0] : first
  return typeof message === "string" ? message : fallback
}

export function latinNumber(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace("٫", ".").trim()
}

export function mapLink(lat: number, lng: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
}

export function mapPoint(lat: number, lng: number, zoom: number) {
  const size = 256 * 2 ** zoom
  const safe = Math.max(-85, Math.min(85, lat))
  const sine = Math.sin((safe * Math.PI) / 180)
  return {
    x: ((lng + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * size,
  }
}

export function pointToLatLng(x: number, y: number, zoom: number) {
  const size = 256 * 2 ** zoom
  const n = Math.PI - (2 * Math.PI * y) / size
  return {
    lat: Math.max(-85, Math.min(85, (180 / Math.PI) * Math.atan(Math.sinh(n)))),
    lng: (x / size) * 360 - 180,
  }
}

export async function updateStore(id: number, body: FormData) {
  const res = await apiFetch(`/api/oo/dashboard/seller-store/store/update/${id}/`, {
    method: "PUT",
    body,
  })
  if (res.ok) return (await res.json()) as SellerStore
  throw new Error(readError(await res.json().catch(() => null), "ذخیره اطلاعات فروشگاه انجام نشد"))
}

export async function fetchProvinces() {
  const res = await apiFetch("/api/v1/city/city-list/")
  const data = (await res.json().catch(() => null)) as { data?: ProvinceOption[]; is_success?: boolean } | null
  if (!res.ok || !data?.is_success || !data.data) throw new Error("خطا در دریافت استان‌ها")
  return data.data
}

export async function saveBranch(body: BranchInput, id?: number) {
  const res = await apiFetch(
    id ? `/api/oo/dashboard/seller-store/branch/update/${id}/` : "/api/oo/dashboard/seller-store/branch/create/",
    {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(readError(data, id ? "ویرایش آدرس انجام نشد" : "ثبت آدرس انجام نشد"))
  return data as StoreBranch
}

export async function deleteBranch(id: number) {
  const res = await apiFetch(`/api/oo/dashboard/seller-store/branch/update/${id}/`, { method: "DELETE" })
  if (!res.ok) throw new Error(readError(await res.json().catch(() => null), "حذف آدرس انجام نشد"))
}
