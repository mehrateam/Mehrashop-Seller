"use client"

import { useState } from "react"
import { updateStore, type SellerStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function DiscountPermit({
  store,
  onChange,
  onDone,
}: {
  store: SellerStore
  onChange: (store: SellerStore) => void
  onDone: (dialog: { ok: boolean; title: string; text: string }) => void
}) {
  const [busy, setBusy] = useState(false)
  const allowed = Boolean(store.discount_permit)

  async function toggle() {
    if (busy) return
    const next = !allowed
    setBusy(true)
    const body = new FormData()
    body.append("discount_permit", next ? "true" : "false")
    try {
      onChange(await updateStore(store.id, body))
      onDone({
        ok: true,
        title: "مجوز تخفیف تغییر کرد",
        text: next
          ? "محصولات می‌توانند در فهرست تخفیف‌ها دیده شوند"
          : "محصولات در فهرست تخفیف‌ها دیده نمی‌شوند",
      })
    } catch (err: unknown) {
      onDone({
        ok: false,
        title: "تغییر انجام نشد",
        text: err instanceof Error ? err.message : "تغییر مجوز تخفیف انجام نشد",
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="rounded-2xl ring-foreground/5">
      <CardHeader>
        <CardTitle>مجوز تخفیف</CardTitle>
        <CardDescription>
          آیا به مهراشاپ اجازه می‌دهید محصولات‌تان در فهرست تخفیف‌ها نمایش داده شود؟ این تخفیف به‌صورت پیش‌فرض از کمیسیون مهراشاپ کم می‌شود و روی مبلغ دریافتی شما اثری ندارد.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={allowed}
            aria-label="مجوز تخفیف"
            disabled={busy}
            onClick={toggle}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60",
              allowed ? "bg-primary" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all",
                allowed ? "start-5" : "start-0.5"
              )}
            />
          </button>
          <span className={cn("text-sm font-semibold", allowed ? "text-primary" : "text-destructive")}>
            {busy ? "در حال ذخیره..." : allowed ? "اجازه می‌دهم" : "اجازه نمی‌دهم"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
