"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { CaretDownIcon, PackageIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { toman } from "@/lib/orders"
import {
  bulkProductActive,
  fetchProductSkus,
  groupDigits,
  nextSkuPrice,
  productImage,
  updateProductSkus,
  type ProductSkuGroup,
  type SellerProduct,
  type SkuUpdate,
} from "@/lib/products"
import { cn } from "@/lib/utils"

type Mode = "price" | "discount" | "clear"

const MODE_LABEL: Record<Mode, string> = {
  price: "تغییر قیمت",
  discount: "اعمال تخفیف",
  clear: "حذف تخفیف",
}

export function ProductBulk({ products, onDone }: { products: SellerProduct[]; onDone: (message: string) => void }) {
  const [menu, setMenu] = useState(false)
  const [mode, setMode] = useState<Mode | null>(null)
  const [rows, setRows] = useState<ProductSkuGroup[] | null>(null)
  const [checked, setChecked] = useState<number[]>([])
  const [amount, setAmount] = useState("")
  const [up, setUp] = useState(true)
  const [percent, setPercent] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const locked = products.some((item) => item.admin_deactivated || item.status === "awaiting_category")
  const ids = products.map((item) => item.id).join(",")
  const skus = rows?.flatMap((item) => item.skus) ?? []
  const allOn = skus.length > 0 && skus.every((item) => checked.includes(item.id))

  useEffect(() => {
    if (!menu) return
    function close(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest("[data-bulk-menu]")) setMenu(false)
    }
    addEventListener("mousedown", close)
    return () => removeEventListener("mousedown", close)
  }, [menu])

  useEffect(() => {
    if (!mode) return
    let alive = true
    fetchProductSkus(ids.split(",").filter(Boolean).map(Number))
      .then((next) => {
        if (!alive) return
        setRows(next)
        setChecked(next.flatMap((item) => item.skus.map((sku) => sku.id)))
        setError("")
      })
      .catch((err: unknown) => {
        if (!alive) return
        setRows([])
        setError(err instanceof Error ? err.message : "دریافت تنوع‌ها انجام نشد")
      })
    return () => {
      alive = false
    }
  }, [mode, ids])

  function open(next: Mode) {
    setMenu(false)
    setRows(null)
    setChecked([])
    setAmount("")
    setUp(true)
    setPercent(false)
    setError("")
    setMode(next)
  }

  function toggle(id: number) {
    setChecked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  function chosenSkus() {
    return skus.filter((item) => checked.includes(item.id))
  }

  function save(items: SkuUpdate[], message: string) {
    if (!items.length) {
      setError("حداقل یک تنوع را انتخاب کنید")
      return
    }
    setBusy(true)
    updateProductSkus(items)
      .then(() => {
        setMode(null)
        onDone(message)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "ثبت تغییرات انجام نشد"))
      .finally(() => setBusy(false))
  }

  function submit() {
    const picked = chosenSkus()
    if (mode === "clear") {
      save(
        picked.map((sku) => ({
          id: sku.id,
          price: Number(sku.price),
          discount_percentage: 0,
          count: sku.count,
        })),
        "تخفیف تنوع‌های انتخاب‌شده حذف شد"
      )
      return
    }
    const value = Number(amount)
    const asPercent = percent || mode === "discount"
    if (!Number.isFinite(value) || value <= 0 || (asPercent && value > 100)) {
      setError(asPercent ? "درصد را بین ۱ تا ۱۰۰ وارد کنید" : "مبلغ را وارد کنید")
      return
    }
    if (mode === "discount") {
      save(
        picked.map((sku) => ({
          id: sku.id,
          price: Number(sku.price),
          discount_percentage: value,
          count: sku.count,
        })),
        "تخفیف روی تنوع‌های انتخاب‌شده اعمال شد"
      )
      return
    }
    save(
      picked.map((sku) => ({
        id: sku.id,
        price: Math.round(nextSkuPrice(Number(sku.price), value, up, percent) * 100) / 100,
        discount_percentage: Number(sku.discount),
        count: sku.count,
      })),
      "قیمت تنوع‌های انتخاب‌شده تغییر کرد"
    )
  }

  function changeStatus(active: boolean) {
    if (busy || (active && locked)) return
    setBusy(true)
    setError("")
    bulkProductActive(products.map((item) => item.id), active)
      .then(() => onDone(active ? "کالاهای انتخاب‌شده فعال شدند" : "کالاهای انتخاب‌شده غیرفعال شدند"))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "تغییر وضعیت انجام نشد"))
      .finally(() => setBusy(false))
  }

  return (
    <>
      <div className="flex flex-col gap-2 rounded-2xl border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{products.length.toLocaleString("fa-IR")} کالا</span>
          <Button variant="outline" disabled={busy || locked} onClick={() => changeStatus(true)}>
            فعال‌سازی
          </Button>
          <Button variant="outline" className="text-destructive" disabled={busy} onClick={() => changeStatus(false)}>
            غیرفعال‌سازی
          </Button>
          <div className="relative ms-auto" data-bulk-menu>
            <Button onClick={() => setMenu((prev) => !prev)}>
              ویرایش گروهی
              <CaretDownIcon className={cn("transition-transform", menu && "rotate-180")} />
            </Button>
            {menu ? (
              <div className="absolute end-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border bg-card shadow-lg">
                {(Object.keys(MODE_LABEL) as Mode[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="block w-full px-3 py-2.5 text-start text-sm hover:bg-muted"
                    onClick={() => open(item)}
                  >
                    {MODE_LABEL[item]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {locked ? (
          <p className="text-xs leading-6 text-muted-foreground">
            کالای در انتظار دسته‌بندی یا غیرفعال‌شده توسط مدیریت قابل فعال‌سازی نیست.
          </p>
        ) : null}
        {error && !mode ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <Modal open={mode !== null} onClose={() => { if (!busy) setMode(null) }} size="lg">
        {mode ? (
          <div className="flex flex-col gap-4">
            <h2 className="ps-10 text-base font-semibold">{MODE_LABEL[mode]}</h2>
            {mode === "price" ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm leading-7 text-muted-foreground">
                  افزایش یا کاهش را برای تنوع‌های تیک‌خورده، به‌صورت درصد یا مبلغ وارد کنید. اگر مبلغ کاهش به اندازه قیمت یک تنوع یا بیشتر باشد، قیمت همان تنوع عوض نمی‌شود.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex rounded-xl border p-1">
                    {([[true, "افزایش"], [false, "کاهش"]] as const).map(([value, label]) => (
                      <button
                        key={label}
                        type="button"
                        className={cn("h-9 flex-1 rounded-lg text-sm font-medium", up === value ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                        onClick={() => setUp(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex rounded-xl border p-1">
                    {([[false, "مبلغ"], [true, "درصد"]] as const).map(([value, label]) => (
                      <button
                        key={label}
                        type="button"
                        className={cn("h-9 flex-1 rounded-lg text-sm font-medium", percent === value ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                        onClick={() => setPercent(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                {mode === "discount"
                  ? "درصد تخفیف فقط روی تنوع‌هایی که تیک دارند اعمال می‌شود."
                  : "تخفیف فقط از تنوع‌هایی که تیک دارند حذف می‌شود."}
              </p>
            )}
            {mode !== "clear" ? (
              <input
                inputMode="decimal"
                dir="ltr"
                value={mode === "price" && !percent ? groupDigits(amount) : amount}
                placeholder={mode === "discount" || percent ? "درصد" : "مبلغ به تومان"}
                className="h-11 rounded-xl border bg-background px-3 text-start text-sm outline-none focus:border-primary"
                onChange={(event) => {
                  const input = event.target
                  const map = "۰۱۲۳۴۵۶۷۸۹"
                  const plain = (text: string) =>
                    text.replace(/[۰-۹]/g, (ch) => String(map.indexOf(ch))).replace(/[^\d.]/g, "")
                  const raw = plain(input.value)
                  const before = plain(input.value.slice(0, input.selectionStart ?? 0)).length
                  setAmount(raw)
                  if (mode !== "price" || percent) return
                  const shown = groupDigits(raw)
                  let seen = 0
                  let caret = shown.length
                  for (let i = 0; i < shown.length; i++) {
                    if (shown[i] !== ",") seen += 1
                    if (seen === before) {
                      caret = i + 1
                      break
                    }
                  }
                  requestAnimationFrame(() => input.setSelectionRange(caret, caret))
                }}
              />
            ) : null}
            <div className="max-h-80 overflow-y-auto rounded-xl border">
              {rows === null ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>
              ) : rows.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">تنوعی پیدا نشد</p>
              ) : (
                <>
                  <label className="flex items-center gap-3 border-b bg-muted/40 px-3 py-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      className="tick"
                      checked={allOn}
                      onChange={() => setChecked(allOn ? [] : skus.map((item) => item.id))}
                    />
                    همه تنوع‌ها
                  </label>
                  {rows.map((product) => {
                    const image = productImage(product.image)
                    return (
                      <div key={product.id} className="border-b px-3 py-3 last:border-0">
                        <div className="flex items-center gap-3">
                          {image ? (
                            <Image src={image} alt="" width={40} height={40} className="size-10 rounded-lg object-cover" />
                          ) : (
                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                              <PackageIcon className="size-4" />
                            </div>
                          )}
                          <p className="min-w-0 truncate text-sm font-semibold">{product.title || "بدون نام"}</p>
                        </div>
                        {product.skus.length === 0 ? (
                          <p className="mt-2 text-xs text-muted-foreground">تنوعی برای این کالا ثبت نشده</p>
                        ) : (
                          product.skus.map((sku) => {
                            const price = Number(sku.price)
                            const discount = Number(sku.discount)
                            return (
                              <label key={sku.id} className="mt-2 flex items-center gap-3 text-sm">
                                <input
                                  type="checkbox"
                                  className="tick"
                                  checked={checked.includes(sku.id)}
                                  onChange={() => toggle(sku.id)}
                                />
                                <span className="min-w-0 flex-1">{sku.variety}</span>
                                <span className="shrink-0 text-end">
                                  {discount > 0 ? (
                                    <span className="block text-xs text-muted-foreground line-through">{toman(price)}</span>
                                  ) : null}
                                  <span className="font-semibold text-primary">{toman(price * (1 - discount / 100))}</span>
                                </span>
                              </label>
                            )
                          })
                        )}
                      </div>
                    )
                  })}
                </>
              )}
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button variant="outline" disabled={busy} onClick={() => setMode(null)}>
                انصراف
              </Button>
              <Button disabled={busy || rows === null} onClick={submit}>
                {busy ? "..." : MODE_LABEL[mode]}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  )
}
