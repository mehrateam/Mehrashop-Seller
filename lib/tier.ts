export const TIERS = [
  { id: "bronze", label: "برنز", hint: "لوگو و نام کاربری", dot: "bg-[#c4a574]" },
  { id: "silver", label: "نقره", hint: "کارت ملی", dot: "bg-[#c5ccd4]" },
  { id: "gold", label: "طلا", hint: "پروفایل و آدرس", dot: "bg-[#e0b84a]" },
] as const

export type Tier = (typeof TIERS)[number]["id"]

export function tierAt(id?: string | null): Tier {
  return TIERS.some((item) => item.id === id) ? (id as Tier) : "bronze"
}

export function canSell(user: { tier?: string | null; gold_done?: boolean } | null | undefined) {
  return user?.tier === "gold" && Boolean(user.gold_done)
}
