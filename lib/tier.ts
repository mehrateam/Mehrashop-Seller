export const TIERS = [
  { id: "bronze", label: "برنز", hint: "ثبت‌نام", dot: "bg-[#c4a574]" },
  { id: "silver", label: "نقره", hint: "اولین محصول", dot: "bg-[#c5ccd4]" },
  { id: "gold", label: "طلا", hint: "۱۰ محصول", dot: "bg-[#e0b84a]" },
] as const

export type Tier = (typeof TIERS)[number]["id"]

export function tierAt(id?: string | null): Tier {
  return TIERS.some((item) => item.id === id) ? (id as Tier) : "bronze"
}

export function canSell(user: { id?: number } | null | undefined) {
  return Boolean(user)
}
