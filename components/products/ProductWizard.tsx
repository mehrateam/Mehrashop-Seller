import type { ReactNode } from "react"
import Link from "next/link"
import { CaretRightIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const STEPS = ["نوع و گروه کالا", "اطلاعات و ویژگی‌ها", "مدیا", "تنوع کالا", "شرایط کالا"]

export function ProductWizard({
  step,
  productId = 0,
  title,
  subtitle,
  backHref,
  backLabel,
  nextLabel,
  children,
}: {
  step: number
  productId?: number
  title: string
  subtitle: string
  backHref: string
  backLabel: string
  nextLabel?: string
  children: ReactNode
}) {
  const current = step - 1
  const hrefs = STEPS.map((_, index) => (productId > 0 && index !== current ? `/products/new?step=${index + 1}&product=${productId}` : ""))

  return (
    <div className="flex w-full flex-col gap-4 pb-28 xl:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary">مرحله {step.toLocaleString("fa-IR")} از ۵</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Link href={backHref} className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border bg-card px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:text-foreground">
          <CaretRightIcon className="size-4" />
          {backLabel}
        </Link>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs font-semibold text-primary">{step.toLocaleString("fa-IR")} از ۵</p>
        </div>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((label, index) => {
            const bar = <span className={cn("block h-1.5 w-full rounded-full", index <= current ? "bg-primary" : "bg-muted", index < current && "opacity-50")} />
            return hrefs[index] ? (
              <Link key={label} href={hrefs[index]} aria-label={label} className="flex flex-1 py-2">
                {bar}
              </Link>
            ) : (
              <span key={label} className="flex flex-1 py-2" aria-current={index === current ? "step" : undefined}>
                {bar}
              </span>
            )
          })}
        </div>
        {nextLabel ? <p className="mt-2 text-xs text-muted-foreground">مرحله بعد: {nextLabel}</p> : null}
      </div>

      <div className="relative hidden rounded-2xl border bg-card px-6 py-5 shadow-sm lg:block">
        <div className="absolute inset-x-16 top-9 h-px bg-border" />
        <ol className="relative grid grid-cols-5">
          {STEPS.map((label, index) => {
            const body = (
              <>
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    index === current && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                    index < current && "bg-primary/15 text-primary",
                    index > current && "border bg-card text-muted-foreground",
                    hrefs[index] && "group-hover:border-primary group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  {(index + 1).toLocaleString("fa-IR")}
                </span>
                <span className={cn("text-sm", index === current ? "font-semibold" : "text-muted-foreground", hrefs[index] && "group-hover:text-foreground")}>{label}</span>
              </>
            )
            return (
              <li key={label} className="flex justify-center">
                {hrefs[index] ? (
                  <Link href={hrefs[index]} className="group flex flex-col items-center gap-2 rounded-xl text-center">
                    {body}
                  </Link>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center" aria-current={index === current ? "step" : undefined}>
                    {body}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      {children}
    </div>
  )
}
