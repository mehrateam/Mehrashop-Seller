"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
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
    <div className="flex flex-col gap-8">
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="relative aspect-[1440/350] bg-muted">
          {banner ? (
            <Image
              src={banner}
              alt=""
              fill
              sizes="(min-width: 1280px) 1400px, 100vw"
              className="object-cover"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-l from-primary/20 via-[#eef6d8] to-muted" />
          )}
        </div>

        <div className="relative px-4 pt-3 pb-5 sm:px-6 sm:pt-4 sm:pb-6">
          <div className="absolute -top-8 start-4 z-10 flex size-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-white shadow-md sm:-top-12 sm:start-6 sm:size-24">
            {logo ? (
              <Image src={logo} alt="" width={192} height={192} className="size-full object-contain" style={{ objectFit: "contain" }} />
            ) : (
              <StorefrontIcon className="size-7 text-muted-foreground sm:size-8" />
            )}
          </div>

          <div className="flex flex-col gap-3 ps-20 sm:flex-row sm:items-center sm:justify-between sm:ps-28">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold sm:text-xl">{store.name_fa || "فروشگاه"}</h1>
                {store.score ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary">
                    <StarIcon className="size-3.5" weight="fill" />
                    {store.score}
                  </span>
                ) : null}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MapPinIcon className="size-4 shrink-0" />
                  {place || "شهر و استان مشخص نشده"}
                </span>
                {store.business_license ? (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <SealCheckIcon className="size-4" weight="fill" />
                    دارای پروانه کسب
                  </span>
                ) : null}
              </div>
            </div>

            <Link
              href="/store/edit"
              className="inline-flex h-9 w-fit shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white hover:bg-primary/90"
            >
              <PencilSimpleIcon className="size-4" />
              ویرایش اطلاعات
            </Link>
          </div>

          {socials.length ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
              {socials.map(({ label, Icon }) => (
                <span key={label} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-foreground/80">
                  <Icon className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate" dir="ltr">{label}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section>
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
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={storeFile(photo.image)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                {images.length > 1 ? (
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="تصویر قبلی" className="text-muted-foreground hover:text-primary" onClick={() => setSlide((index) => (index + images.length - 1) % images.length)}>
                      <CaretRightIcon className="size-4" />
                    </button>
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((image, index) => (
                        <button key={image.id} type="button" onClick={() => setSlide(index)} className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted ${index === slide ? "border-primary" : "border-transparent opacity-70"}`}>
                          <Image src={storeFile(image.image)} alt="" fill sizes="64px" className="object-cover" style={{ objectFit: "cover" }} />
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
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={storeFile(product.image_cover)}
                      alt={product.fa_name}
                      fill
                      sizes="(min-width: 1280px) 240px, 45vw"
                      className="object-contain"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-muted-foreground">
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
