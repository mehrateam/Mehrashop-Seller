"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  CaretLeftIcon,
  CaretRightIcon,
  InstagramLogoIcon,
  MapPinIcon,
  PencilSimpleIcon,
  PhoneIcon,
  SealCheckIcon,
  StarIcon,
  StorefrontIcon,
  TelegramLogoIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react"
import { toman } from "@/lib/orders"
import { fetchStore, mapLink, storeFile, storePrice, type SellerStore } from "@/lib/store"

export function StoreProfile() {
  const [store, setStore] = useState<SellerStore | null>(null)
  const [error, setError] = useState("")
  const [slide, setSlide] = useState(0)
  const [branchId, setBranchId] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    fetchStore()
      .then((data) => {
        if (alive) setStore(data)
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "خطا در دریافت اطلاعات فروشگاه")
      })
    return () => {
      alive = false
    }
  }, [])

  if (error) {
    return <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
  }

  if (!store) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
        در حال بارگذاری...
      </div>
    )
  }

  const place = [store.province, store.city].filter(Boolean).join(" - ")
  const socials = [
    store.instagram ? { label: store.instagram, Icon: InstagramLogoIcon } : null,
    store.whatsapp ? { label: store.whatsapp, Icon: WhatsappLogoIcon } : null,
    store.telegram ? { label: store.telegram, Icon: TelegramLogoIcon } : null,
  ].filter((item) => item !== null)
  const images = store.images ?? []
  const photo = images[slide] ?? images[0]
  const branches = store.branches ?? []
  const branch = branches.find((item) => item.id === branchId) ?? branches[0]
  const lat = branch?.x_coordination ?? 0
  const lng = branch?.y_coordination ?? 0
  const logo = storeFile(store.logo)
  const banner = storeFile(store.banner)

  return (
    <div className="flex flex-col gap-8 lg:gap-14">
      <section className="relative">
        <div className="relative h-32 overflow-hidden rounded-2xl lg:h-56">
          {banner ? (
            <img src={banner} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-primary" />
          )}
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative hidden h-full items-start justify-between p-8 text-white lg:flex">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{store.name_fa || "فروشگاه"}</h1>
                <Link
                  href="/store/edit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white hover:bg-primary/90"
                >
                  <PencilSimpleIcon className="size-4" />
                  ویرایش اطلاعات
                </Link>
              </div>
              <p className="text-sm text-white/80">شهر و استان فروشگاه</p>
              <p className="text-sm font-medium text-white">{place || "مشخص نشده"}</p>
              {store.score ? (
                <p className="inline-flex items-center gap-1 text-sm">
                  {store.score}
                  <StarIcon className="size-3.5" weight="fill" />
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-1.5 text-sm">
              {socials.map(({ label, Icon }) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  {label}
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute top-3 right-3 flex size-16 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white lg:top-auto lg:right-auto lg:-bottom-12 lg:left-8 lg:size-28 lg:rounded-[2rem] lg:border-4 lg:border-background">
          {logo ? (
            <img src={logo} alt="" className="size-full object-contain" />
          ) : (
            <StorefrontIcon className="size-7 text-muted-foreground lg:size-10" />
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-bold">{store.name_fa || "فروشگاه"}</h1>
                {store.score ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-sm">
                    {store.score}
                    <StarIcon className="size-3.5 text-primary" weight="fill" />
                  </span>
                ) : null}
              </div>
              {place ? <p className="text-sm text-muted-foreground">{place}</p> : null}
              {store.business_license ? (
                <p className="inline-flex items-center gap-1 text-sm text-primary">
                  <SealCheckIcon className="size-4" />
                  دارای پروانه کسب
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
              {socials.map(({ label, Icon }) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  {label}
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Link
              href="/store/edit"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary px-3 text-sm font-medium text-primary"
            >
              ویرایش اطلاعات
              <PencilSimpleIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="lg:pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">درباره فروشگاه</h2>
          <Link href="/store/edit" className="inline-flex items-center gap-1 text-sm font-medium text-primary lg:hidden">
            ویرایش
            <PencilSimpleIcon className="size-4" />
          </Link>
        </div>
        <p className="text-sm leading-8 text-muted-foreground">{store.descriptions || "توضیحی ثبت نشده"}</p>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-base font-bold">مشخصات فروشگاه</h2>
        <div className="mt-5 grid items-start gap-6 lg:grid-cols-2">
          <div>
            {photo ? (
              <div className="flex flex-col gap-3">
                <img src={storeFile(photo.image)} alt="" className="h-64 w-full rounded-xl object-cover lg:h-80" />
                {images.length > 1 ? (
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="تصویر قبلی" className="text-muted-foreground hover:text-primary" onClick={() => setSlide((index) => (index + images.length - 1) % images.length)}>
                      <CaretRightIcon className="size-4" />
                    </button>
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((image, index) => (
                        <button key={image.id} type="button" onClick={() => setSlide(index)} className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 ${index === slide ? "border-primary" : "border-transparent opacity-70"}`}>
                          <img src={storeFile(image.image)} alt="" className="size-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <button type="button" aria-label="تصویر بعدی" className="text-muted-foreground hover:text-primary" onClick={() => setSlide((index) => (index + 1) % images.length)}>
                      <CaretLeftIcon className="size-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">عکسی برای فروشگاه خود اضافه نکردید</p>
            )}
          </div>

          {branch ? (
            <div className="flex flex-col gap-4">
              {branches.length > 1 ? (
                <select
                  value={branch.id}
                  onChange={(event) => setBranchId(Number(event.target.value))}
                  className="h-10 rounded-xl border bg-background px-3 text-sm outline-none focus-visible:border-ring"
                >
                  {branches.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || "شعبه"}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm font-semibold">{branch.name || "شعبه اصلی"}</p>
              )}
              <p className="inline-flex gap-2 text-sm leading-7">
                <MapPinIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
                {branch.address || "آدرسی ثبت نشده"}
              </p>
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <PhoneIcon className="size-4" />
                شماره تماس: {branch.phone_company || "—"}
              </p>
              {lat || lng ? (
                <a href={mapLink(lat, lng)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <MapPinIcon className="size-4" weight="fill" />
                  مشاهده روی نقشه
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {store.products?.length ? (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-bold">محصولات فروشگاه</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {store.products.map((product) => (
              <article key={product.id} className="flex flex-col gap-3 rounded-xl border p-3">
                {storeFile(product.image_cover) ? (
                  <img src={storeFile(product.image_cover)} alt={product.fa_name} className="h-40 w-full rounded-lg object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <StorefrontIcon className="size-8" />
                  </div>
                )}
                <p className="line-clamp-2 text-sm font-medium">{product.fa_name}</p>
                <div className="mt-auto flex items-end justify-between gap-2">
                  {product.avg_score ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      {product.avg_score}
                      <StarIcon className="size-3 text-primary" weight="fill" />
                    </span>
                  ) : (
                    <span />
                  )}
                  {product.count === 0 ? (
                    <span className="rounded-md bg-destructive px-2 py-1 text-xs text-white">ناموجود</span>
                  ) : (
                    <span className="text-sm font-bold text-primary">
                      {product.discounted_percentage ? (
                        <span className="mb-0.5 block text-xs font-normal text-muted-foreground line-through">{toman(product.price)}</span>
                      ) : null}
                      {storePrice(product)}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
