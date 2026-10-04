"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import {
  CaretRightIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeIcon,
  ImageIcon,
  InstagramLogoIcon,
  LockKeyIcon,
  StorefrontIcon,
  TelegramLogoIcon,
  WarningCircleIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react"
import { changePassword } from "@/lib/auth"
import { DiscountPermit } from "@/components/store/DiscountPermit"
import { StoreAddresses } from "@/components/store/StoreAddresses"
import { fetchStore, storeFile, updateStore, type SellerStore } from "@/lib/store"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { cn } from "@/lib/utils"

const fieldClass = "h-11 rounded-xl border-border bg-muted px-3.5"

const socials = [
  { key: "instagram", label: "اینستاگرام", placeholder: "نام کاربری", Icon: InstagramLogoIcon },
  { key: "whatsapp", label: "واتساپ", placeholder: "شماره", Icon: WhatsappLogoIcon },
  { key: "telegram", label: "تلگرام", placeholder: "نام کاربری", Icon: TelegramLogoIcon },
  { key: "website_url", label: "وب‌سایت", placeholder: "https://", Icon: GlobeIcon },
] as const

const passwords = [
  { key: "password", label: "رمز فعلی" },
  { key: "newPassword", label: "رمز جدید" },
  { key: "confirmPassword", label: "تکرار رمز جدید" },
] as const

