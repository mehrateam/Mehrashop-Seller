"use client"

import { ArrowClockwiseIcon, CloudSlashIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export function ServerDown({ busy, onRetry }: { busy?: boolean; onRetry: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background px-5">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-card text-primary shadow-[0_10px_30px_rgba(23,26,20,0.06)]">
          <CloudSlashIcon className="size-8" weight="duotone" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">سرور مهراشاپ در دسترس نیست</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            ارتباط لحظه‌ای قطع شده. فروشگاه شما سر جایش است؛ کمی صبر کنید و دوباره تلاش کنید، یا صفحه را تازه‌سازی کنید.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button
            type="button"
            disabled={busy}
            onClick={onRetry}
            className="h-11 rounded-xl text-sm font-semibold"
          >
            <ArrowClockwiseIcon className={busy ? "animate-spin" : undefined} />
            {busy ? "در حال بررسی..." : "تلاش دوباره"}
          </Button>
          <button
            type="button"
            onClick={() => location.reload()}
            className="h-10 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            تازه‌سازی صفحه
          </button>
        </div>
      </div>
    </div>
  )
}
