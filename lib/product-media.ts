import { apiFetch } from "@/lib/auth"
import { mediaUrl } from "@/lib/orders"

const ROOT = "/dashboard/api/02/products/seller"

type Ok<T> = { message?: unknown; data: T; is_success: boolean }

export const IMAGE_LIMIT = 10
export const VIDEO_LIMIT = 3
export const IMAGE_MAX = 300 * 1024
export const IMAGE_SIDE = 700
export const VIDEO_MAX = 15 * 1024 * 1024

export type MediaNotice = { title: string; text: string }

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

async function imageSize(file: File) {
  if (typeof createImageBitmap === "function") {
    const bmp = await createImageBitmap(file)
    const size = { w: bmp.width, h: bmp.height }
    bmp.close()
    return size
  }
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error("خواندن تصویر انجام نشد"))
      el.src = url
    })
    return { w: img.naturalWidth, h: img.naturalHeight }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** null یعنی معتبر */
export async function checkProductImage(file: File): Promise<MediaNotice | null> {
  if (!imageFileOk(file)) return { title: "فرمت نادرست است", text: "فرمت عکس باید jpg یا png یا webp باشد." }
  if (file.size >= IMAGE_MAX) return { title: "حجم زیاد است", text: "حجم تصویر باید کمتر از ۳۰۰ کیلوبایت باشد." }
  try {
    const { w, h } = await imageSize(file)
    if (w !== IMAGE_SIDE || h !== IMAGE_SIDE) {
      return { title: "اندازه نادرست است", text: "اندازه تصویر باید دقیقاً ۷۰۰×۷۰۰ پیکسل باشد." }
    }
  } catch {
    return { title: "تصویر نامعتبر است", text: "فایل تصویر خوانده نشد. دوباره انتخاب کنید." }
  }
  return null
}

export function checkProductVideo(file: File): MediaNotice | null {
  if (!videoFileOk(file)) return { title: "فرمت نادرست است", text: "فرمت ویدیو باید mp4 یا mov یا avi باشد." }
  if (file.size > VIDEO_MAX) return { title: "حجم زیاد است", text: "حجم هر ویدیو باید حداکثر ۱۵ مگابایت باشد." }
  return null
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
