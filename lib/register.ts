const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.mehrashop.com"

export type SellerKind = "genuine" | "legal"

export type CityOption = { id: number; name: string }
export type ProvinceOption = { id: number; name: string; city: CityOption[] }

export type RegisterDraft = {
  kind: SellerKind
  firstName: string
  lastName: string
  nationalCode: string
  companyName: string
  companyType: string
  registrationNumber: string
  nationalId: string
  ceoFirstName: string
  ceoLastName: string
  phone: string
  email: string
  sellerUsername: string
  password: string
  storeName: string
  storeUsername: string
  provinceId: string
  cityId: string
  address: string
  postalCode: string
  accepted: boolean
}

export type RegisterProgress = { sellerId: number | null; storeId: number | null }

export const COMPANY_TYPES = [
  { value: "limited_liability_company", label: "مسئولیت محدود" },
  { value: "nonpublic_company", label: "سهامی خاص" },
  { value: "public_company", label: "سهامی عام" },
  { value: "mutual_company", label: "تعاونی" },
  { value: "general_partnership", label: "تضامنی" },
  { value: "institute", label: "مؤسسه" },
  { value: "other", label: "سایر" },
]

export const CONTRACT = `این قرارداد بین شرکت مادیار مهر مانا (مهراشاپ) و فروشنده‌ای که در سامانه ثبت‌نام می‌کند بسته می‌شود.

موضوع، بستر فروش محصولات مجاز در بازارگاه مهراشاپ است. قرارداد از لحظه پذیرش تا وقتی یکی از طرفین آن را پایان ندهد معتبر است.

فروشنده فقط کالای قانونی و سازگار با مأموریت مهراشاپ عرضه می‌کند. فروش گوشت، خز و چرم طبیعی مجاز نیست. کیفیت، اصالت، قیمت شفاف و ارسال به‌موقع با فروشنده است.

مهراشاپ بستر فروش، ثبت سفارش و گزارش مالی را فراهم می‌کند. تسویه پس از کسر کارمزد همان دسته انجام می‌شود. نرخ کارمزد در پنل اعلام می‌شود.

مرجوعی طبق قوانین مهراشاپ است. مسئولیت حقوقی کالا، مجوز و برند با فروشنده است. فسخ با اطلاع قبلی ممکن است و تخلف جدی می‌تواند همکاری را متوقف کند.

ادامه استفاده از سامانه به‌معنای پذیرش تغییرات بعدی شرایط است.`

const FIELD_LABELS: Record<string, string> = {
  username: "نام کاربری",
  email: "ایمیل",
  phone_number: "موبایل",
  national_code: "کد ملی",
  shaba_number: "شبا",
  password: "رمز عبور",
  company_name: "نام شرکت",
  national_id: "شناسه ملی",
  registration_number: "شماره ثبت",
  name_fa: "نام فروشگاه",
  postal_code: "کد پستی",
  non_field_errors: "فرم",
}

export function digits(value: string) {
  const persian = "۰۱۲۳۴۵۶۷۸۹"
  const arabic = "٠١٢٣٤٥٦٧٨٩"
  return value.replace(/[۰-۹٠-٩]/g, (char) => {
    const persianIndex = persian.indexOf(char)
    return String(persianIndex >= 0 ? persianIndex : arabic.indexOf(char))
  })
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
    return { phone: normalizePhone(value), email: "", username: "" }
  }
  if (/^\S+@\S+\.\S+$/.test(value)) return { phone: "", email: value, username: "" }
  return { phone: "", email: "", username: value }
}

