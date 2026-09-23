const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.mehrashop.com"

export type SellerUser = {
  access: string
  refresh: string
  first_name: string
  last_name: string
  phone_number: string
  email: string
}

type ApiResult<T> = {
  message: string
  data: T
  is_success: boolean
}

export async function login(phone_email: string, password: string): Promise<SellerUser> {
  const form = new FormData()
  form.append("phone_email", phone_email)
  form.append("password", password)

  const res = await fetch(`${API}/dashboard/api/02/seller/login/`, {
    method: "POST",
    body: form,
  })
  const json = (await res.json().catch(() => null)) as ApiResult<SellerUser> | null

  if (!res.ok || !json?.is_success) {
    throw new Error(json?.message ?? "خطا در ورود")
  }

  const user = json.data
  sessionStorage.setItem("token", user.access)
  sessionStorage.setItem("refresh", user.refresh)
  sessionStorage.setItem("user", JSON.stringify(user))
  return user
}

export const getToken = () => sessionStorage.getItem("token")
export const getUser = (): SellerUser | null =>
  JSON.parse(sessionStorage.getItem("user") || "null")
export const isAuthenticated = () => !!getToken()

export function getDisplayName(user = getUser()) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "فروشنده"
}

export async function logout() {
  const refresh = sessionStorage.getItem("refresh")
  const token = getToken()

  try {
    if (token) {
      await fetch(`${API}/dashboard/api/02/seller/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refresh }),
      })
    }
  } catch {
    // ignore network errors; local session still clears
  } finally {
    sessionStorage.clear()
  }
}
