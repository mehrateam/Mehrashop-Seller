import {
  GearSixIcon,
  HeadsetIcon,
  PackageIcon,
  SquaresFourIcon,
  StorefrontIcon,
  ShoppingCartIcon,
  type Icon,
} from "@phosphor-icons/react"

export type PanelNavItem = {
  href: string
  label: string
  icon: Icon
}

export const panelNavGroups: { label: string; items: PanelNavItem[] }[] = [
  {
    label: "نمای کلی",
    items: [
      { href: "/", label: "داشبورد", icon: SquaresFourIcon },
    ],
  },
  {
    label: "مدیریت",
    items: [
      { href: "#", label: "محصولات", icon: PackageIcon },
      { href: "/orders", label: "سفارش‌ها", icon: ShoppingCartIcon },
      { href: "/support", label: "پشتیبانی", icon: HeadsetIcon },
      { href: "/store", label: "فروشگاه", icon: StorefrontIcon },
    ],
  },
  {
    label: "سیستم",
    items: [
      { href: "/store/edit", label: "تنظیمات", icon: GearSixIcon },
    ],
  },
]

export function isPanelNavActive(pathname: string, href: string) {
  if (href === "#") return false
  if (href === "/") return pathname === "/"
  if (href === "/store") return pathname === "/store"
  return pathname === href || pathname.startsWith(`${href}/`)
}
