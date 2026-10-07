"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUUpLeftIcon, CheckCircleIcon, MapPinIcon, TruckIcon } from "@phosphor-icons/react"
import { ProductWizard } from "@/components/products/ProductWizard"
import { Button } from "@/components/ui/button"
import {
  fetchStepFive,
  publishText,
  saveStepFive,
  type DeliveryMethod,
  type Place,
  type Province,
} from "@/lib/product-conditions"
import { cn } from "@/lib/utils"

const control =
  "h-11 w-full rounded-2xl border border-input bg-muted/40 px-3 text-sm outline-none transition-colors focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"

export function ProductStepFive({ productId }: { productId: number }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [country, setCountry] = useState(true)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [provinceIds, setProvinceIds] = useState<number[]>([])
  const [cityIds, setCityIds] = useState<number[]>([])
  const [returnable, setReturnable] = useState(false)
  const [days, setDays] = useState(0)
  const [items, setItems] = useState<Place[]>([])
  const [itemIds, setItemIds] = useState<number[]>([])
  const [causes, setCauses] = useState<Place[]>([])
  const [causeIds, setCauseIds] = useState<number[]>([])
  const [methods, setMethods] = useState<DeliveryMethod[]>([])
  const [methodIds, setMethodIds] = useState<number[]>([])
  const cities = provinces.filter((item) => provinceIds.includes(item.id)).flatMap((item) => item.city.map((city) => ({ ...city, province: item.name })))
  const areaDone = country || provinceIds.length > 0

  const toggle = (ids: number[], id: number, set: (value: number[]) => void) => {
    set(ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id])
  }

  useEffect(() => {
    if (!productId) {
      setReady(true)
      return
    }
    let alive = true
    fetchStepFive(productId)
      .then((step) => {
        if (!alive) return
        setCountry(step.shipping_all_over_iran)
        setProvinces(step.provinces)
        setProvinceIds(step.shipping_provinces)
        setCityIds(step.shipping_cities)
        setReturnable(step.returnable)
        setDays(step.returnable_days)
        setItems(step.items)
        setItemIds(step.returnable_items)
        setCauses(step.causes)
        setCauseIds(step.returnable_causes)
        setMethods(step.methods)
        setMethodIds(step.shipping_delivery)
        setLoadError("")
      })
      .catch((err: unknown) => {
        if (alive) setLoadError(err instanceof Error ? err.message : "شرایط کالا دریافت نشد")
      })
      .finally(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [productId])

  return (
    <ProductWizard
      step={5}
      title="شرایط کالا"
      subtitle={productId ? "ارسال، مرجوعی و ثبت نهایی" : "اول مرحله‌های قبل را ثبت کنید"}
      backHref={productId ? `/products/new?step=4&product=${productId}` : "/products/new?step=1"}
      backLabel="مرحله قبل"
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
            if (saving) return
            setSaving(true)
            setError("")
            saveStepFive(productId, {
              shipping_all_over_iran: country,
              shipping_provinces: country ? [] : provinceIds,
              shipping_cities: country ? [] : cityIds,
              returnable,
              returnable_days: returnable ? days : 0,
              returnable_items: returnable ? itemIds : [],
              returnable_causes: returnable ? causeIds : [],
              shipping_delivery: methodIds,
            })
              .then((step) => router.push(`/products?notice=${encodeURIComponent(publishText(step.product_status))}`))
              .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "ثبت شرایط انجام نشد")
                setSaving(false)
              })
          }}
        >
          <div className="flex flex-col gap-4 xl:col-start-1">
            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPinIcon className="size-5" weight="duotone" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">مناطق ارسالی</h2>
                  <p className="text-xs text-muted-foreground">کل کشور یا فقط چند استان و شهر</p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    [true, "کل کشور"],
                    [false, "برخی مناطق"],
                  ] as const
                ).map(([value, label]) => (
                  <button key={label} type="button" className={cn("h-11 rounded-2xl border text-sm", country === value ? "border-primary bg-primary/10 font-medium" : "bg-background")} onClick={() => setCountry(value)}>
                    {label}
                  </button>
                ))}
              </div>
              {country ? null : (
                <div className="mt-4 grid gap-3">
                  <select
                    className={control}
                    value=""
                    onChange={(event) => {
                      const id = Number(event.target.value)
                      if (id) setProvinceIds((current) => (current.includes(id) ? current : [...current, id]))
                    }}
                  >
                    <option value="">افزودن استان</option>
                    {provinces.filter((item) => !provinceIds.includes(item.id)).map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    {provinces.filter((item) => provinceIds.includes(item.id)).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="rounded-full bg-muted px-3 py-1 text-sm"
                        onClick={() => {
                          const next = provinceIds.filter((id) => id !== item.id)
                          const allowed = new Set(provinces.filter((province) => next.includes(province.id)).flatMap((province) => province.city.map((city) => city.id)))
                          setProvinceIds(next)
                          setCityIds((current) => current.filter((id) => allowed.has(id)))
                        }}
                      >
                        {item.name} ×
                      </button>
                    ))}
                  </div>
                  <select
                    className={control}
                    value=""
                    disabled={!cities.length}
                    onChange={(event) => {
                      const id = Number(event.target.value)
                      if (id) setCityIds((current) => (current.includes(id) ? current : [...current, id]))
                    }}
                  >
                    <option value="">افزودن شهر</option>
                    {cities.filter((item) => !cityIds.includes(item.id)).map((item) => (
                      <option key={item.id} value={item.id}>{item.province} / {item.name}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    {cities.filter((item) => cityIds.includes(item.id)).map((item) => (
                      <button key={item.id} type="button" className="rounded-full bg-muted px-3 py-1 text-sm" onClick={() => setCityIds((current) => current.filter((id) => id !== item.id))}>
                        {item.name} ×
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ArrowUUpLeftIcon className="size-5" weight="duotone" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">خدمات پس از فروش</h2>
                  <p className="text-xs text-muted-foreground">مرجوعی و شرایط آن</p>
                </div>
              </div>
              <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5", returnable ? "border-primary bg-primary/10" : "bg-background")}>
                <input type="checkbox" className="size-5 accent-primary" checked={returnable} onChange={(event) => setReturnable(event.target.checked)} />
                <span className="text-sm font-semibold">امکان مرجوعی</span>
              </label>
              {returnable ? (
                <div className="mt-4 grid gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">مهلت مرجوعی (روز)</span>
                    <input className={cn(control, "text-left")} dir="ltr" inputMode="numeric" value={days || ""} onChange={(event) => setDays(Number(event.target.value.replace(/[^\d]/g, "")) || 0)} />
                  </label>
                  <select className={control} value="" onChange={(event) => { const id = Number(event.target.value); if (id) toggle(causeIds, id, setCauseIds) }}>
                    <option value="">مواردی که شامل مرجوعی می‌شوند</option>
                    {causes.filter((item) => !causeIds.includes(item.id)).map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    {causes.filter((item) => causeIds.includes(item.id)).map((item) => (
                      <button key={item.id} type="button" className="rounded-full bg-muted px-3 py-1 text-sm" onClick={() => toggle(causeIds, item.id, setCauseIds)}>{item.name} ×</button>
                    ))}
                  </div>
                  <select className={control} value="" onChange={(event) => { const id = Number(event.target.value); if (id) toggle(itemIds, id, setItemIds) }}>
                    <option value="">شرایطی که مرجوعی را لغو می‌کنند</option>
                    {items.filter((item) => !itemIds.includes(item.id)).map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    {items.filter((item) => itemIds.includes(item.id)).map((item) => (
                      <button key={item.id} type="button" className="rounded-full bg-muted px-3 py-1 text-sm" onClick={() => toggle(itemIds, item.id, setItemIds)}>{item.name} ×</button>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <TruckIcon className="size-5" weight="duotone" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">شیوه‌های ارسال</h2>
                  <p className="text-xs text-muted-foreground">هر روشی که برای این کالا فعال است</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {methods.map((item) => {
                  const on = methodIds.includes(item.id)
                  return (
                    <button key={item.id} type="button" className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm", on ? "border-primary bg-primary/10" : "bg-background")} onClick={() => toggle(methodIds, item.id, setMethodIds)}>
                      {item.icon ? <img src={item.icon} alt="" className="size-5 object-contain" /> : null}
                      {item.name}
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-4 xl:sticky xl:top-4 xl:col-start-2 xl:row-start-1">
            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="font-semibold">خلاصه این مرحله</h2>
              <p className="mt-1 text-xs text-muted-foreground">ارسال، مرجوعی و ثبت کالا</p>
              <div className="mt-4 grid gap-3">
                {(
                  [
                    ["محدوده", country ? "کل کشور" : provinceIds.length ? `${provinceIds.length.toLocaleString("fa-IR")} استان` : "انتخاب نشده", areaDone, MapPinIcon],
                    ["مرجوعی", returnable ? (days ? `${days.toLocaleString("fa-IR")} روز` : "فعال") : "ندارد", returnable, ArrowUUpLeftIcon],
                    ["ارسال", methodIds.length ? methodIds.length.toLocaleString("fa-IR") : "انتخاب نشده", methodIds.length > 0, TruckIcon],
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
            <div className="hidden xl:block">
              <Button type="submit" size="lg" className="h-12 w-full rounded-2xl text-base" disabled={saving}>
                {saving ? "در حال ثبت..." : "تایید و ادامه"}
              </Button>
              <p className="mt-2 text-center text-xs leading-6 text-muted-foreground">با تایید، کالا ثبت و به فهرست محصولات می‌رود.</p>
            </div>
          </aside>

          <div className="fixed inset-x-3 bottom-3 z-30 xl:hidden">
            <Button type="submit" size="lg" className="h-12 w-full rounded-2xl text-base shadow-lg" disabled={saving}>
              {saving ? "در حال ثبت..." : "تایید و ادامه"}
            </Button>
          </div>
        </form>
      )}
    </ProductWizard>
  )
}