export function validateDraft(draft: RegisterDraft, part: "identity" | "all" = "all") {
  const phone = normalizePhone(draft.phone)
  const email = draft.email.trim()
  const storeUsername = draft.storeUsername.trim()
  const postalCode = digits(draft.postalCode).replace(/\D/g, "")

  if (draft.kind === "genuine") {
    if (draft.firstName.trim().length < 2) return "نام را وارد کنید"
    if (draft.lastName.trim().length < 2) return "نام خانوادگی را وارد کنید"
    if (!/^\d{10}$/.test(digits(draft.nationalCode))) return "کد ملی باید ۱۰ رقم باشد"
  } else {
    if (draft.companyName.trim().length < 2) return "نام شرکت را وارد کنید"
    if (!draft.companyType) return "نوع شرکت را انتخاب کنید"
    if (!draft.registrationNumber.trim()) return "شماره ثبت را وارد کنید"
    if (!/^\d{11}$/.test(digits(draft.nationalId))) return "شناسه ملی باید ۱۱ رقم باشد"
    if (draft.ceoFirstName.trim().length < 2) return "نام مدیرعامل را وارد کنید"
    if (draft.ceoLastName.trim().length < 2) return "نام خانوادگی مدیرعامل را وارد کنید"
  }

  if (!/^09\d{9}$/.test(phone)) return "شماره موبایل را با ۰۹ وارد کنید"
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return "ایمیل معتبر نیست"
  if (draft.password.length < 6) return "رمز عبور حداقل ۶ کاراکتر است"
  if (!/[A-Z]/.test(draft.password) || !/[a-z]/.test(draft.password) || !/[0-9]/.test(draft.password)) {
    return "رمز عبور باید حرف بزرگ، حرف کوچک و عدد داشته باشد"
  }
  if (part === "identity") return ""
  if (draft.storeName.trim().length < 2) return "نام فروشگاه را وارد کنید"
  if (!/^[A-Za-z][A-Za-z0-9_]{2,31}$/.test(storeUsername)) {
    return "آدرس فروشگاه با حرف انگلیسی شروع شود؛ مثل Mehrashop"
  }
  if (!draft.provinceId || !draft.cityId) return "استان و شهر را انتخاب کنید"
  if (draft.address.trim().length < 10) return "آدرس را کامل‌تر بنویسید"
  if (!/^\d{10}$/.test(postalCode)) return "کد پستی باید ۱۰ رقم باشد"
  if (!draft.accepted) return "برای ثبت‌نام، شرایط همکاری را بپذیرید"
  return ""
}

async function send(path: string, method: string, body?: unknown) {
  const res = await fetch(path.startsWith("http") ? path : `${API}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      "X-Requested-With": "XMLHttpRequest",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
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

export async function loadProvinces() {
  const { ok, data } = await send("/api/v1/city/city-list/", "GET", undefined)
  if (!ok || !data || typeof data !== "object") return [] as ProvinceOption[]
  const list = (data as { data?: ProvinceOption[] }).data
  return Array.isArray(list) ? list : []
}

export async function submitRegistration(draft: RegisterDraft, progress: RegisterProgress) {
  let sellerId = progress.sellerId
  let storeId = progress.storeId
  const phone = normalizePhone(draft.phone)
  const email = draft.email.trim()

  if (!sellerId) {
    const sellerBody =
      draft.kind === "genuine"
        ? {
            first_name: draft.firstName.trim(),
            last_name: draft.lastName.trim(),
            national_code: digits(draft.nationalCode),
            phone_number: phone,
            password: draft.password,
            ...(email ? { email } : {}),
            ...(draft.sellerUsername.trim() ? { username: draft.sellerUsername.trim() } : {}),
          }
        : {
            company_name: draft.companyName.trim(),
            company_type: draft.companyType,
            registration_number: draft.registrationNumber.trim(),
            national_id: digits(draft.nationalId),
            ceo_first_name: draft.ceoFirstName.trim(),
            ceo_last_name: draft.ceoLastName.trim(),
            names_of_other_signatories: [],
            phone_number: phone,
            password: draft.password,
            ...(email ? { email } : {}),
            ...(draft.sellerUsername.trim() ? { username: draft.sellerUsername.trim() } : {}),
          }

    const path =
      draft.kind === "genuine" ? "/api/oo/seller/signup/genuine/step1/" : "/api/oo/seller/signup/legal/step1/"
    const seller = await send(path, "POST", sellerBody)
    sellerId = readId(seller.data)
    if (!seller.ok || !sellerId) {
      return { ok: false as const, message: messageOf(seller.data, "ثبت حساب انجام نشد"), sellerId, storeId }
    }
  }

  if (!storeId) {
    const store = await send("/api/oo/seller/store/register/", "POST", {
      seller: sellerId,
      name_fa: draft.storeName.trim(),
      username: draft.storeUsername.trim(),
    })
    storeId = readId(store.data)
    if (!store.ok || !storeId) {
      return { ok: false as const, message: messageOf(store.data, "ثبت فروشگاه انجام نشد"), sellerId, storeId }
    }
  }

  const address = await send(`/api/oo/seller/store/address/register/${storeId}/`, "PUT", {
    province: Number(draft.provinceId),
    city: Number(draft.cityId),
    address: draft.address.trim(),
    postal_code: digits(draft.postalCode).replace(/\D/g, ""),
    phone_company: phone,
    x_coordination: 0,
    y_coordination: 0,
  })
  if (!address.ok) {
    return { ok: false as const, message: messageOf(address.data, "ثبت آدرس انجام نشد"), sellerId, storeId }
  }

  return { ok: true as const, sellerId, storeId }
}
