"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  PackageIcon,
  RecycleIcon,
  SealCheckIcon,
  TagIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { fetchDraftLimit } from "@/lib/products"
import { cn } from "@/lib/utils"
import {
  canEditDetails,
  categoryLeaves,
  categoryOptions,
  categoryPath,
  commissionText,
  fetchCategories,
  fetchStepOne,
  findCategory,
  placeholderIds,
  saveStepOne,
  type CategoryNode,
} from "@/lib/product-step"

const STEPS = ["نوع و گروه کالا", "اطلاعات و ویژگی‌ها", "مدیا", "تنوع کالا", "شرایط کالا"]
const LEVELS = ["دسته اصلی", "زیرگروه", "دسته سوم", "دسته نهایی"]

export function ProductStepOne({ productId }: { productId: number }) {
  const [blocked, setBlocked] = useState("")
  const [tree, setTree] = useState<CategoryNode[]>([])
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [error, setError] = useState("")
  const [saved, setSaved] = useState("")
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState(0)
  const [faName, setFaName] = useState("")
  const [enName, setEnName] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [levels, setLevels] = useState([0, 0, 0, 0])
  const [subs, setSubs] = useState<number[]>([])
  const [productType, setProductType] = useState<"new" | "stock">("new")
  const [original, setOriginal] = useState(false)
  const [fieldsLocked, setFieldsLocked] = useState(false)
  const [needsReview, setNeedsReview] = useState(false)
  const editing = productId > 0
  const leaf = findCategory(tree, levels[3])
  const stockAllowed = Boolean(leaf && (leaf.is_placeholder || leaf.stock_active))
  const path = categoryPath(tree, levels[3])
  const control =
    "h-12 w-full rounded-2xl border border-input bg-muted/40 px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 disabled:cursor-default disabled:border-transparent disabled:bg-muted disabled:text-foreground disabled:opacity-100"

  useEffect(() => {
    if (editing) return
    let alive = true
    fetchDraftLimit()
      .then((res) => {
        if (alive) setBlocked(res.can_create ? "" : res.message)
      })
      .catch(() => {
        if (alive) setBlocked("")
      })
    return () => {
      alive = false
    }
  }, [editing])

  useEffect(() => {
    let alive = true
    Promise.all([fetchCategories(), editing ? fetchStepOne(productId) : Promise.resolve(null)])
      .then(([categories, step]) => {
        if (!alive) return
        setTree(categories)
        if (step) {
          const ids = categoryPath(categories, step.main_category || 0).map((node) => node.id)
          setFaName(step.fa_name || "")
          setEnName(step.en_name || "")
          setMetaTitle(step.meta_title || "")
          setMetaDescription(step.meta_description || "")
          setLevels([ids[0] || 0, ids[1] || 0, ids[2] || 0, ids[3] || 0])
          setSubs(step.sub_category || [])
          setProductType(step.product_type === "stock" ? "stock" : "new")
          setOriginal(Boolean(step.is_original))
          setFieldsLocked(!canEditDetails(step))
          setNeedsReview(Boolean(step.needs_seller_review))
          setSavedId(step.id)
        }
        setLoadError("")
      })
      .catch((err: unknown) => {
        if (alive) setLoadError(err instanceof Error ? err.message : "اطلاعات کالا دریافت نشد")
      })
      .finally(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [editing, productId])

  useEffect(() => {
    if (fieldsLocked || productType !== "stock" || stockAllowed) return
    setProductType("new")
  }, [fieldsLocked, productType, stockAllowed])

  return (
    <div className="flex w-full flex-col gap-4 pb-28 xl:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary">مرحله ۱ از ۵</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">نوع و گروه کالا</h1>
          <p className="mt-1 text-sm text-muted-foreground">{editing ? "ویرایش کالا" : "تعریف کالای جدید"}</p>
        </div>
        <Link href="/products/new" className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border bg-card px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:text-foreground">
          <CaretRightIcon className="size-4" />
          جستجو
        </Link>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">نوع و گروه کالا</p>
          <p className="text-xs font-semibold text-primary">۱ از ۵</p>
        </div>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((label, index) => (
            <span key={label} className={cn("h-1.5 flex-1 rounded-full", index === 0 ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">مرحله بعد: اطلاعات و ویژگی‌ها</p>
      </div>

      <div className="relative hidden rounded-2xl border bg-card px-6 py-5 shadow-sm lg:block">
        <div className="absolute inset-x-16 top-9 h-px bg-border" />
        <ol className="relative grid grid-cols-5">
          {STEPS.map((label, index) => (
            <li key={label} className="flex flex-col items-center gap-2 text-center">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold",
                  index === 0 ? "bg-primary text-primary-foreground ring-4 ring-primary/15" : "border bg-card text-muted-foreground"
                )}
              >
                {(index + 1).toLocaleString("fa-IR")}
              </span>
              <span className={cn("text-sm", index === 0 ? "font-semibold" : "text-muted-foreground")}>{label}</span>
            </li>
          ))}
        </ol>
      </div>

      {blocked ? (
        <p className="rounded-2xl border border-[#DD794F]/30 bg-[#DD794F]/10 px-4 py-3 text-sm leading-7 text-[#9a4e2c]">{blocked}</p>
      ) : !ready ? (
        <div className="animate-pulse rounded-2xl border bg-card p-6 shadow-sm">
          <div className="h-4 w-32 rounded-lg bg-muted" />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="h-11 rounded-xl bg-muted" />
            <div className="h-11 rounded-xl bg-muted" />
            <div className="h-11 rounded-xl bg-muted" />
            <div className="h-24 rounded-xl bg-muted" />
          </div>
        </div>
      ) : loadError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-7 text-destructive">{loadError}</p>
      ) : (
        <form
          className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]"
          onSubmit={(event) => {
            event.preventDefault()
            if (fieldsLocked || saving) return
            if (!faName.trim() || !enName.trim() || !metaTitle.trim() || !metaDescription.trim() || !levels[3]) {
              setSaved("")
              setError("لطفا همه فیلدهای الزامی را تکمیل کنید")
              return
            }
            setSaving(true)
            setError("")
            saveStepOne(savedId, {
              fa_name: faName.trim(),
              en_name: enName.trim(),
              meta_title: metaTitle.trim(),
              meta_description: metaDescription.trim(),
              main_category: levels[3],
              sub_category: subs,
              product_type: productType,
              is_original: original,
            })
              .then((step) => {
                setSavedId(step.id)
                setSaved("این مرحله ذخیره شد.")
              })
              .catch((err: unknown) => {
                setSaved("")
                setError(err instanceof Error ? err.message : "ذخیره کالا انجام نشد")
              })
              .finally(() => setSaving(false))
          }}
        >
          {editing ? (
            <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 xl:col-span-2">
              <LockSimpleIcon className="mt-0.5 size-5 shrink-0 text-primary" weight="duotone" />
              <div>
                <p className="text-sm font-semibold">
                  {fieldsLocked ? "این کالا در کاتالوگ مهراشاپ ثبت شده" : needsReview ? "دسته‌بندی را مدیریت تعیین کرده" : "گروه کالا قفل است"}
                </p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  {fieldsLocked
                    ? "نام، نوع و گروه از کاتالوگ آمده و از اینجا عوض نمی‌شود."
                    : "نام و توضیح را می‌توانید هماهنگ کنید. گروه کالا فقط با پشتیبانی عوض می‌شود."}
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-4 xl:col-start-1">
          <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TagIcon className="size-5" weight="duotone" />
              </span>
              <div>
                <h2 className="font-semibold">نام کالا</h2>
                <p className="text-xs text-muted-foreground">همان نامی که خریدار می‌بیند</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">نام فارسی <span className="text-[#DD794F]">*</span></span>
                <input className={control} value={faName} disabled={fieldsLocked} placeholder="کره بادام زمینی خانگی" onChange={(e) => setFaName(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">نام انگلیسی <span className="text-[#DD794F]">*</span></span>
                <input className={control} dir="ltr" value={enName} disabled={fieldsLocked} placeholder="Homemade Peanut Butter" onChange={(e) => setEnName(e.target.value)} />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MagnifyingGlassIcon className="size-5" weight="duotone" />
              </span>
              <div>
                <h2 className="font-semibold">دیده شدن در جستجو</h2>
                <p className="text-xs text-muted-foreground">عنوان و توضیح کوتاه برای نتیجه جستجو</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">متا تایتل <span className="text-[#DD794F]">*</span></span>
                <input className={control} value={metaTitle} disabled={fieldsLocked} placeholder="کره بادام زمینی خانگی" onChange={(e) => setMetaTitle(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">متا دیسکریپشن <span className="text-[#DD794F]">*</span></span>
                <textarea className={cn(control, "h-28 resize-none py-3")} value={metaDescription} disabled={fieldsLocked} placeholder="یک توضیح کوتاه از کالا" onChange={(e) => setMetaDescription(e.target.value)} />
              </label>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">۴</span>
              <div>
                <h2 className="font-semibold">گروه کالا <span className="text-[#DD794F]">*</span></h2>
                <p className="text-xs text-muted-foreground">از دسته اصلی تا دسته نهایی</p>
              </div>
            </div>
            {path.length ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {path.map((node, index) => (
                  <span key={node.id} className="flex items-center gap-1.5">
                    {index > 0 ? <CaretLeftIcon className="size-3 text-muted-foreground" /> : null}
                    <span className={cn("rounded-lg px-2 py-1 text-xs", index === path.length - 1 ? "bg-primary/10 font-semibold text-primary" : "bg-muted text-muted-foreground")}>
                      {node.name}
                    </span>
                  </span>
                ))}
              </div>
            ) : null}
            <div className="relative flex flex-col gap-3 lg:grid lg:grid-cols-4">
              <span className="absolute top-5 bottom-5 start-5 w-px bg-border lg:hidden" />
              {LEVELS.map((label, index) => (
                <label key={label} className="relative flex items-start gap-3 lg:flex-col lg:gap-1.5">
                  <span
                    className={cn(
                      "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold lg:hidden",
                      levels[index] ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                    )}
                  >
                    {(index + 1).toLocaleString("fa-IR")}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  <span className="relative">
                    <select
                      aria-label={label}
                      className={cn(control, "appearance-none pe-9")}
                      disabled={editing || (index > 0 && !levels[index - 1])}
                      value={levels[index] || ""}
                      onChange={(event) => {
                        const id = Number(event.target.value)
                        const picked = categoryOptions(tree, levels, index).find((node) => node.id === id)
                        if (picked?.is_placeholder) {
                          const chain = placeholderIds(tree)
                          if (chain.length === 4) setLevels(chain.map((item, cursor) => (cursor < index ? levels[cursor] || item : item)))
                          return
                        }
                        const next = [0, 0, 0, 0]
                        for (let cursor = 0; cursor < index; cursor += 1) next[cursor] = levels[cursor]
                        next[index] = id
                        setLevels(next)
                      }}
                    >
                      <option value="">انتخاب کنید</option>
                      {categoryOptions(tree, levels, index).map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.name}
                        </option>
                      ))}
                    </select>
                    <CaretDownIcon className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </span>
                  </span>
                </label>
              ))}
            </div>
            {leaf && !leaf.is_placeholder ? (
              <p className="rounded-xl bg-primary/10 px-3 py-2.5 text-sm text-primary">
                کمیسیون این دسته <span className="font-bold">{commissionText(leaf.commission)}٪</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">بر اساس دسته نهایی حساب می‌شود.</span>
              </p>
            ) : levels.some(Boolean) && !levels[3] ? (
              <p className="text-xs text-muted-foreground">کمیسیون بعد از انتخاب دسته نهایی مشخص می‌شود.</p>
            ) : null}
          </section>

          <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-4">
              <h2 className="font-semibold">گروه‌های فرعی</h2>
              <p className="mt-1 text-xs text-muted-foreground">اگر کالا در دسته‌های دیگری هم دیده می‌شود</p>
            </div>
            <span className="relative">
              <select
                aria-label="گروه‌های فرعی"
                className={cn(control, "appearance-none pe-9")}
                disabled={fieldsLocked}
                value=""
                onChange={(event) => {
                  const id = Number(event.target.value)
                  if (id && !subs.includes(id)) setSubs([...subs, id])
                }}
              >
                <option value="">افزودن گروه فرعی</option>
                {categoryLeaves(tree).map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name}
                  </option>
                ))}
              </select>
              <CaretDownIcon className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </span>
            {subs.length ? (
              <div className="flex flex-wrap gap-2">
                {subs.map((id) => (
                  <button
                    key={id}
                    type="button"
                    disabled={fieldsLocked}
                    className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs font-medium disabled:opacity-100"
                    onClick={() => setSubs(subs.filter((item) => item !== id))}
                  >
                    {findCategory(tree, id)?.name || id}
                    {fieldsLocked ? null : <span className="text-muted-foreground">×</span>}
                  </button>
                ))}
              </div>
            ) : null}
          </section>
          </div>

          <aside className={cn("flex flex-col gap-4 xl:sticky xl:top-4 xl:col-start-2", editing ? "xl:row-start-2" : "xl:row-start-1")}>
          <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <h2 className="font-semibold">نوع کالا <span className="text-[#DD794F]">*</span></h2>
            <p className="mt-1 text-xs text-muted-foreground">عنوان، اصل بودن و نو یا استوک کالا را یکتا می‌کند</p>
            <div className="mt-4 grid gap-3">
              {(
                [
                  ["new", "کالای نو", "استفاده‌نشده", PackageIcon],
                  ["stock", "کالای استوک", "دسته‌دوم", RecycleIcon],
                ] as const
              ).map(([id, title, hint, Icon]) => {
                const active = productType === id
                const off = fieldsLocked || (id === "stock" && !stockAllowed)
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={off}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-3.5 text-start transition-colors disabled:cursor-default",
                      active ? "border-primary bg-primary/10" : "bg-background hover:bg-muted",
                      off && !active && "opacity-50"
                    )}
                    onClick={() => {
                      if (id === "stock" && !stockAllowed) return
                      setProductType(id)
                    }}
                  >
                    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      <Icon className="size-5" weight="duotone" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
                    </span>
                    <CheckCircleIcon className={cn("size-5 shrink-0", active ? "text-primary" : "text-transparent")} weight="fill" />
                  </button>
                )
              })}
            </div>
            {!fieldsLocked && !levels[3] ? <p className="mt-3 text-xs text-[#DD794F]">برای استوک، اول دسته نهایی را انتخاب کنید.</p> : null}
            {!fieldsLocked && Boolean(levels[3]) && !stockAllowed ? (
              <p className="mt-3 text-xs text-[#DD794F]">فروش استوک برای این دسته فعال نیست.</p>
            ) : null}
            <label className={cn("mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5", original ? "border-primary bg-primary/10" : "bg-background", fieldsLocked && "cursor-default")}>
              <SealCheckIcon className={cn("size-6 shrink-0", original ? "text-primary" : "text-muted-foreground")} weight="duotone" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">نشان کالای اصل</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">اگر غیراصل است، بردارید</span>
              </span>
              <input type="checkbox" className="size-5 accent-primary" checked={original} disabled={fieldsLocked} onChange={(event) => setOriginal(event.target.checked)} />
            </label>
          </section>

          {error ? <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
          {saved ? <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">{saved}</p> : null}

          <div className="hidden xl:block">
            <Button type="submit" size="lg" className="h-12 w-full rounded-2xl text-base" disabled={fieldsLocked || saving}>
              {saving ? "در حال ذخیره..." : "تایید و ادامه"}
            </Button>
            <p className="mt-2 text-center text-xs leading-6 text-muted-foreground">
              {fieldsLocked ? "مشخصات کاتالوگ از اینجا عوض نمی‌شود." : "با این دکمه، همین مرحله ذخیره می‌شود."}
            </p>
          </div>
          </aside>

          <div className="fixed inset-x-3 bottom-3 z-30 xl:hidden">
            {fieldsLocked ? (
              <p className="rounded-2xl border bg-card/95 px-4 py-3 text-center text-sm shadow-lg backdrop-blur">مشخصات این کالا از کاتالوگ است</p>
            ) : (
              <Button type="submit" size="lg" className="h-12 w-full rounded-2xl text-base shadow-lg" disabled={saving}>
                {saving ? "در حال ذخیره..." : "تایید و ادامه"}
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
