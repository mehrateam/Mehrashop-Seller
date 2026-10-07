"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArticleIcon,
  CaretDownIcon,
  CheckCircleIcon,
  ClockIcon,
  LeafIcon,
  SlidersHorizontalIcon,
  LightbulbIcon,
  PencilSimpleIcon,
  PlusIcon,
  SketchLogoIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react"
import { ProductWizard } from "@/components/products/ProductWizard"
import { Button } from "@/components/ui/button"
import {
  attributePayload,
  canEditDetails,
  draftsFrom,
  fetchStepTwo,
  plainText,
  saveStepTwo,
  type AttrDraft,
  type StepTwoAttribute,
  type StepTwoNamed,
} from "@/lib/product-step"
import { cn } from "@/lib/utils"

const FREE_AFTER = 3

const control =
  "h-12 w-full rounded-2xl border border-input bg-muted/40 px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 disabled:cursor-default disabled:border-transparent disabled:bg-muted disabled:text-foreground disabled:opacity-100"

export function ProductStepTwo({ productId }: { productId: number }) {
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [error, setError] = useState("")
  const [saved, setSaved] = useState("")
  const [saving, setSaving] = useState(false)
  const [editable, setEditable] = useState(true)
  const [review, setReview] = useState(false)
  const [productType, setProductType] = useState<"new" | "stock">("new")
  const [attributes, setAttributes] = useState<StepTwoAttribute[]>([])
  const [brands, setBrands] = useState<StepTwoNamed[]>([])
  const [natures, setNatures] = useState<StepTwoNamed[]>([])
  const [drafts, setDrafts] = useState<Record<number, AttrDraft>>({})
  const [brand, setBrand] = useState(0)
  const [description, setDescription] = useState("")
  const [picked, setPicked] = useState<number[]>([])
  const [tips, setTips] = useState<string[]>([])
  const [defects, setDefects] = useState<string[]>([])
  const [age, setAge] = useState("")
  const [tipDraft, setTipDraft] = useState("")
  const [defectDraft, setDefectDraft] = useState("")
  const stock = productType === "stock"
  const brandName = brands.find((item) => item.id === brand)?.fa_name || ""
  const filledRows = attributePayload(attributes, drafts)
  const filled = filledRows.length
  const filledIds = new Set(filledRows.map((row) => row.attribute))
  const need = attributes.length > FREE_AFTER ? FREE_AFTER + 1 : attributes.length
  const restOptional = attributes.length > FREE_AFTER && filled > FREE_AFTER
  const featureLabel = !attributes.length
    ? "نیازی نیست"
    : attributes.length > FREE_AFTER
      ? restOptional
        ? "بقیه اختیاری"
        : `${filled.toLocaleString("fa-IR")} از ${need.toLocaleString("fa-IR")}`
      : `${filled.toLocaleString("fa-IR")} از ${attributes.length.toLocaleString("fa-IR")}`
  const summary = [
    ["برند", brandName || "انتخاب نشده", Boolean(brandName), SketchLogoIcon],
    ["ویژگی", featureLabel, !attributes.length || filled > 0, SlidersHorizontalIcon],
    ["ماهیت", natures.length ? (picked.length ? picked.length.toLocaleString("fa-IR") : "انتخاب نشده") : "نیازی نیست", !natures.length || picked.length > 0, LeafIcon],
    ["نکته مهم", tips.length ? tips.length.toLocaleString("fa-IR") : "نوشته نشده", tips.length > 0, LightbulbIcon],
    ...(stock ? [["عمر کالا", age.trim() || "نوشته نشده", Boolean(age.trim()), ClockIcon] as const] : []),
  ] as const

  useEffect(() => {
    if (!productId) {
      setReady(true)
      return
    }
    let alive = true
    fetchStepTwo(productId)
      .then((step) => {
        if (!alive) return
        setAttributes(step.available_attributes || [])
        setBrands(step.available_brands || [])
        setNatures(step.available_natures || [])
        setDrafts(draftsFrom(step))
        setBrand(Number(step.brand || 0))
        setDescription(step.full_description || "")
        setPicked(step.nature || [])
        setTips(step.important_tips || [])
        setDefects(step.product_defects || [])
        setAge(step.product_age || "")
        setProductType(step.product_type === "stock" ? "stock" : "new")
        setEditable(Boolean(step.editable))
        setReview(canEditDetails(step))
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
  }, [productId])

  return (
    <ProductWizard
      step={2}
      title="اطلاعات و ویژگی‌ها"
      subtitle={productId ? "برند، ویژگی و توضیح کالا" : "اول مرحله قبل را ثبت کنید"}
      backHref={productId ? `/products/new?step=1&product=${productId}` : "/products/new?step=1"}
      backLabel="مرحله قبل"
      nextLabel="مدیا"
    >
      {!productId ? (
        <div className="rounded-2xl border bg-card px-4 py-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">اول نوع و گروه کالا را ثبت کنید.</p>
          <Link href="/products/new?step=1" className="mt-4 inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm text-primary-foreground">
            بازگشت به مرحله اول
          </Link>
        </div>
      ) : !ready ? (
        <div className="animate-pulse rounded-2xl border bg-card p-6 shadow-sm">
          <div className="h-4 w-32 rounded-lg bg-muted" />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="h-12 rounded-2xl bg-muted" />
            <div className="h-12 rounded-2xl bg-muted" />
            <div className="h-28 rounded-2xl bg-muted md:col-span-2" />
          </div>
        </div>
      ) : loadError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-7 text-destructive">{loadError}</p>
      ) : (
        <form
          className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]"
          onSubmit={(event) => {
            event.preventDefault()
            if (!editable || saving) return
            if (brands.length && !brand) {
              setSaved("")
              setError("برند را انتخاب کنید")
              return
            }
            if (!plainText(description) || (stock && !age.trim())) {
              setSaved("")
              setError("لطفا همه فیلدهای الزامی را تکمیل کنید")
              return
            }
            if (filled < need) {
              setSaved("")
              setError(attributes.length > FREE_AFTER ? "بیشتر از ۳ ویژگی را وارد کنید. بقیه اختیاری است." : "ویژگی‌های کالا را کامل کنید")
              return
            }
            setSaving(true)
            setError("")
            saveStepTwo(productId, {
              ...(brand ? { brand } : {}),
              full_description: description.trim(),
              nature: picked,
              important_tips: tips,
              product_age: stock ? age.trim() : "",
              product_defects: stock ? defects : [],
              attribute_values: attributePayload(attributes, drafts),
            })
              .then((step) => {
                setDrafts(draftsFrom(step))
                setSaved("این مرحله ذخیره شد.")
              })
              .catch((err: unknown) => {
                setSaved("")
                setError(err instanceof Error ? err.message : "ذخیره اطلاعات انجام نشد")
              })
              .finally(() => setSaving(false))
          }}
        >
          <div className="flex flex-col gap-4 xl:col-start-1">
            {!editable ? (
              <p className="flex items-start gap-2 rounded-2xl border bg-muted/60 px-4 py-3 text-sm leading-7">
                <WarningCircleIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
                مشخصات این کالا ثبت شده و از اینجا عوض نمی‌شود.
              </p>
            ) : null}
            {review ? (
              <p className="rounded-2xl border border-[#DD794F]/30 bg-[#DD794F]/10 px-4 py-3 text-sm leading-7 text-[#9a4e2c]">
                برند، ویژگی‌ها و توضیحات را با گروه کالای جدید هماهنگ کنید.
              </p>
            ) : null}

            {attributes.length ? (
              <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <SlidersHorizontalIcon className="size-5" weight="duotone" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">ویژگی‌های کالا</h2>
                    <p className="text-xs text-muted-foreground">
                      {attributes.length > FREE_AFTER
                        ? restOptional
                          ? "بیشتر از ۳ ویژگی وارد شده. بقیه اختیاری است."
                          : `${(need - filled).toLocaleString("fa-IR")} ویژگی دیگر بنویسید تا بقیه اختیاری شود.`
                        : "این ویژگی‌ها را کامل کنید"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {attributes.map((attr) => {
                    const draft = drafts[attr.id] || { text: "", selective: 0, multi: [] }
                    return (
                      <label key={attr.id} className="block">
                        <span className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                          {attr.fa_name}
                          {restOptional && !filledIds.has(attr.id) ? <span className="text-xs font-normal text-muted-foreground">اختیاری</span> : null}
                        </span>
                        {attr.data_type === "selective" ? (
                          <span className="relative block">
                            <select
                              className={cn(control, "appearance-none pe-10")}
                              value={draft.selective || ""}
                              disabled={!editable}
                              onChange={(event) =>
                                setDrafts((current) => ({ ...current, [attr.id]: { ...draft, selective: Number(event.target.value) } }))
                              }
                            >
                              <option value="">انتخاب کنید</option>
                              {attr.selective_attributes.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.fa_title}
                                </option>
                              ))}
                            </select>
                            <CaretDownIcon className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          </span>
                        ) : attr.data_type === "multi_text" ? (
                          <span className="flex flex-wrap gap-2">
                            {attr.multi_options.map((option) => {
                              const on = draft.multi.includes(option.id)
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  disabled={!editable}
                                  className={cn("rounded-full border px-3 py-1.5 text-sm", on ? "border-primary bg-primary/10 text-foreground" : "bg-background text-muted-foreground")}
                                  onClick={() =>
                                    setDrafts((current) => ({
                                      ...current,
                                      [attr.id]: {
                                        ...draft,
                                        multi: on ? draft.multi.filter((id) => id !== option.id) : [...draft.multi, option.id],
                                      },
                                    }))
                                  }
                                >
                                  {option.fa_title}
                                </button>
                              )
                            })}
                          </span>
                        ) : (
                          <input
                            className={control}
                            value={draft.text}
                            disabled={!editable}
                            placeholder={attr.text_input_placeholder || attr.fa_name}
                            onChange={(event) => setDrafts((current) => ({ ...current, [attr.id]: { ...draft, text: event.target.value } }))}
                          />
                        )}
                      </label>
                    )
                  })}
                </div>
              </section>
            ) : (
              <p className="rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">برای این گروه، ویژگی جداگانه‌ای تعریف نشده.</p>
            )}

            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <SketchLogoIcon className="size-5" weight="duotone" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">برند یا نام سازنده</h2>
                  <p className="text-xs text-muted-foreground">از فهرست همین گروه کالا</p>
                </div>
              </div>
              <label className="block">
                <span className="mb-1.5 flex gap-1 text-sm font-medium">
                  <span>برند</span>
                  {brands.length ? <span className="text-[#DD794F]">*</span> : null}
                </span>
                <span className="relative block">
                  <select className={cn(control, "appearance-none pe-10")} value={brand || ""} disabled={!editable} onChange={(event) => setBrand(Number(event.target.value))}>
                    <option value="">{brands.length ? "انتخاب کنید" : "برندی برای این گروه نیست"}</option>
                    {brands.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.fa_name}
                      </option>
                    ))}
                  </select>
                  <CaretDownIcon className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </span>
              </label>
            </section>

            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ArticleIcon className="size-5" weight="duotone" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">توضیحات کامل</h2>
                  <p className="text-xs text-muted-foreground">آنچه خریدار باید قبل از سفارش بداند</p>
                </div>
              </div>
              <label className="block">
                <span className="mb-1.5 flex gap-1 text-sm font-medium">
                  <span>توضیح کالا</span>
                  <span className="text-[#DD794F]">*</span>
                </span>
                <textarea
                  className={cn(control, "h-40 resize-none py-3 leading-7")}
                  value={description}
                  disabled={!editable}
                  placeholder="جنس، کاربرد و نکته‌های مهم را بنویسید"
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
            </section>

            {natures.length ? (
              <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <LeafIcon className="size-5" weight="duotone" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">ماهیت کالا</h2>
                    <p className="text-xs text-muted-foreground">هر کدام که درست است را روشن کنید</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {natures.map((item) => {
                    const on = picked.includes(item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={!editable}
                        title={item.description || item.fa_name}
                        className={cn("rounded-full border px-3 py-2 text-sm", on ? "border-primary bg-primary/10" : "bg-background text-muted-foreground")}
                        onClick={() => setPicked((current) => (on ? current.filter((id) => id !== item.id) : [...current, item.id]))}
                      >
                        {item.fa_name}
                      </button>
                    )
                  })}
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <LightbulbIcon className="size-5" weight="duotone" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">نکات مهم</h2>
                  <p className="text-xs text-muted-foreground">حداکثر ۱۰ نکته، هر کدام تا ۳۰۰ حرف</p>
                </div>
              </div>
              {editable ? (
                <div className="flex gap-2">
                  <input
                    className={control}
                    value={tipDraft}
                    maxLength={300}
                    placeholder="مثلاً دور از نور مستقیم"
                    onChange={(event) => setTipDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return
                      event.preventDefault()
                      const text = tipDraft.trim()
                      if (!text || tips.length >= 10) return
                      setTips((current) => [...current, text])
                      setTipDraft("")
                    }}
                  />
                  <button
                    type="button"
                    className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
                    onClick={() => {
                      const text = tipDraft.trim()
                      if (!text || tips.length >= 10) return
                      setTips((current) => [...current, text])
                      setTipDraft("")
                    }}
                  >
                    <PlusIcon className="size-5" />
                  </button>
                </div>
              ) : null}
              <ul className={cn("flex flex-col gap-2", editable && "mt-3")}>
                {tips.map((tip, index) => (
                  <li key={`${tip}-${index}`} className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5">
                    <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm">{tip}</span>
                    {editable ? (
                      <span className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          className="text-muted-foreground"
                          onClick={() => {
                            setTips((current) => current.filter((_, item) => item !== index))
                            setTipDraft(tip)
                          }}
                        >
                          <PencilSimpleIcon className="size-4" />
                        </button>
                        <button type="button" className="text-muted-foreground" onClick={() => setTips((current) => current.filter((_, item) => item !== index))}>
                          <XIcon className="size-4" />
                        </button>
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            {stock ? (
              <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ClockIcon className="size-5" weight="duotone" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">عمر کالا</h2>
                    <p className="text-xs text-muted-foreground">برای کالای استوک الزامی است</p>
                  </div>
                </div>
                <input className={control} value={age} disabled={!editable} placeholder="مثال: ۲ سال کارکرد" onChange={(event) => setAge(event.target.value)} />
              </section>
            ) : null}

            {stock ? (
              <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <WarningCircleIcon className="size-5" weight="duotone" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">ایرادهای کالا</h2>
                    <p className="text-xs text-muted-foreground">حداکثر ۲۰ مورد، هر کدام تا ۳۰۰ حرف</p>
                  </div>
                </div>
                {editable ? (
                  <div className="flex gap-2">
                    <input
                      className={control}
                      value={defectDraft}
                      maxLength={300}
                      placeholder="مثال: شکستگی جزئی"
                      onChange={(event) => setDefectDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return
                        event.preventDefault()
                        const text = defectDraft.trim()
                        if (!text || defects.length >= 20) return
                        setDefects((current) => [...current, text])
                        setDefectDraft("")
                      }}
                    />
                    <button
                      type="button"
                      className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
                      onClick={() => {
                        const text = defectDraft.trim()
                        if (!text || defects.length >= 20) return
                        setDefects((current) => [...current, text])
                        setDefectDraft("")
                      }}
                    >
                      <PlusIcon className="size-5" />
                    </button>
                  </div>
                ) : null}
                <ul className={cn("flex flex-col gap-2", editable && "mt-3")}>
                  {defects.map((defect, index) => (
                    <li key={`${defect}-${index}`} className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5">
                      <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm">{defect}</span>
                      {editable ? (
                        <span className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            className="text-muted-foreground"
                            onClick={() => {
                              setDefects((current) => current.filter((_, item) => item !== index))
                              setDefectDraft(defect)
                            }}
                          >
                            <PencilSimpleIcon className="size-4" />
                          </button>
                          <button type="button" className="text-muted-foreground" onClick={() => setDefects((current) => current.filter((_, item) => item !== index))}>
                            <XIcon className="size-4" />
                          </button>
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="flex flex-col gap-4 xl:sticky xl:top-4 xl:col-start-2 xl:row-start-1">
            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="font-semibold">خلاصه این مرحله</h2>
              <p className="mt-1 text-xs text-muted-foreground">برند، ویژگی، ماهیت و نکته‌های کالا</p>
              <div className="mt-4 grid gap-3">
                {summary.map(([title, value, done, Icon]) => (
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
              <Button type="submit" size="lg" className="h-12 w-full rounded-2xl text-base" disabled={!editable || saving}>
                {saving ? "در حال ذخیره..." : "تایید و ادامه"}
              </Button>
              <p className="mt-2 text-center text-xs leading-6 text-muted-foreground">
                {editable ? "با این دکمه، همین مرحله ذخیره می‌شود." : "این کالا از اینجا قابل ویرایش نیست."}
              </p>
            </div>
          </aside>

          <div className="fixed inset-x-3 bottom-3 z-30 xl:hidden">
            {editable ? (
              <Button type="submit" size="lg" className="h-12 w-full rounded-2xl text-base shadow-lg" disabled={saving}>
                {saving ? "در حال ذخیره..." : "تایید و ادامه"}
              </Button>
            ) : (
              <p className="rounded-2xl border bg-card/95 px-4 py-3 text-center text-sm shadow-lg backdrop-blur">این کالا از اینجا قابل ویرایش نیست</p>
            )}
          </div>
        </form>
      )}
    </ProductWizard>
  )
}
