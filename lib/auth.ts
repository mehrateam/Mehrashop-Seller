const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.mehrashop.com"
const USER_KEY = "seller_user"
const listeners = new Set<() => void>()

export type SellerUser = {
  id?: number
  first_name: string
  last_name: string
  phone_number: string
  email: string
  profile_image: string
  store_username: string
  username?: string
  is_legal?: boolean
  is_confirmed?: boolean
  tier?: "bronze" | "silver" | "gold"
  bronze_done?: boolean
  gold_done?: boolean
  docs_sent?: boolean
}

type ApiOk<T> = { message: string; data: T; is_success: boolean }

function toUrl(path: string) {
  return path.startsWith("http") ? path : `${API}${path}`
}

async function req(path: string, init: RequestInit = {}) {
  return fetch(toUrl(path), {
    ...init,
    credentials: "include",
    headers: { "X-Requested-With": "XMLHttpRequest", ...init.headers },
  })
}

async function json<T>(res: Response) {
  return (await res.json().catch(() => null)) as ApiOk<T> | null
}

let snapshotRaw: string | null = null
let snapshotUser: SellerUser | null = null

function cacheUser(user: SellerUser | null) {
  if (user) {
    snapshotRaw = JSON.stringify(user)
    snapshotUser = user
    sessionStorage.setItem(USER_KEY, snapshotRaw)
  } else {
    snapshotRaw = null
    snapshotUser = null
    sessionStorage.removeItem(USER_KEY)
  }
  listeners.forEach((listener) => listener())
}

export function subscribeUser(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getUser(): SellerUser | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    if (raw === snapshotRaw) return snapshotUser
    snapshotRaw = raw
    snapshotUser = raw ? (JSON.parse(raw) as SellerUser) : null
    return snapshotUser
  } catch {
    return snapshotUser
  }
}

export function getDisplayName(user = getUser()) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "فروشنده"
}

/** Cookie JWT — tokens never touch JS. Auto-refresh on 401. */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await req(path, init)
  if (res.status !== 401) return res

  const refreshed = await req("/dashboard/api/02/seller/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  })
  return refreshed.ok ? req(path, init) : res
}

export async function sellerExists(phone_email: string) {
  const body = new FormData()
  body.append("phone_email", phone_email)

  const res = await req("/dashboard/api/02/seller/lookup/", { method: "POST", body })
  const data = await json<{ exists: boolean }>(res)
  if (!res.ok || !data?.is_success) throw new Error(data?.message ?? "خطا در بررسی حساب")
  return Boolean(data.data?.exists)
}

export async function login(phone_email: string, password: string) {
  const body = new FormData()
  body.append("phone_email", phone_email)
  body.append("password", password)

  const res = await req("/dashboard/api/02/seller/login/", { method: "POST", body })
  const data = await json<SellerUser>(res)
  if (!res.ok || !data?.is_success) throw new Error(data?.message ?? "خطا در ورود")

  cacheUser(data.data)
  return data.data
}

export async function ensureSession() {
  const res = await apiFetch("/dashboard/api/02/seller/me/")
  const data = await json<SellerUser>(res)
  if (res.ok && data?.is_success) {
    cacheUser(data.data)
    return true
  }
  cacheUser(null)
  return false
}

export async function changePassword(password: string, newPassword: string, confirmPassword: string) {
  const res = await apiFetch("/dashboard/api/02/seller/password/", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      password,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  })
  const data = await json<null>(res)
  if (!res.ok || !data?.is_success) throw new Error(data?.message ?? "تغییر رمز انجام نشد")
}

export async function logout() {
  try {
    await apiFetch("/dashboard/api/02/seller/logout/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
  } finally {
    cacheUser(null)
  }
}
