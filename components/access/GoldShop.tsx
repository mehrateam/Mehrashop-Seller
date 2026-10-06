"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UploadField } from "@/components/access/UploadField"
import { ensureSession } from "@/lib/auth"
import { fetchProvinces, fetchStore, storeFile, updateStore, type ProvinceOption } from "@/lib/store"

const field =
  "h-11 w-full rounded-xl border border-border bg-muted px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function GoldShop() {
  const router = useRouter()
  const [provinces, setProvinces] = useState<ProvinceOption[]>([])
  const [logoUrl, setLogoUrl] = useState("")
  const [bannerUrl, setBannerUrl] = useState("")
  const [hasAddress, setHasAddress] = useState(false)
  const [storeId, setStoreId] = useState(0)
  const [logo, setLogo] = useState<File | null>(null)
  const [banner, setBanner] = useState<File | null>(null)
  const [province, setProvince] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [about, setAbout] = useState("")
  const [postal, setPostal] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([fetchStore(), fetchProvinces()])
      .then(([store, places]) => {
        if (!alive) return
        setStoreId(store.id)
        setLogoUrl(storeFile(store.logo))
        setBannerUrl(storeFile(store.banner))
        setHasAddress(Boolean(store.address && store.postal_code && store.city))
        setAddress(store.address || "")
        setAbout(store.descriptions || "")
        setPostal(store.postal_code || "")
        setProvinces(places)
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "اطلاعات فروشگاه خوانده نشد")
      })
      .finally(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (window.location.hash === "#shop") document.getElementById("shop")?.scrollIntoView({ block: "start" })
  }, [ready])

  const cities = provinces.find((item) => String(item.id) === province)?.city ?? []

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const code = postal.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/\D/g, "")
    const problem = !logo && !logoUrl
      ? "عکس پروفایل را بگذارید"
      : !hasAddress && !address.trim()
          ? "آدرس را بنویسید"
          : !hasAddress && (!province || !city)
            ? "استان و شهر را انتخاب کنید"
            : !hasAddress && !/^\d{10}$/.test(code)
              ? "کد پستی باید ۱۰ رقم باشد"
              : ""
    if (problem || !storeId) {
      setError(problem || "فروشگاه پیدا نشد")
      return
    }
    setLoading(true)
    setError("")
    const body = new FormData()
    if (logo) body.append("logo", logo)
    if (banner) body.append("banner", banner)
    body.append("descriptions", about.trim())
    if (!hasAddress) {
      body.append("address", address.trim())
      body.append("postal_code", code)
      body.append("province", province)
      body.append("city", city)
    }
    try {
      await updateStore(storeId, body)
      await ensureSession()
      sessionStorage.setItem("show_welcome_modal", "1")
      sessionStorage.setItem("welcome_modal_kind", "registered")
      // router.replace("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره فروشگاه انجام نشد")
      setLoading(false)
    }
  }

  return (
    <form id="shop" onSubmit={onSubmit} className="scroll-mt-6">
      <Card className="rounded-2xl bg-[#f3f6ec] ring-primary/25">
        <CardContent className="flex flex-col gap-4 pt-(--card-spacing)">
          <div>
            <h2 className="text-lg font-bold">پروفایل، بنر و آدرس</h2>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">
              سطح شما طلاست. پروفایل و آدرس را ذخیره کنید تا محصولات باز شود. بنر اختیاری است.
            </p>
          </div>
          {error ? <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <UploadField label="پروفایل" file={logo} current={logoUrl} onPick={setLogo} contain />
            <UploadField label="بنر فروشگاه (اختیاری)" file={banner} current={bannerUrl} onPick={setBanner} contain />
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">درباره ما</span>
            <textarea
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              maxLength={500}
              rows={4}
              placeholder="فروشگاه را در چند خط معرفی کنید"
              className={`${field} h-auto py-2.5 leading-7`}
            />
          </label>
          {hasAddress ? (
            <p className="text-sm leading-7 text-muted-foreground">آدرس فروشگاه ثبت شده است.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">استان</span>
                <select value={province} onChange={(event) => { setProvince(event.target.value); setCity("") }} className={field}>
                  <option value="">انتخاب</option>
                  {provinces.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">شهر</span>
                <select value={city} onChange={(event) => setCity(event.target.value)} className={field}>
                  <option value="">انتخاب</option>
                  {cities.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-xs font-semibold text-muted-foreground">آدرس</span>
                <textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={3} className={`${field} h-auto py-2.5`} />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-xs font-semibold text-muted-foreground">کد پستی</span>
                <input value={postal} onChange={(event) => setPostal(event.target.value)} inputMode="numeric" className={field} />
              </label>
            </div>
          )}
          <Button type="submit" disabled={loading || !ready} className="h-12 rounded-2xl text-[15px] font-semibold">
            {loading ? "در حال ذخیره..." : "ذخیره فروشگاه"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
