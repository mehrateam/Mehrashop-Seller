"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircleIcon, CoinsIcon, ImageIcon, PackageIcon, PaletteIcon, PlusIcon, XIcon } from "@phosphor-icons/react"
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
  saveVarietyImages,
  toman,
  type AvailableVariety,
  type SkuRow,
  type StepFour,
  type VarietyGroup,
} from "@/lib/product-variety"
import { imageFileOk } from "@/lib/product-media"
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
  const [photoGroups, setPhotoGroups] = useState<number[]>([])
  const photosReady = useRef(false)
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
    const linked = photosReady.current ? [] : step.grouped_variety_values.filter((group) => group.values.some((value) => value.images.length)).map((group) => group.id)
    const alive = new Set(step.grouped_variety_values.map((group) => group.id))
    photosReady.current = true
    setPhotoGroups((current) => [...new Set([...current.filter((id) => alive.has(id)), ...linked])])
    setError("")
  }

  useEffect(() => {
    if (!productId) return
    photosReady.current = false
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
      productId={productId}
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
                      {photoGroups.includes(group.id) ? (
                        <div className="mt-3 flex flex-col gap-2">
                          {group.values.map((value) => (
                            <div key={value.id} className="flex flex-wrap items-center gap-2 rounded-2xl border bg-background px-3 py-2.5">
                              <span className="min-w-0 flex-1 truncate text-sm font-medium">{value.value}</span>
                              {value.images.map((image) => (
                                <button
                                  key={image.id}
                                  type="button"
                                  disabled={saving}
                                  aria-label="حذف عکس"
                                  className="group relative size-11 overflow-hidden rounded-xl border"
                                  onClick={() => run(saveVarietyImages(productId, value.id, value.images.filter((item) => item.id !== image.id).map((item) => item.id), []))}
                                >
                                  <Image src={image.url} alt="" width={44} height={44} unoptimized className="size-full object-cover" />
                                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                                    <XIcon className="size-4 text-white" />
                                  </span>
                                </button>
                              ))}
                              <label className={cn("inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3.5 text-sm text-primary", saving && "pointer-events-none opacity-50")}>
                                <ImageIcon className="size-4" weight="duotone" />
                                {value.images.length ? "عکس دیگر" : "انتخاب عکس"}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  className="sr-only"
                                  disabled={saving}
                                  onChange={(event) => {
                                    const file = event.target.files?.[0]
                                    event.target.value = ""
                                    if (!file) return
                                    if (!imageFileOk(file)) {
                                      setError("فرمت عکس صحیح نیست")
                                      return
                                    }
                                    run(saveVarietyImages(productId, value.id, value.images.map((item) => item.id), [file]))
                                  }}
                                />
                              </label>
                              <button type="button" disabled={saving} aria-label="حذف مقدار" className="flex size-9 items-center justify-center rounded-xl hover:bg-muted" onClick={() => run(removeVarietyValue(productId, value.id))}>
                                <XIcon className="size-4 text-muted-foreground" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {group.values.map((value) => (
                            <span key={value.id} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm">
                              {value.images[0] ? <Image src={value.images[0].url} alt="" width={20} height={20} unoptimized className="size-5 rounded-full object-cover" /> : null}
                              {value.value}
                              <button type="button" disabled={saving} aria-label="حذف مقدار" onClick={() => run(removeVarietyValue(productId, value.id))}>
                                <XIcon className="size-3.5 text-muted-foreground" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        className={cn("mt-3 flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-start transition-colors", photoGroups.includes(group.id) ? "border-primary/30 bg-primary/5" : "bg-muted/30 hover:bg-muted/60")}
                        onClick={() => setPhotoGroups((current) => current.includes(group.id) ? current.filter((id) => id !== group.id) : [...current, group.id])}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <ImageIcon className="size-4" weight="duotone" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                            آپلود عکس
                            <span className="rounded-full bg-background px-1.5 py-px text-[10px] font-medium text-muted-foreground">اختیاری</span>
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">اگر نگذارید، عکس اصلی کالا نشان داده می‌شود</span>
                        </span>
                        <span className="shrink-0 rounded-lg bg-background px-2 py-1 text-[11px] font-medium text-primary">
                          {photoGroups.includes(group.id) ? "بستن" : "افزودن"}
                        </span>
                      </button>
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
                    const amount = finalPrice(sku.price, sku.discount_percentage)
                    return (
                      <div key={sku.id} className="rounded-2xl border p-3 sm:p-4">
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
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-primary/5 px-3.5 py-3">
                          <span className="text-sm text-muted-foreground">قیمت نهایی</span>
                          <span className={cn("text-xl font-bold leading-none tracking-tight tabular-nums", amount ? "text-primary" : "text-muted-foreground")}>
                            {amount ? toman(amount) : "—"}
                          </span>
                        </div>
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
                {complete ? "عکس تنوع اختیاری است. با تایید، مرحله بعد باز می‌شود." : "اول تنوع‌های لازم را کامل کنید."}
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
