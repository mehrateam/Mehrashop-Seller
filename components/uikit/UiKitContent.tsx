"use client"

import { useState } from "react"
import {
  BellIcon,
  CheckIcon,
  CreditCardIcon,
  PlusIcon,
  ShoppingCartIcon,
  StorefrontIcon,
} from "@phosphor-icons/react"
import { UserProfile } from "@/components/layout/UserProfile"
import RevenueChart from "@/components/dashboard/RevenueChart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"

const sections = [
  { id: "texts", label: "متن‌ها" },
  { id: "colors", label: "رنگ‌ها" },
  { id: "buttons", label: "دکمه‌ها" },
  { id: "badges", label: "نشان‌ها" },
  { id: "avatars", label: "آواتار" },
  { id: "account-menu", label: "منوی حساب" },
  { id: "inputs", label: "ورودی" },
  { id: "login", label: "فرم لاگین" },
  { id: "cards", label: "کارت‌ها" },
  { id: "metrics", label: "شاخص‌ها" },
  { id: "charts", label: "نمودارها" },
  { id: "table", label: "جدول" },
  { id: "timeline", label: "تایم‌لاین" },
  { id: "modal", label: "مودال" },
  { id: "radius", label: "انحنا" },
]

const colors = [
  { name: "اصلی", value: "#80AD01", className: "bg-primary" },
  { name: "پس‌زمینه", value: "#F7F8F5", className: "bg-background border" },
  { name: "سطح", value: "#FFFFFF", className: "bg-card border" },
  { name: "حاشیه", value: "#E7E9E2", className: "bg-border" },
  { name: "متن اصلی", value: "#171A14", className: "bg-foreground" },
  { name: "متن فرعی", value: "#6F7568", className: "bg-muted-foreground" },
  { name: "مخرب", value: "#DC2626", className: "bg-destructive" },
  { name: "موفق", value: "#537000", className: "bg-[#537000]" },
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
]

function Section({
  id,
  title,
  hint,
  children,
}: {
  id: string
  title: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="flex items-end justify-between gap-3 border-b pb-3">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <span className="text-xs font-medium text-muted-foreground">{hint}</span>
      </div>
      {children}
    </section>
  )
}

