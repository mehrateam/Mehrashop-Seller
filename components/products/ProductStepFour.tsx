"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircleIcon, CoinsIcon, PackageIcon, PaletteIcon, PlusIcon, XIcon } from "@phosphor-icons/react"
import { ProductWizard } from "@/components/products/ProductWizard"
import { Button } from "@/components/ui/button"
import {
  addVarietyValue,
  fetchStepFour,
  finalPrice,
  groupedDigits,
  removeVariety,
  removeVarietyValue,
  saveSkus,
  toman,
  type AvailableVariety,
  type SkuRow,
  type StepFour,
  type VarietyGroup,
} from "@/lib/product-variety"
import { cn } from "@/lib/utils"

const control =
  "h-11 w-full rounded-2xl border border-input bg-muted/40 px-3 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"

export function ProductStepFour({ productId }: { productId: number }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [error, setError] = useState("")
  const [saved, setSaved] = useState("")
  const [saving, setSaving] = useState(false)
  const [available, setAvailable] = useState<AvailableVariety[]>([])
  const [groups, setGroups] = useState<VarietyGroup[]>([])
  const [skus, setSkus] = useState<SkuRow[]>([])
  const [complete, setComplete] = useState(true)
  const [canEdit, setCanEdit] = useState(false)
  const [required, setRequired] = useState<{ id: number; fa_name: string }[]>([])
  const [varietyId, setVarietyId] = useState(0)
  const [optionId, setOptionId] = useState(0)
  const [samePrice, setSamePrice] = useState(true)
  const [sameCount, setSameCount] = useState(true)
  const choices = available.filter((item) => !groups.some((group) => group.id === item.id))
  const picked = choices.find((item) => item.id === varietyId)
  const canAdd = groups.length < 2 && (!complete || groups.length === 0 || canEdit)
  const stock = skus.reduce((sum, sku) => sum + sku.count, 0)
  const priced = skus.length > 0 && skus.every((sku) => sku.price > 0)

  const apply = (step: StepFour) => {
    setAvailable(step.available)
    setGroups(step.grouped_variety_values)
    setSkus(step.skus)
    setComplete(Boolean(step.complete_structure))
    setCanEdit(Boolean(step.creator_can_edit))
    setRequired(step.creator_variety_info)
    setError("")
  }

  useEffect(() => {
    if (!productId) {
      setReady(true)
      return
    }
    let alive = true
    fetchStepFour(productId)
      .then((step) => {
        if (alive) apply(step)
      })
      .catch((err: unknown) => {
        if (alive) setLoadError(err instanceof Error ? err.message : "تنوع کالا دریافت نشد")
      })
      .finally(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [productId])

  const run = (task: Promise<StepFour>) => {
    setSaving(true)
    setSaved("")
    task
      .then(apply)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "ذخیره تنوع انجام نشد"))
      .finally(() => setSaving(false))
  }

  return (
    <ProductWizard
      step={4}
      title="تنوع کالا"
      subtitle={productId ? "تنوع، قیمت و موجودی" : "اول مرحله‌های قبل را ثبت کنید"}
      backHref={productId ? `/products/new?step=3&product=${productId}` : "/products/new?step=1"}
      backLabel="مرحله قبل"
      nextLabel="شرایط کالا"
    >
      {!productId ? (
        <div className="rounded-2xl border bg-card px-4 py-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">اول نوع و گروه کالا را ثبت کنید.</p>
          <Link href="/products/new?step=1" className="mt-4 inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm text-primary-foreground">
            بازگشت به مرحله اول
          </Link>
        </div>
      ) : !ready ? (
        <div className="h-48 animate-pulse rounded-2xl border bg-card shadow-sm" />
      ) : loadError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-7 text-destructive">{loadError}</p>
      ) : (
        <form
          className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]"
          onSubmit={(event) => {
            event.preventDefault()
            if (saving || !complete || skus.length === 0) return
            setSaving(true)
            setError("")
            saveSkus(productId, skus)
              .then(() => router.push(`/products/new?step=5&product=${productId}`))
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "ذخیره قیمت انجام نشد"))
              .finally(() => setSaving(false))
          }}
        >
          <div className="flex flex-col gap-4 xl:col-start-1">
            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <PaletteIcon className="size-5" weight="duotone" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">تنوع‌ها</h2>
                  <p className="text-xs text-muted-foreground">اگر کالا تنوع ندارد، مستقیم قیمت و موجودی را بنویسید</p>
                </div>
              </div>

              {canAdd && choices.length ? (
                <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <select className={control} value={varietyId || ""} onChange={(event) => { setVarietyId(Number(event.target.value)); setOptionId(0) }}>
                    <option value="">انتخاب تنوع</option>
                    {choices.map((item) => (
                      <option key={item.id} value={item.id}>{item.fa_name}</option>
                    ))}
                  </select>
                  <select className={control} value={optionId || ""} disabled={!picked} onChange={(event) => setOptionId(Number(event.target.value))}>
                    <option value="">انتخاب مقدار</option>
                    {(picked?.selectives || []).map((item) => (
                      <option key={item.id} value={item.id}>{item.fa_title}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={saving || !varietyId || !optionId}
                    className="inline-flex h-11 items-center justify-center gap-1 rounded-2xl border border-primary px-4 text-sm text-primary disabled:opacity-50"
                    onClick={() => run(addVarietyValue(productId, varietyId, optionId).then((step) => { setVarietyId(0); setOptionId(0); return step }))}
                  >
                    <PlusIcon className="size-4" />
                    افزودن تنوع
                  </button>
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                {groups.map((group) => {
                  const options = (available.find((item) => item.id === group.id)?.selectives || []).filter(
                    (item) => !group.values.some((value) => value.value === item.fa_title)
                  )
                  return (
                    <div key={group.id} className="rounded-2xl border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{group.name}</p>
                        {canEdit ? (
                          <button type="button" className="text-xs text-[#DD794F]" disabled={saving} onClick={() => run(removeVariety(productId, group.id))}>
                            حذف تنوع
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.values.map((value) => (
                          <span key={value.id} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                            {value.value}
                            <button type="button" disabled={saving} onClick={() => run(removeVarietyValue(productId, value.id))}>
                              <XIcon className="size-3.5 text-muted-foreground" />
                            </button>
                          </span>
                        ))}
                      </div>
                      {options.length ? (
                        <select
                          className={cn(control, "mt-3")}
                          defaultValue=""
                          disabled={saving}
                          onChange={(event) => {
                            const id = Number(event.target.value)
                            event.target.value = ""
                            if (id) run(addVarietyValue(productId, group.id, id))
                          }}
                        >
                          <option value="">افزودن مقدار</option>
                          {options.map((item) => (
                            <option key={item.id} value={item.id}>{item.fa_title}</option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </section>

            {!complete ? (
              <p className="rounded-2xl border border-[#DD794F]/30 bg-[#DD794F]/10 px-4 py-3 text-sm leading-7 text-[#9a4e2c]">
                این تنوع‌ها را باید داشته باشید:
                {required.map((item) => (
                  <span key={item.id} className="mt-1 block">- {item.fa_name}</span>
                ))}
              </p>
            ) : (
              <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CoinsIcon className="size-5" weight="duotone" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">قیمت و موجودی</h2>
                    <p className="text-xs text-muted-foreground">قیمت نهایی بعد از تخفیف، با ۱۰٪ مالیات حساب می‌شود</p>
                  </div>
                </div>
                {groups.length ? (
                  <div className="mb-4 flex flex-wrap gap-2">
                    <button type="button" className={cn("rounded-full border px-3 py-1.5 text-sm", samePrice ? "border-primary bg-primary/10" : "bg-background")} onClick={() => setSamePrice((value) => !value)}>
                      قیمت همه یکی باشد
                    </button>
                    <button type="button" className={cn("rounded-full border px-3 py-1.5 text-sm", sameCount ? "border-primary bg-primary/10" : "bg-background")} onClick={() => setSameCount((value) => !value)}>
                      موجودی همه یکی باشد
                    </button>
                  </div>
                ) : null}
                <div className="flex flex-col gap-3">
                  {skus.map((sku) => {
                    const title = sku.varieties.flatMap((item) => item.values.map((value) => value.value)).join(" / ") || "کالا"
                    return (
                      <div key={sku.id} className="rounded-2xl border p-3">
                        <p className="text-sm font-semibold">{title}</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          {(
                            [
                              ["count", "تعداد", sameCount],
                              ["price", "قیمت", samePrice],
                              ["discount_percentage", "تخفیف ٪", samePrice],
                            ] as const
                          ).map(([key, label, shared]) => (
                            <label key={key} className="block">
                              <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
                              <input
                                className={cn(control, key !== "discount_percentage" && "text-left")}
                                dir={key === "discount_percentage" ? undefined : "ltr"}
                                inputMode="numeric"
                                value={key === "discount_percentage" ? sku[key] || "" : groupedDigits(sku[key])}
                                onChange={(event) => {
                                  const next = Number(event.target.value.replace(/[^\d]/g, "")) || 0
                                  setSkus((current) => current.map((row) => (shared || row.id === sku.id ? { ...row, [key]: next } : row)))
                                }}
                              />
                            </label>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-primary">قیمت نهایی {toman(finalPrice(sku.price, sku.discount_percentage))}</p>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>

          <aside className="flex flex-col gap-4 xl:sticky xl:top-4 xl:col-start-2 xl:row-start-1">
            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="font-semibold">خلاصه این مرحله</h2>
              <p className="mt-1 text-xs text-muted-foreground">تنوع، قیمت و موجودی کالا</p>
              <div className="mt-4 grid gap-3">
                {(
                  [
                    ["تنوع", groups.length ? groups.length.toLocaleString("fa-IR") : "بدون تنوع", complete, PaletteIcon],
                    ["قیمت", priced ? "ثبت شده" : "نوشته نشده", priced, CoinsIcon],
                    ["موجودی", stock.toLocaleString("fa-IR"), stock > 0, PackageIcon],
                  ] as const
                ).map(([title, value, done, Icon]) => (
                  <div key={title} className={cn("flex items-center gap-3 rounded-2xl border p-3.5", done ? "border-primary bg-primary/10" : "bg-background")}>
                    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", done ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                      <Icon className="size-5" weight="duotone" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{title}</span>
                      <span className={cn("mt-0.5 block truncate text-xs", done ? "font-medium text-primary" : "text-foreground")}>{value}</span>
                    </span>
                    <CheckCircleIcon className={cn("size-5 shrink-0", done ? "text-primary" : "text-transparent")} weight="fill" />
                  </div>
                ))}
              </div>
            </section>
            {error ? <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
            {saved ? <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">{saved}</p> : null}
            <div className="hidden xl:block">
              <Button type="submit" size="lg" className="h-12 w-full rounded-2xl text-base" disabled={saving || !complete || skus.length === 0}>
                {saving ? "در حال ذخیره..." : "تایید و ادامه"}
              </Button>
              <p className="mt-2 text-center text-xs leading-6 text-muted-foreground">
                {complete ? "با تایید، مرحله شرایط کالا باز می‌شود." : "اول تنوع‌های لازم را کامل کنید."}
              </p>
            </div>
          </aside>

          <div className="fixed inset-x-3 bottom-3 z-30 xl:hidden">
            <Button type="submit" size="lg" className="h-12 w-full rounded-2xl text-base shadow-lg" disabled={saving || !complete || skus.length === 0}>
              {saving ? "در حال ذخیره..." : "تایید و ادامه"}
            </Button>
          </div>
        </form>
      )}
    </ProductWizard>
  )
}
