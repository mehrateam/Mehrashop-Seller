import Link from "next/link"
import {
  ChartBarIcon,
  GearSixIcon,
  PackageIcon,
  SquaresFourIcon,
  StorefrontIcon,
  ShoppingCartIcon,
} from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"

const groups = [
  {
    label: "نمای کلی",
    items: [
      { href: "/", label: "داشبورد", icon: SquaresFourIcon, active: true },
      { href: "#", label: "آمار و تحلیل", icon: ChartBarIcon },
    ],
  },
  {
    label: "مدیریت",
    items: [
      { href: "#", label: "محصولات", icon: PackageIcon },
      { href: "#", label: "سفارش‌ها", icon: ShoppingCartIcon },
      { href: "#", label: "فروشگاه", icon: StorefrontIcon },
    ],
  },
  {
    label: "سیستم",
    items: [{ href: "#", label: "تنظیمات", icon: GearSixIcon }],
  },
]

export default function Sidebar() {
  return (
    <aside className="sticky top-5 hidden h-[calc(100svh-2.5rem)] w-64 shrink-0 flex-col rounded-2xl border bg-card p-5 shadow-sm lg:flex">
      <div className="mb-6 flex items-center gap-3 border-b pb-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <StorefrontIcon weight="bold" className="size-5" />
        </div>
        <span className="text-base font-bold tracking-tight">پنل فروشنده</span>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      item.active && "bg-primary/10 font-semibold text-primary"
                    )}
                  >
                    <item.icon className="size-4.5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 rounded-lg bg-muted px-3 py-3 text-xs text-muted-foreground">
        <span className="size-2 rounded-full bg-primary shadow-[0_0_0_3px] shadow-primary/20" />
        سیستم فعال است
      </div>
    </aside>
  )
}