export function UiKitContent() {
  const [modal, setModal] = useState<"sm" | "md" | "lg" | "welcome" | null>(null)
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="space-y-8">
      <Card className="rounded-2xl ring-foreground/5">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">کیت رابط کاربری</CardTitle>
            <CardDescription className="mt-1">
              کاتالوگ کامل کامپوننت‌های پنل فروشنده
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold">مشترک</span>
            <span className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold">راست‌چین</span>
            <span className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold">Next.js</span>
          </div>
        </CardHeader>
      </Card>

      <nav
        aria-label="بخش‌های کیت"
        className="sticky top-5 z-40 flex flex-wrap gap-2 rounded-2xl border bg-card p-3 shadow-sm"
      >
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <Section id="texts" title="متن‌ها" hint="تایپوگرافی">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-2xl ring-foreground/5">
            <CardContent className="space-y-2 pt-(--card-spacing)">
              <p className="text-xs font-semibold text-muted-foreground">عنوان بزرگ</p>
              <p className="text-2xl font-bold tracking-tight">فروشگاه مهراشاپ</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl ring-foreground/5">
            <CardContent className="space-y-2 pt-(--card-spacing)">
              <p className="text-xs font-semibold text-muted-foreground">متن بدنه</p>
              <p className="text-sm">خلاصه وضعیت امروز فروشگاه شما</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl ring-foreground/5">
            <CardContent className="space-y-2 pt-(--card-spacing)">
              <p className="text-xs font-semibold text-muted-foreground">متن کم‌رنگ</p>
              <p className="text-sm text-muted-foreground">مدیر فروشگاه · پنل فروشنده</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section id="colors" title="رنگ‌ها" hint="توکن‌ها">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {colors.map((c) => (
            <Card key={c.name} className="rounded-2xl ring-foreground/5">
              <CardContent className="space-y-3 pt-(--card-spacing)">
                <div className={`h-14 rounded-xl ${c.className}`} />
                <div>
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {c.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="buttons" title="دکمه‌ها" hint="Button">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-2xl ring-foreground/5">
            <CardHeader>
              <CardTitle className="text-sm">Variants</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button>اصلی</Button>
              <Button variant="secondary">ثانویه</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">مخرب</Button>
              <Button variant="link">لینک</Button>
            </CardContent>
          </Card>
          <Card className="rounded-2xl ring-foreground/5">
            <CardHeader>
              <CardTitle className="text-sm">Sizes / Icon</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Button size="xs">XS</Button>
              <Button size="sm">SM</Button>
              <Button size="default">Default</Button>
              <Button size="lg">
                <PlusIcon data-icon="inline-start" />
                LG
              </Button>
              <Button variant="outline" size="icon" className="relative size-9">
                <BellIcon />
                <span className="absolute top-1.5 end-1.5 size-1.5 rounded-full bg-primary" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section id="badges" title="نشان‌ها" hint="Badge">
        <Card className="rounded-2xl ring-foreground/5">
          <CardContent className="flex flex-wrap gap-2 pt-(--card-spacing)">
            <Badge>تکمیل‌شده</Badge>
            <Badge variant="secondary">در انتظار</Badge>
            <Badge variant="outline">پیش‌فرض</Badge>
            <Badge variant="destructive">لغو‌شده</Badge>
            <Badge variant="ghost">Ghost</Badge>
          </CardContent>
        </Card>
      </Section>

      <Section id="avatars" title="آواتار" hint="Avatar">
        <Card className="rounded-2xl ring-foreground/5">
          <CardContent className="flex flex-wrap items-center gap-4 pt-(--card-spacing)">
            {["ف", "س", "م", "ا"].map((ch) => (
              <div
                key={ch}
                className="flex size-11 items-center justify-center rounded-xl bg-[#2d3128] text-sm font-semibold text-white"
              >
                {ch}
              </div>
            ))}
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#2d3128] text-sm font-semibold text-white shadow-[0_0_0_3px_rgba(128,173,1,0.1)]">
              ف
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section id="account-menu" title="منوی حساب" hint="UserProfile">
        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader>
            <CardTitle className="text-sm">پروفایل هدر</CardTitle>
            <CardDescription>همان منوی داشبورد — کلیک کنید</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-start">
            <UserProfile />
          </CardContent>
        </Card>
      </Section>

      <Section id="inputs" title="ورودی" hint="Input / Label">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-2xl ring-foreground/5">
            <CardContent className="flex flex-col gap-4 pt-(--card-spacing)">
              <div className="flex flex-col gap-2">
                <Label htmlFor="kit-phone">شماره موبایل</Label>
                <Input id="kit-phone" placeholder="09xx…" className="h-11 rounded-xl" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="kit-email">ایمیل</Label>
                <Input id="kit-email" type="email" placeholder="you@email.com" className="h-11 rounded-xl" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl ring-foreground/5">
            <CardContent className="flex flex-col gap-4 pt-(--card-spacing)">
              <div className="flex flex-col gap-2">
                <Label htmlFor="kit-pass">رمز عبور</Label>
                <Input id="kit-pass" type="password" placeholder="••••••••" className="h-11 rounded-xl" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="kit-search">جستجو</Label>
                <Input id="kit-search" placeholder="جستجو در محصولات..." className="h-11 rounded-xl bg-muted" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section id="login" title="فرم لاگین" hint="Login">
        <div className="flex justify-center rounded-2xl border bg-muted/40 p-6 sm:p-10">
          <form
            className="w-full max-w-[420px] rounded-[20px] border border-border bg-card px-8 py-9 shadow-[0_8px_30px_rgba(20,30,10,0.04)]"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="mb-7 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
                <StorefrontIcon weight="bold" className="size-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">مهراشاپ</span>
            </div>
            <div className="mb-7">
              <h3 className="text-[22px] leading-tight font-bold tracking-tight">ورود به پنل فروشنده</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                شماره موبایل یا ایمیل و رمز عبور خود را وارد کنید.
              </p>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="demo-phone" className="text-[13px] font-semibold text-muted-foreground">
                  شماره موبایل یا ایمیل
                </Label>
                <Input
                  id="demo-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xx… یا you@email.com"
                  className="h-12 rounded-xl border-border bg-muted px-3.5 text-sm font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="demo-pass" className="text-[13px] font-semibold text-muted-foreground">
                  رمز عبور
                </Label>
                <Input
                  id="demo-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-border bg-muted px-3.5 text-sm font-medium"
                />
              </div>
              <Button type="submit" className="mt-1 h-12 w-full rounded-xl text-sm font-semibold shadow-none">
                ورود
              </Button>
            </div>
          </form>
        </div>
      </Section>

      <Section id="cards" title="کارت‌ها" hint="Card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-2xl ring-foreground/5">
            <CardHeader>
              <CardTitle>عنوان کارت</CardTitle>
              <CardDescription>توضیح کوتاه برای کارت نمونه</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">محتوای کارت با فاصله استاندارد</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl ring-foreground/5" size="sm">
            <CardHeader>
              <CardTitle>کارت کوچک</CardTitle>
              <CardDescription>size=&quot;sm&quot;</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">نسخه فشرده‌تر کارت</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section id="metrics" title="شاخص‌ها" hint="Metrics">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "بازدیدها", value: "۱۲,۴۸۰" },
            { title: "فروش", value: "۸۴,۲۰۰,۰۰۰" },
            { title: "سفارش‌ها", value: "۳۴۲" },
          ].map((item) => (
            <Card key={item.title} className="rounded-2xl ring-foreground/5">
              <CardContent className="pt-(--card-spacing)">
                <p className="mb-2 text-sm font-semibold text-muted-foreground">{item.title}</p>
                <p className="text-2xl font-bold tracking-tight">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="charts" title="نمودارها" hint="Chart">
        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader>
            <CardTitle>نمای کلی درآمد</CardTitle>
            <CardDescription>Area Chart</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
      </Section>

      <Section id="table" title="جدول" hint="Table">
        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader>
            <CardTitle>سفارش‌های اخیر</CardTitle>
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
      </Section>

      <Section id="timeline" title="تایم‌لاین" hint="Activity">
        <Card className="rounded-2xl ring-foreground/5">
          <CardContent className="space-y-5 pt-(--card-spacing)">
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
      </Section>

      <Section id="modal" title="مودال" hint="Modal">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-2xl ring-foreground/5">
            <CardHeader>
              <CardTitle className="text-sm">اندازه‌ها</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setModal("sm")}>
                SM
              </Button>
              <Button variant="outline" onClick={() => setModal("md")}>
                MD
              </Button>
              <Button variant="outline" onClick={() => setModal("lg")}>
                LG
              </Button>
              <Button onClick={() => setModal("welcome")}>خوش‌آمد</Button>
            </CardContent>
          </Card>
          <Card className="rounded-2xl ring-foreground/5">
            <CardHeader>
              <CardTitle className="text-sm">استفاده</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="block rounded-xl bg-muted p-3 text-xs leading-relaxed" dir="ltr">
                {"<Modal open={open} onClose={...} size=\"md\">...</Modal>"}
              </code>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section id="radius" title="انحنا" hint="Radius">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "دکمه", r: "rounded-xl", px: "12px" },
            { label: "کارت", r: "rounded-2xl", px: "16px" },
            { label: "کانتینر", r: "rounded-[20px]", px: "20px" },
            { label: "نشان", r: "rounded-full", px: "999px" },
          ].map((item) => (
            <Card key={item.label} className="rounded-2xl ring-foreground/5">
              <CardContent className="space-y-3 pt-(--card-spacing)">
                <div className={`h-14 border-2 border-dashed border-primary/40 bg-primary/10 ${item.r}`} />
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {item.px}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Modal open={modal === "sm"} onClose={() => setModal(null)} size="sm">
        <h3 className="mb-2 text-lg font-bold">Modal کوچک</h3>
        <p className="text-sm text-muted-foreground">برای پیام‌های کوتاه و تایید.</p>
      </Modal>
      <Modal open={modal === "md"} onClose={() => setModal(null)} size="md">
        <h3 className="mb-2 text-lg font-bold">Modal متوسط</h3>
        <p className="text-sm text-muted-foreground">محتوا را با children وارد می‌کنید.</p>
      </Modal>
      <Modal open={modal === "lg"} onClose={() => setModal(null)} size="lg">
        <h3 className="mb-2 text-lg font-bold">Modal بزرگ</h3>
        <p className="text-sm text-muted-foreground">مناسب فرم‌ها، جدول یا تنظیمات پیشرفته.</p>
      </Modal>
      <Modal open={modal === "welcome"} onClose={() => setModal(null)} size="sm">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <div className="grid size-11 place-items-center rounded-full bg-primary/12 text-[#537000]">
            <CheckIcon weight="bold" className="size-5" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">خوش آمدید</h3>
          <p className="mb-1 text-sm text-muted-foreground">ورود شما با موفقیت انجام شد.</p>
          <Button type="button" onClick={() => setModal(null)} className="mt-1 min-w-[140px] rounded-xl">
            متوجه شدم
          </Button>
        </div>
      </Modal>
    </div>
  )
}
