import {
  ChatCircleIcon,
  CheckIcon,
  CreditCardIcon,
  EyeIcon,
  PackageIcon,
  PlusIcon,
  ShoppingCartIcon,
  StorefrontIcon,
  UsersIcon,
} from "@phosphor-icons/react/dist/ssr"
import RevenueChart from "@/components/dashboard/RevenueChart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const traffic = [
  { name: "ورود مستقیم", value: 48 },
  { name: "موتورهای جستجو", value: 32 },
  { name: "شبکه‌های اجتماعی", value: 14 },
  { name: "لینک ارجاعی", value: 6 },
]

const metrics = [
  { title: "بازدیدها", value: "۱۲,۴۸۰", icon: EyeIcon },
  { title: "فروش", value: "۸۴,۲۰۰,۰۰۰", icon: CreditCardIcon, suffix: "تومان" },
  { title: "سفارش‌ها", value: "۳۴۲", icon: ShoppingCartIcon },
]

const counts = [
  { title: "محصولات", value: "۱۲۸", icon: PackageIcon },
  { title: "فروشگاه", value: "۱", icon: StorefrontIcon },
  { title: "مشتریان", value: "۱,۲۴۰", icon: UsersIcon },
  { title: "نظرات", value: "۸۶", icon: ChatCircleIcon },
]

const orders = [
  { id: "#ORD-9482", customer: "سارا محمدی", amount: "۱,۲۴۰,۰۰۰", status: "تکمیل‌شده", variant: "default" as const },
  { id: "#ORD-9481", customer: "داوود کریمی", amount: "۴۸۰,۰۰۰", status: "در انتظار", variant: "secondary" as const },
  { id: "#ORD-9480", customer: "النا رضایی", amount: "۸۹۰,۰۰۰", status: "تکمیل‌شده", variant: "default" as const },
  { id: "#ORD-9479", customer: "جعفر لطفی", amount: "۱۲۰,۰۰۰", status: "لغو‌شده", variant: "destructive" as const },
]

const activities = [
  { title: "سفارش جدید ثبت شد", time: "۲ دقیقه پیش", icon: ShoppingCartIcon },
  { title: "سفارش #9482 تکمیل شد", time: "۸ دقیقه پیش", icon: CheckIcon },
  { title: "پرداخت دریافت شد", time: "۱۴ دقیقه پیش", icon: CreditCardIcon },
  { title: "محصول جدید اضافه شد", time: "۲۱ دقیقه پیش", icon: PlusIcon },
]

export default function HomePage() {
  return (
    <>
      <Card className="rounded-2xl ring-foreground/5">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">روز بخیر</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">خلاصه وضعیت امروز فروشگاه شما</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg">خروجی</Button>
            <Button size="lg">
              <PlusIcon data-icon="inline-start" />
              محصول جدید
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="rounded-2xl ring-foreground/5">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>بازدید و فروش</CardTitle>
          <div className="flex rounded-lg border bg-muted p-0.5">
            {["روز", "هفته", "ماه"].map((label, i) => (
              <button
                key={label}
                type="button"
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${i === 2 ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {metrics.map((item) => (
            <div key={item.title} className="rounded-xl border bg-muted/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">{item.title}</span>
                <div className="flex size-9 items-center justify-center rounded-lg border bg-card text-muted-foreground">
                  <item.icon className="size-4.5" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">
                {item.value}
                {item.suffix && <span className="ms-1 text-xs font-medium text-muted-foreground">{item.suffix}</span>}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {counts.map((item) => (
          <Card key={item.title} className="rounded-2xl ring-foreground/5 transition-shadow hover:shadow-md">
            <CardContent className="pt-(--card-spacing)">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">{item.title}</span>
                <div className="flex size-9 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                  <item.icon className="size-4.5" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>نمای کلی درآمد</CardTitle>
            <div className="flex rounded-lg border bg-muted p-0.5">
              {["۷روز", "۳۰روز", "۳ماه", "۱سال"].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${i === 1 ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader>
            <CardTitle>منابع ترافیک</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {traffic.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-muted-foreground">{item.value}٪</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>سفارش‌های اخیر</CardTitle>
            <Button variant="outline" size="sm">مشاهده همه</Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  <th className="px-3 py-3 text-start">سفارش</th>
                  <th className="px-3 py-3 text-start">مشتری</th>
                  <th className="px-3 py-3 text-start">مبلغ</th>
                  <th className="px-3 py-3 text-start">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-3 py-3.5 font-semibold">{order.id}</td>
                    <td className="px-3 py-3.5">{order.customer}</td>
                    <td className="px-3 py-3.5 font-semibold">{order.amount}</td>
                    <td className="px-3 py-3.5">
                      <Badge variant={order.variant}>{order.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader>
            <CardTitle>فعالیت‌های اخیر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {activities.map((item) => (
              <div key={item.title} className="flex gap-3.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
                  <item.icon className="size-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  )
}
