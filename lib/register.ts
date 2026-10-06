const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.mehrashop.com"

export type SellerKind = "genuine" | "legal"

export type Signatory = { name: string; front: File | null; back: File | null }

export const COMPANY_TYPES = [
  { value: "limited_liability_company", label: "مسئولیت محدود" },
  { value: "nonpublic_company", label: "سهامی خاص" },
  { value: "public_company", label: "سهامی عام" },
  { value: "mutual_company", label: "تعاونی" },
  { value: "general_partnership", label: "تضامنی" },
  { value: "institute", label: "مؤسسه" },
  { value: "other", label: "سایر" },
]

const FIELD_LABELS: Record<string, string> = {
  username: "نام کاربری",
  phone_number: "موبایل",
  national_code: "کد ملی",
  password: "رمز عبور",
  company_name: "نام شرکت",
  national_id: "شناسه ملی",
  registration_number: "شماره ثبت",
  name_fa: "نام فروشگاه",
}

export function digits(value: string) {
  const persian = "۰۱۲۳۴۵۶۷۸۹"
  const arabic = "٠١٢٣٤٥٦٧٨٩"
  return value.replace(/[۰-۹٠-٩]/g, (char) => {
    const persianIndex = persian.indexOf(char)
    return String(persianIndex >= 0 ? persianIndex : arabic.indexOf(char))
  })
}

function numeric(value: string) {
  return digits(value).replace(/\D/g, "")
}

function validNationalCode(value: string) {
  const code = numeric(value)
  if (!/^\d{10}$/.test(code) || /^(\d)\1{9}$/.test(code)) return false
  const check = Number(code[9])
  const sum = [...code.slice(0, 9)].reduce((total, digit, index) => total + Number(digit) * (10 - index), 0)
  const rest = sum % 11
  return rest < 2 ? check === rest : check === 11 - rest
}

export function normalizePhone(value: string) {
  const raw = digits(value).replace(/[\s-]/g, "")
  if (raw.startsWith("+98")) return `0${raw.slice(3)}`
  if (raw.startsWith("98") && raw.length === 12) return `0${raw.slice(2)}`
  return raw
}

export function classifyAccount(account: string) {
  const value = account.trim()
  if (/^(?:\+98|0)?9\d{9}$/.test(digits(value).replace(/[\s-]/g, ""))) {
    return { phone: normalizePhone(value), username: "" }
  }
  if (/^\S+@\S+\.\S+$/.test(value)) return { phone: "", username: "" }
  return { phone: "", username: /^[A-Za-z][A-Za-z0-9_]{2,31}$/.test(value) ? value : "" }
}

export function bronzeError(input: { phone: string; username: string; password: string; logo: File | null; storeId: number | null }) {
  if (!input.logo && !input.storeId) return "لوگو یا عکس پروفایل را بگذارید"
  if (!/^[A-Za-z][A-Za-z0-9_]{2,31}$/.test(input.username.trim())) {
    return "نام کاربری با حرف انگلیسی شروع شود؛ مثل Sabzineh"
  }
  if (!/^09\d{9}$/.test(normalizePhone(input.phone))) return "شماره موبایل را با ۰۹ وارد کنید"
  if (input.password.length < 8) return "رمز عبور حداقل ۸ کاراکتر است"
  return ""
}

export function silverError(input: {
  kind: SellerKind
  firstName: string
  lastName: string
  nationalCode: string
  companyName: string
  companyType: string
  registrationNumber: string
  nationalId: string
  front: File | null
  back: File | null
  people: Signatory[]
}) {
  if (input.firstName.trim().length < 2 || input.lastName.trim().length < 2) return "نام و نام خانوادگی را کامل بنویسید"
  if (!input.front || !input.back) return "روی و پشت کارت ملی را بگذارید"
  if (input.kind === "genuine") {
    const code = numeric(input.nationalCode)
    if (!/^\d{10}$/.test(code)) return "کد ملی باید ۱۰ رقم باشد"
    return validNationalCode(code) ? "" : "کد ملی درست نیست"
  }
  if (input.companyName.trim().length < 2) return "نام شرکت را وارد کنید"
  if (!input.companyType) return "نوع شرکت را انتخاب کنید"
  if (!input.registrationNumber.trim()) return "شماره ثبت را وارد کنید"
  const nationalId = numeric(input.nationalId)
  if (nationalId.length === 10) {
    if (!validNationalCode(nationalId)) return "کد ملی درست نیست"
  } else if (!/^\d{11}$/.test(nationalId)) {
    return "شناسه ملی باید ۱۰ یا ۱۱ رقم باشد"
  }
  for (const person of input.people) {
    if (person.name.trim().length < 2) return "نام هر صاحب امضا را بنویسید"
    if (!person.front || !person.back) return "برای هر نفر، روی و پشت کارت ملی را بگذارید"
  }
  return ""
}

