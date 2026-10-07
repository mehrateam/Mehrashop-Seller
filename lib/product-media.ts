import { apiFetch } from "@/lib/auth"
import { mediaUrl } from "@/lib/orders"

const ROOT = "/dashboard/api/02/products/seller"

type Ok<T> = { message?: unknown; data: T; is_success: boolean }

export const IMAGE_LIMIT = 10
export const VIDEO_LIMIT = 3
export const VIDEO_MAX = 15 * 1024 * 1024

export type MediaItem = { id: number; url: string; owned: boolean }

export type StepThree = {
  offering: number
  image_cover: string | null
  images: MediaItem[]
  videos: MediaItem[]
}

export type MediaDraft = { file: File; url: string }

function failText(message: unknown) {
  if (typeof message === "string" && message) return message
  return "خطا در ارتباط با سرور"
}

async function read<T>(res: Response) {
  const body = (await res.json().catch(() => null)) as Ok<T> | null
  if (!res.ok || !body?.is_success) throw new Error(failText(body?.message))
  return body.data
}

function withUrls(step: StepThree): StepThree {
  return {
    ...step,
    image_cover: step.image_cover ? mediaUrl(step.image_cover) : null,
    images: (step.images || []).map((item) => ({ ...item, url: mediaUrl(item.url) })),
    videos: (step.videos || []).map((item) => ({ ...item, url: mediaUrl(item.url) })),
  }
}

export function imageFileOk(file: File) {
  return file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp"
}

export function videoFileOk(file: File) {
  return file.type === "video/mp4" || file.type === "video/quicktime" || file.type === "video/avi" || file.type === "video/x-msvideo" || /\.(mp4|mov|avi)$/i.test(file.name)
}

export async function fetchStepThree(productId: number) {
  const res = await apiFetch(`${ROOT}/step3/${productId}/`)
  return withUrls(await read<StepThree>(res))
}

export async function saveStepThree(productId: number, body: { cover: File | null; images: File[]; imageIds: number[]; videos: File[]; videoIds: number[] }) {
  const form = new FormData()
  if (body.cover) form.append("image_cover", body.cover)
  body.images.forEach((file) => form.append("new_images", file))
  body.imageIds.forEach((id) => form.append("current_image_ids", String(id)))
  body.videos.forEach((file) => form.append("new_videos", file))
  body.videoIds.forEach((id) => form.append("current_video_ids", String(id)))
  const res = await apiFetch(`${ROOT}/step3/${productId}/`, { method: "PUT", body: form })
  return withUrls(await read<StepThree>(res))
}
