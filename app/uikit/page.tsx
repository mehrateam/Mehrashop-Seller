import { BellIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"
import RevenueChart from "@/components/dashboard/RevenueChart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "کیت رابط کاربری — مهراشاپ فروشنده",
}

const sections = [
  { id: "texts", label: "متن‌ها" },
  { id: "colors", label: "رنگ‌ها" },
  { id: "buttons", label: "دکمه‌ها" },
  { id: "badges", label: "نشان‌ها" },
  { id: "cards", label: "کارت‌ها" },
  { id: "charts", label: "نمودارها" },
]

const colors = [
  { name: "اصلی", value: "#80AD01", className: "bg-primary" },
  { name: "پس‌زمینه", value: "#F7F8F5", className: "bg-background border" },
  { name: "سطح", value: "#FFFFFF", className: "bg-card border" },
  { name: "حاشیه", value: "#E7E9E2", className: "bg-border" },
  { name: "متن اصلی", value: "#171A14", className: "bg-foreground" },
  { name: "متن فرعی", value: "#6F7568", className: "bg-muted-foreground" },
  { name: "مخرب", value: "#DC2626", className: "bg-destructive" },
  { name: "نمودار", value: "chart-1", className: "bg-chart-1" },
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
    <section id={id} className="scroll-mt-6 space-y-4">
      <div className="flex items-end justify-between gap-3 border-b pb-3">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <span className="text-xs font-medium text-muted-foreground">{hint}</span>
      </div>
      {children}
    </section>
  )
}

export default function UiKitPage() {
  return (
    <div className="space-y-8">
      <Card className="rounded-2xl ring-foreground/5">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">کیت رابط کاربری</CardTitle>
            <CardDescription className="mt-1">
              کاتالوگ کامپوننت‌های shadcn این پروژه
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold">shadcn</span>
            <span className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold">راست‌چین</span>
            <span className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold">Next.js</span>
          </div>
        </CardHeader>
      </Card>

      <nav
        aria-label="بخش‌های کیت"
        className="flex flex-wrap gap-2 rounded-2xl border bg-card p-3 shadow-sm"
      >
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
              <p className="text-sm text-foreground">خلاصه وضعیت امروز فروشگاه شما</p>
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

      <Section id="cards" title="کارت‌ها" hint="Card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-2xl ring-foreground/5">
            <CardHeader>
              <CardTitle>عنوان کارت</CardTitle>
              <CardDescription>توضیح کوتاه برای کارت نمونه</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">محتوای کارت با فاصله استاندارد shadcn</p>
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

      <Section id="charts" title="نمودارها" hint="Chart">
        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader>
            <CardTitle>نمای کلی درآمد</CardTitle>
            <CardDescription>Area Chart رسمی shadcn / Recharts</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
      </Section>
    </div>
  )
}
