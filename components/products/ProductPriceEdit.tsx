"use client"

import { useEffect, useState } from "react"
import { MinusIcon, PlusIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { toman } from "@/lib/orders"
import {
  fetchProductSkus,
  groupDigits,
  nextSkuPrice,
  updateProductSkus,
  type ProductSku,
} from "@/lib/products"
import { cn } from "@/lib/utils"

export type PriceEditMode = "price" | "stock"

type Draft = { id: number; price: number; discount: number; count: number; variety: string }

export function ProductPriceEdit({
  productId,
  title,
  mode,
  open,
  onClose,
  onDone,
}: {
  productId: number
  title: string
  mode: PriceEditMode
  open: boolean
  onClose: () => void
  onDone: (message: string) => void
}) {
  const [rows, setRows] = useState<Draft[] | null>(null)
  const [tune, setTune] = useState(0)
  const [amount, setAmount] = useState("")
  const [up, setUp] = useState(true)
  const [percent, setPercent] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const pricing = mode === "price"

  useEffect(() => {
    if (!open || !productId) return
    let alive = true
    setRows(null)
    setTune(0)
    setAmount("")
    setUp(true)
    setPercent(false)
    setError("")
    fetchProductSkus([productId])
      .then((groups) => {
        if (!alive) return
        const skus = groups[0]?.skus ?? []
        setRows(
          skus.map((sku: ProductSku) => ({
            id: sku.id,
            price: Number(sku.price) || 0,
            discount: Number(sku.discount) || 0,
            count: sku.count,
            variety: sku.variety || "بدون تنوع",
          }))
        )
      })
      .catch((err: unknown) => {
        if (!alive) return
        setRows([])
        setError(err instanceof Error ? err.message : "دریافت تنوع‌ها انجام نشد")
      })
    return () => {
      alive = false
    }
  }, [open, productId, mode])

  function patch(id: number, next: Partial<Draft>) {
    setRows((prev) => prev?.map((row) => (row.id === id ? { ...row, ...next } : row)) ?? prev)
  }

  function digits(text: string) {
    const map = "۰۱۲۳۴۵۶۷۸۹"
    return text.replace(/[۰-۹]/g, (ch) => String(map.indexOf(ch))).replace(/[^\d.]/g, "")
  }

  function applyTune(row: Draft) {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0 || (percent && value > 100)) {
      setError(percent ? "درصد را بین ۱ تا ۱۰۰ وارد کنید" : "مبلغ را وارد کنید")
      return
    }
    if (!up && !percent && value >= row.price) {
      setError("مبلغ کاهش بیشتر از قیمت فعلی است")
      return
    }
    patch(row.id, { price: Math.round(nextSkuPrice(row.price, value, up, percent) * 100) / 100 })
    setTune(0)
    setAmount("")
    setError("")
  }

  function save() {
    if (!rows?.length) {
      setError("تنوعی برای ذخیره نیست")
      return
    }
    for (const row of rows) {
      if (pricing) {
        if (row.price < 0 || row.discount < 0 || row.discount > 100) {
          setError("قیمت یا تخفیف نامعتبر است")
          return
        }
      } else if (row.count < 0) {
        setError("موجودی نامعتبر است")
        return
      }
    }
    setBusy(true)
    setError("")
    updateProductSkus(
      rows.map((row) => ({
        id: row.id,
        price: row.price,
        discount_percentage: row.discount,
        count: row.count,
      }))
    )
      .then(() => {
        onDone(pricing ? "قیمت به‌روز شد" : "موجودی به‌روز شد")
        onClose()
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "ثبت تغییرات انجام نشد"))
      .finally(() => setBusy(false))
  }

  const cell =
    "h-9 w-full rounded-lg border bg-background px-2.5 text-sm outline-none focus:border-primary"

  return (
    <Modal open={open} onClose={() => { if (!busy) onClose() }} size="lg">
      <div className="flex flex-col gap-4">
        <div className="ps-10">
          <h2 className="text-base font-semibold">{pricing ? "ویرایش قیمت" : "ویرایش موجودی"}</h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{title || "بدون نام"}</p>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <div className="max-h-[min(28rem,55vh)] overflow-auto">
            {rows === null ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>
            ) : rows.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">تنوعی پیدا نشد</p>
            ) : (
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-muted/80 text-xs font-medium text-muted-foreground backdrop-blur">
                  <tr className="border-b">
                    <th className="px-3 py-2.5 text-start font-medium">تنوع</th>
                    {pricing ? (
                      <>
                        <th className="w-36 px-3 py-2.5 text-start font-medium">قیمت</th>
                        <th className="w-24 px-3 py-2.5 text-start font-medium">تخفیف ٪</th>
                        <th className="w-32 px-3 py-2.5 text-start font-medium">نهایی</th>
                        <th className="w-44 px-3 py-2.5 text-start font-medium" />
                      </>
                    ) : (
                      <th className="w-44 px-3 py-2.5 text-start font-medium">موجودی</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-3 py-2.5 align-middle font-medium">{row.variety}</td>
                      {pricing ? (
                        <>
                          <td className="px-3 py-2.5 align-middle">
                            <input
                              dir="ltr"
                              inputMode="decimal"
                              disabled={busy}
                              className={cell}
                              value={groupDigits(String(row.price || ""))}
                              onChange={(e) => patch(row.id, { price: Number(digits(e.target.value)) || 0 })}
                            />
                          </td>
                          <td className="px-3 py-2.5 align-middle">
                            <div className="flex items-center gap-1">
                              <input
                                inputMode="numeric"
                                disabled={busy}
                                className={cn(cell, "w-16")}
                                value={row.discount || ""}
                                placeholder="۰"
                                onChange={(e) => {
                                  const next = Math.min(100, Number(digits(e.target.value)) || 0)
                                  patch(row.id, { discount: next })
                                }}
                              />
                              {row.discount > 0 ? (
                                <button
                                  type="button"
                                  disabled={busy}
                                  className="shrink-0 text-[11px] font-medium text-destructive hover:underline"
                                  onClick={() => patch(row.id, { discount: 0 })}
                                >
                                  حذف
                                </button>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 align-middle text-xs font-semibold text-primary">
                            {toman(row.price * (1 - row.discount / 100))}
                          </td>
                          <td className="px-3 py-2.5 align-middle">
                            <button
                              type="button"
                              disabled={busy}
                              className="text-xs font-medium leading-5 text-primary hover:underline"
                              onClick={() => {
                                setTune(tune === row.id ? 0 : row.id)
                                setAmount("")
                                setError("")
                              }}
                            >
                              {tune === row.id ? "بستن" : "تنظیم افزایش یا کاهش قیمت"}
                            </button>
                          </td>
                        </>
                      ) : (
                        <td className="px-3 py-2.5 align-middle">
                          <div className="flex h-9 w-36 items-center rounded-lg border bg-background">
                            <button
                              type="button"
                              disabled={busy || row.count <= 0}
                              className="flex size-9 items-center justify-center text-muted-foreground hover:text-destructive disabled:opacity-30"
                              onClick={() => patch(row.id, { count: Math.max(0, row.count - 1) })}
                            >
                              <MinusIcon className="size-3.5" weight="bold" />
                            </button>
                            <input
                              dir="ltr"
                              inputMode="numeric"
                              disabled={busy}
                              className="h-full min-w-0 flex-1 bg-transparent text-center text-sm outline-none"
                              value={row.count}
                              onChange={(e) => patch(row.id, { count: Number(digits(e.target.value)) || 0 })}
                            />
                            <button
                              type="button"
                              disabled={busy}
                              className="flex size-9 items-center justify-center text-muted-foreground hover:text-primary"
                              onClick={() => patch(row.id, { count: row.count + 1 })}
                            >
                              <PlusIcon className="size-3.5" weight="bold" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {pricing && tune && rows?.some((row) => row.id === tune) ? (
            <div className="space-y-3 border-t bg-muted/40 px-3 py-3.5">
              <p className="text-xs leading-6 text-muted-foreground">
                تنظیم افزایش یا کاهش قیمت این تنوع — با درصد یا مبلغ
              </p>
              <div className="grid gap-2 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto] sm:items-center">
                <div className="flex rounded-lg border bg-background p-0.5">
                  {([[true, "افزایش"], [false, "کاهش"]] as const).map(([value, label]) => (
                    <button
                      key={label}
                      type="button"
                      className={cn(
                        "h-9 rounded-md px-3 text-xs font-medium",
                        up === value ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => setUp(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex rounded-lg border bg-background p-0.5">
                  {([[false, "مبلغ"], [true, "درصد"]] as const).map(([value, label]) => (
                    <button
                      key={label}
                      type="button"
                      className={cn(
                        "h-9 rounded-md px-3 text-xs font-medium",
                        percent === value ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => setPercent(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <input
                  dir="ltr"
                  inputMode="decimal"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
                  placeholder={percent ? "مثلاً ۱۰" : "مثلاً ۵۰٬۰۰۰"}
                  value={!percent ? groupDigits(amount) : amount}
                  onChange={(e) => setAmount(digits(e.target.value))}
                />
                <Button
                  type="button"
                  className="h-9 px-4"
                  disabled={busy}
                  onClick={() => {
                    const row = rows.find((item) => item.id === tune)
                    if (row) applyTune(row)
                  }}
                >
                  اعمال
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={onClose}>
            انصراف
          </Button>
          <Button disabled={busy || rows === null || rows.length === 0} onClick={save}>
            {busy ? "..." : "ذخیره"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
