import { apiFetch } from "@/lib/auth"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.mehrashop.com"
const ROOT = "/dashboard/api/02/support/seller"

export const FILE_ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.zip,.rar"
const ALLOWED = new Set(FILE_ACCEPT.split(","))

export const STATUS_TABS = [
  { id: "all", label: "همه تیکت‌ها" },
  { id: "open", label: "باز" },
  { id: "in_review", label: "در حال بررسی" },
  { id: "answered", label: "پاسخ داده‌شده" },
  { id: "closed", label: "بسته‌شده" },
] as const

export const SORTS = [
  { id: "newest", label: "جدیدترین" },
  { id: "oldest", label: "قدیمی‌ترین" },
  { id: "updated", label: "آخرین بروزرسانی" },
  { id: "answered_first", label: "پاسخ‌داده‌شده‌ها اول" },
  { id: "open_first", label: "بازها اول" },
] as const

export const STATUS_CLASS: Record<string, string> = {
  open: "bg-amber-100 text-amber-950",
  in_review: "bg-amber-100 text-amber-950",
  answered: "bg-primary/15 text-primary",
  closed: "bg-muted text-muted-foreground",
}

export type SupportGroup = { id: number; name: string; description: string }

export type SupportMessage = {
  id: number
  author: "seller" | "admin"
  text: string
  attachments: { id: number; file: string | null }[]
  created_at: string
}

export type SupportTicket = {
  id: number
  title: string
  status: string
  status_label: string
  is_closed: boolean
  group: SupportGroup | null
  created_at: string
  updated_at: string
  satisfaction: { is_satisfied: boolean } | null
  messages?: SupportMessage[]
}

type Ok<T> = { message?: unknown; data: T; is_success: boolean }

export function mediaUrl(file: string | null) {
  if (!file) return ""
  if (file.startsWith("http")) return file
  return `${API}${file.startsWith("/") ? file : `/${file}`}`
}

export function fileError(files: File[]) {
  if (files.length > 5) return "حداکثر ۵ فایل مجاز است"
  for (const file of files) {
    const ext = `.${(file.name.split(".").pop() || "").toLowerCase()}`
    if (!ALLOWED.has(ext)) return `فرمت فایل مجاز نیست: ${ext}`
    if (file.size > 5 * 1024 * 1024) return "حجم هر فایل حداکثر ۵ مگابایت"
  }
  return ""
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

export async function fetchTickets(status: string, sort: string) {
  const q = new URLSearchParams()
  if (status !== "all") q.set("status", status)
  if (sort !== "newest") q.set("sort", sort)
  const qs = q.toString()
  return read<{ tickets: SupportTicket[]; counts: Record<string, number> }>(
    await apiFetch(`${ROOT}/tickets/${qs ? `?${qs}` : ""}`)
  )
}

export async function fetchTicket(id: string) {
  return read<SupportTicket>(await apiFetch(`${ROOT}/tickets/${id}/`))
}

export async function fetchGroups() {
  return read<SupportGroup[]>(await apiFetch(`${ROOT}/groups/`))
}

export async function createTicket(body: FormData) {
  return read<SupportTicket>(await apiFetch(`${ROOT}/tickets/`, { method: "POST", body }))
}

export async function replyTicket(id: string, body: FormData) {
  return read<SupportTicket>(await apiFetch(`${ROOT}/tickets/${id}/reply/`, { method: "POST", body }))
}

export async function postTicket(id: string, action: "close" | "reopen" | "satisfaction", payload?: object) {
  return read<SupportTicket>(
    await apiFetch(`${ROOT}/tickets/${id}/${action}/`, {
      method: "POST",
      headers: payload ? { "Content-Type": "application/json" } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
    })
  )
}