export function StoreEdit() {
  const [store, setStore] = useState<SellerStore | null>(null)
  const [ready, setReady] = useState(false)
  const [dialog, setDialog] = useState<{ ok: boolean; title: string; text: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [shown, setShown] = useState("")
  const [logo, setLogo] = useState<File | null>(null)
  const [banner, setBanner] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const blobs = useRef<{ logo: string | null; banner: string | null }>({ logo: null, banner: null })
  const [form, setForm] = useState({ descriptions: "", instagram: "", telegram: "", whatsapp: "", website_url: "" })
  const [pass, setPass] = useState({ password: "", newPassword: "", confirmPassword: "" })

  useEffect(() => {
    let alive = true
    fetchStore()
      .then((data) => {
        if (!alive) return
        setStore(data)
        setForm({
          descriptions: data.descriptions || "",
          instagram: data.instagram || "",
          telegram: data.telegram || "",
          whatsapp: data.whatsapp || "",
          website_url: data.website_url || "",
        })
      })
      .catch((err: unknown) => {
        if (!alive) return
        setDialog({
          ok: false,
          title: "خطا",
          text: err instanceof Error ? err.message : "خطا در دریافت اطلاعات فروشگاه",
        })
      })
      .finally(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const current = blobs.current
    return () => {
      if (current.logo) URL.revokeObjectURL(current.logo)
      if (current.banner) URL.revokeObjectURL(current.banner)
    }
  }, [])

  async function onSave(event: FormEvent) {
    event.preventDefault()
    if (!store) return
    setSaving(true)
    const body = new FormData()
    for (const [key, value] of Object.entries(form)) body.append(key, value)
    if (logo) body.append("logo", logo)
    if (banner) body.append("banner", banner)
    try {
      const next = await updateStore(store.id, body)
      setStore(next)
      setLogo(null)
      setBanner(null)
      if (blobs.current.logo) URL.revokeObjectURL(blobs.current.logo)
      if (blobs.current.banner) URL.revokeObjectURL(blobs.current.banner)
      blobs.current.logo = null
      blobs.current.banner = null
      setLogoPreview(null)
      setBannerPreview(null)
      setDialog({ ok: true, title: "ذخیره شد", text: "اطلاعات فروشگاه ذخیره شد" })
    } catch (err: unknown) {
      setDialog({
        ok: false,
        title: "ذخیره نشد",
        text: err instanceof Error ? err.message : "ذخیره اطلاعات فروشگاه انجام نشد",
      })
    } finally {
      setSaving(false)
    }
  }

  async function onPassword(event: FormEvent) {
    event.preventDefault()
    if (pass.newPassword !== pass.confirmPassword) {
      setDialog({ ok: false, title: "رمز یکسان نیست", text: "رمز جدید و تکرار آن یکسان نیست" })
      return
    }
    setSavingPass(true)
    try {
      await changePassword(pass.password, pass.newPassword, pass.confirmPassword)
      setPass({ password: "", newPassword: "", confirmPassword: "" })
      setDialog({ ok: true, title: "رمز تغییر کرد", text: "رمز عبور با موفقیت عوض شد" })
    } catch (err: unknown) {
      setDialog({
        ok: false,
        title: "تغییر رمز انجام نشد",
        text: err instanceof Error ? err.message : "تغییر رمز انجام نشد",
      })
    } finally {
      setSavingPass(false)
    }
  }

  function preview(kind: "logo" | "banner", file: File | null) {
    const next = file ? URL.createObjectURL(file) : null
    const prev = blobs.current[kind]
    if (prev) URL.revokeObjectURL(prev)
    blobs.current[kind] = next
    if (kind === "logo") {
      setLogo(file)
      setLogoPreview(next)
    } else {
      setBanner(file)
      setBannerPreview(next)
    }
  }

  if (!ready) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
        در حال بارگذاری...
      </div>
    )
  }

  const bannerSrc = bannerPreview || storeFile(store?.banner)
  const logoSrc = logoPreview || storeFile(store?.logo)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">تنظیمات فروشگاه</h1>
          <p className="mt-1 text-sm text-muted-foreground">{store?.name_fa || "اطلاعاتی که در صفحه فروشگاه دیده می‌شود"}</p>
        </div>
        <Link href="/store" className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-xl px-3")}>
          <CaretRightIcon data-icon="inline-start" />
          فروشگاه
        </Link>
      </div>

      <form onSubmit={onSave} className="flex flex-col gap-5">
        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader>
            <CardTitle>نمای فروشگاه</CardTitle>
            <CardDescription>بنر و لوگو، همان تصویری است که در صفحه فروشگاه دیده می‌شود.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative h-48 overflow-hidden rounded-2xl border bg-muted focus-within:ring-3 focus-within:ring-ring/50">
              {bannerSrc ? (
                <img src={bannerSrc} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted">
                  <ImageIcon className="size-6 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">بنر فروشگاه</span>
                </div>
              )}
              <label className="absolute inset-0 cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  aria-label="بنر"
                  onChange={(event) => preview("banner", event.target.files?.[0] ?? null)}
                />
              </label>
              <span className="pointer-events-none absolute end-4 bottom-3 rounded-lg bg-black/55 px-3 py-1.5 text-xs font-medium text-white">
                {banner ? banner.name : "تغییر بنر"}
              </span>
              <label className="absolute start-4 bottom-4 z-10 flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-sm">
                {logoSrc ? (
                  <img src={logoSrc} alt="" className="size-full object-contain" />
                ) : (
                  <StorefrontIcon className="size-7 text-muted-foreground" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  aria-label="لوگو"
                  onChange={(event) => preview("logo", event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">روی بنر یا لوگوی مربعی بزنید. فرمت JPG، PNG یا WebP.</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader>
            <CardTitle>درباره و ارتباط</CardTitle>
            <CardDescription>توضیح فروشگاه و راه‌های ارتباط در صفحه فروشگاه.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="descriptions" className="text-[13px] font-semibold text-muted-foreground">
                  درباره فروشگاه
                </Label>
                <span className="text-xs text-muted-foreground">{form.descriptions.length.toLocaleString("fa-IR")}/۵۰۰</span>
              </div>
              <textarea
                id="descriptions"
                maxLength={500}
                value={form.descriptions}
                placeholder="فروشگاه را در چند خط معرفی کنید"
                onChange={(event) => setForm({ ...form, descriptions: event.target.value })}
                className="min-h-32 w-full rounded-xl border border-border bg-muted px-3.5 py-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            {socials.map(({ key, label, placeholder, Icon }) => (
              <div key={key} className="flex flex-col gap-2">
                <Label htmlFor={key} className="text-[13px] font-semibold text-muted-foreground">
                  {label}
                </Label>
                <div className="relative">
                  <Icon className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={key}
                    value={form[key]}
                    placeholder={placeholder}
                    onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                    className={cn(fieldClass, "ps-10")}
                  />
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={saving || !store} className="h-10 rounded-xl px-4">
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {store ? <DiscountPermit store={store} onChange={setStore} onDone={setDialog} /> : null}

      {store ? (
        <StoreAddresses
          branches={store.branches ?? []}
          onChange={(branches) => setStore({ ...store, branches })}
          onDone={setDialog}
        />
      ) : null}

      <form onSubmit={onPassword}>
        <Card className="rounded-2xl ring-foreground/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyIcon className="size-4 text-primary" />
              رمز عبور
            </CardTitle>
            <CardDescription>رمز جدید حداقل ۸ کاراکتر باشد.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {passwords.map((field) => (
              <div key={field.key} className="flex flex-col gap-2">
                <Label htmlFor={field.key} className="text-[13px] font-semibold text-muted-foreground">
                  {field.label}
                </Label>
                <div className="relative">
                  <Input
                    id={field.key}
                    type={shown === field.key ? "text" : "password"}
                    autoComplete={field.key === "password" ? "current-password" : "new-password"}
                    value={pass[field.key]}
                    onChange={(event) => setPass({ ...pass, [field.key]: event.target.value })}
                    className={cn(fieldClass, "pe-11")}
                  />
                  <button
                    type="button"
                    aria-label={shown === field.key ? "پنهان کردن رمز" : "نمایش رمز"}
                    className="absolute end-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:text-foreground"
                    onClick={() => setShown((value) => (value === field.key ? "" : field.key))}
                  >
                    {shown === field.key ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={savingPass || !pass.password || !pass.newPassword || !pass.confirmPassword} className="h-10 rounded-xl px-4">
              {savingPass ? "در حال ذخیره..." : "تغییر رمز عبور"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Modal open={dialog !== null} onClose={() => setDialog(null)} size="sm">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <div
            className={`grid size-11 place-items-center rounded-full ${dialog?.ok ? "bg-primary/12 text-[#537000]" : "bg-destructive/10 text-destructive"}`}
          >
            {dialog?.ok ? <CheckIcon weight="bold" className="size-5" /> : <WarningCircleIcon weight="bold" className="size-5" />}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{dialog?.title}</h2>
          <p className="mb-1 text-sm text-muted-foreground">{dialog?.text}</p>
          <Button type="button" onClick={() => setDialog(null)} className="mt-1 min-w-[140px] rounded-xl">
            متوجه شدم
          </Button>
        </div>
      </Modal>
    </div>
  )
}
