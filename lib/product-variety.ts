import { apiFetch } from "@/lib/auth"
import { mediaUrl } from "@/lib/orders"

const ROOT = "/dashboard/api/02/products/seller"

type Ok<T> = { message?: unknown; data: T; is_success: boolean }

export type VarietyOption = { id: number; fa_title: string }

export type AvailableVariety = { id: number; fa_name: string; selectives: VarietyOption[] }

export type VarietyImage = { id: number; url: string }

export type VarietyValue = { id: number; value: string; images: VarietyImage[] }

export type VarietyGroup = { id: number; name: string; values: VarietyValue[] }

export type SkuRow = {
  id: number
  price: number
  count: number
  discount_percentage: number
  varieties: VarietyGroup[]
}

export type StepFour = {
  available: AvailableVariety[]
  grouped_variety_values: VarietyGroup[]
  skus: SkuRow[]
  complete_structure: boolean
  creator_can_edit: boolean
  creator_variety_info: { id: number; fa_name: string }[]
}

function failText(message: unknown) {
  if (typeof message === "string" && message) return message
  return "خطا در ارتباط با سرور"
}

async function read<T>(res: Response) {
  const body = (await res.json().catch(() => null)) as Ok<T> | null
  if (!res.ok || !body?.is_success) throw new Error(failText(body?.message))
  return body.data
}

function money(value: unknown) {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

function pictures(images: { id: number; image?: string; url?: string }[] | undefined): VarietyImage[] {
  return (images || []).flatMap((image) => {
    const url = mediaUrl(image.url || image.image || "")
    return url ? [{ id: image.id, url }] : []
  })
}

function groups(rows: { id: number; name: string; values?: { id: number; value: string; images?: { id: number; image?: string; url?: string }[] }[] }[] | undefined): VarietyGroup[] {
  return (rows || []).map((group) => ({
    id: group.id,
    name: group.name,
    values: (group.values || []).map((value) => ({ id: value.id, value: value.value, images: pictures(value.images) })),
  }))
}

export function normalizeStep(step: StepFour): StepFour {
  return {
    ...step,
    available: step.available || [],
    grouped_variety_values: groups(step.grouped_variety_values),
    creator_variety_info: step.creator_variety_info || [],
    skus: (step.skus || []).map((sku) => ({
      ...sku,
      price: money(sku.price),
      count: money(sku.count),
      discount_percentage: money(sku.discount_percentage),
      varieties: groups(sku.varieties),
    })),
  }
}

export function finalPrice(price: number, discount: number) {
  const net = price - price * (discount / 100)
  return Math.round(net * 1.1)
}

export function groupedDigits(value: number) {
  if (!value) return ""
  return Math.round(value).toLocaleString("en-US")
}

export function toman(value: number) {
  return `${Math.round(value).toLocaleString("fa-IR")} تومان`
}

async function send(path: string, method: string, body?: unknown) {
  const res = await apiFetch(`${ROOT}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  return normalizeStep(await read<StepFour>(res))
}

export function fetchStepFour(productId: number) {
  return send(`/step4/${productId}/`, "GET")
}

export function addVarietyValue(productId: number, varietyId: number, selectiveValue: number) {
  return send(`/step4/${productId}/values/`, "POST", { variety_id: varietyId, selective_value: selectiveValue })
}

export function removeVarietyValue(productId: number, valueId: number) {
  return send(`/step4/${productId}/values/${valueId}/`, "DELETE")
}

export function removeVariety(productId: number, varietyId: number) {
  return send(`/step4/${productId}/varieties/${varietyId}/`, "DELETE")
}

export async function saveVarietyImages(productId: number, valueId: number, currentIds: number[], files: File[]) {
  const form = new FormData()
  currentIds.forEach((id) => form.append("current_ids", String(id)))
  files.forEach((file) => form.append("new_images", file))
  const res = await apiFetch(`${ROOT}/step4/${productId}/values/${valueId}/images/`, { method: "PUT", body: form })
  return normalizeStep(await read<StepFour>(res))
}

export function saveSkus(productId: number, skus: SkuRow[]) {
  return send(`/step4/${productId}/skus/`, "PUT", {
    skus: skus.map((sku) => ({
      id: sku.id,
      price: sku.price,
      count: sku.count,
      discount_percentage: sku.discount_percentage,
    })),
  })
}