async function send(path: string, method: string, body?: BodyInit, json = false) {
  const res = await fetch(path.startsWith("http") ? path : `${API}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      "X-Requested-With": "XMLHttpRequest",
    },
    ...(body !== undefined ? { body } : {}),
  })
  const data = (await res.json().catch(() => null)) as unknown
  return { ok: res.ok, data }
}

function messageOf(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") return fallback
  const record = data as Record<string, unknown>
  if (typeof record.detail === "string") return record.detail
  if (typeof record.message === "string" && record.message && record.is_success === false) return record.message
  for (const [key, value] of Object.entries(record)) {
    const text = Array.isArray(value) ? value.map(String).join(" ") : typeof value === "string" ? value : ""
    if (!text) continue
    const label = FIELD_LABELS[key]
    return label ? `${label}: ${text}` : text
  }
  return fallback
}

function readId(data: unknown) {
  if (!data || typeof data !== "object") return null
  const id = (data as { id?: unknown }).id
  return typeof id === "number" ? id : null
}

export async function sendSellerOtp(phone: string) {
  const result = await send(
    "/dashboard/api/02/seller/otp/",
    "POST",
    JSON.stringify({ phone: normalizePhone(phone) }),
    true
  )
  const data = result.data as { is_success?: boolean; message?: string; data?: { retry_after?: number } } | null
  const retryAfter = Number(data?.data?.retry_after ?? 0)
  if (!result.ok || !data?.is_success) {
    return { ok: false as const, message: data?.message || "ارسال پیامک انجام نشد", retryAfter }
  }
  return { ok: true as const, retryAfter: retryAfter || 120 }
}

export async function checkSellerOtp(phone: string, code: string) {
  const result = await send(
    "/dashboard/api/02/seller/otp/check/",
    "POST",
    JSON.stringify({ phone: normalizePhone(phone), code: digits(code) }),
    true
  )
  const data = result.data as { is_success?: boolean; message?: string } | null
  if (!result.ok || !data?.is_success) {
    return { ok: false as const, message: data?.message || "کد تایید درست نیست" }
  }
  return { ok: true as const }
}

export async function submitBronze(input: {
  phone: string
  username: string
  password: string
  logo: File | null
  sellerId: number | null
  storeId: number | null
}) {
  let sellerId = input.sellerId
  let storeId = input.storeId
  const phone = normalizePhone(input.phone)
  const username = input.username.trim()

  if (!sellerId) {
    const seller = await send(
      "/api/oo/seller/signup/genuine/step1/",
      "POST",
      JSON.stringify({ phone_number: phone, password: input.password, username }),
      true
    )
    sellerId = readId(seller.data)
    if (!seller.ok || !sellerId) {
      return { ok: false as const, message: messageOf(seller.data, "ساخت حساب انجام نشد"), sellerId, storeId }
    }
  }

  if (!storeId) {
    if (!input.logo) return { ok: false as const, message: "لوگو یا عکس پروفایل را بگذارید", sellerId, storeId }
    const body = new FormData()
    body.append("seller", String(sellerId))
    body.append("name_fa", username)
    body.append("username", username)
    body.append("logo", input.logo)
    const store = await send("/api/oo/seller/store/register/", "POST", body)
    storeId = readId(store.data)
    if (!store.ok || !storeId) {
      return { ok: false as const, message: messageOf(store.data, "ثبت فروشگاه انجام نشد"), sellerId, storeId }
    }
  }

  return { ok: true as const, sellerId, storeId }
}

export async function submitSilver(input: {
  sellerId: number
  kind: SellerKind
  firstName: string
  lastName: string
  nationalCode: string
  companyName: string
  companyType: string
  registrationNumber: string
  nationalId: string
  front: File
  back: File
  people: { name: string; front: File; back: File }[]
}) {
  const body = new FormData()
  if (input.kind === "genuine") {
    body.append("first_name", input.firstName.trim())
    body.append("last_name", input.lastName.trim())
    body.append("national_code", numeric(input.nationalCode))
    body.append("the_picture_on_the_national_card", input.front)
    body.append("the_picture_on_the_back_of_the_national_card", input.back)
  } else {
    body.append("company_name", input.companyName.trim())
    body.append("company_type", input.companyType)
    body.append("registration_number", input.registrationNumber.trim())
    body.append("national_id", numeric(input.nationalId))
    body.append("ceo_first_name", input.firstName.trim())
    body.append("ceo_last_name", input.lastName.trim())
    for (const person of input.people) body.append("names_of_other_signatories", person.name.trim())
    body.append("signatories_card_front_images", input.front)
    body.append("signatories_card_back_images", input.back)
    for (const person of input.people) {
      body.append("signatories_card_front_images", person.front)
      body.append("signatories_card_back_images", person.back)
    }
  }

  const path =
    input.kind === "genuine"
      ? `/api/oo/seller/signup/genuine/step1/${input.sellerId}/`
      : `/api/oo/seller/signup/legal/step1/${input.sellerId}/`
  const result = await send(path, "PUT", body)
  if (!result.ok) return { ok: false as const, message: messageOf(result.data, "ارسال مدارک انجام نشد") }
  return { ok: true as const }
}
