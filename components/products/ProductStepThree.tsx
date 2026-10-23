"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircleIcon, CheckIcon, ImageIcon, ImagesIcon, LightbulbIcon, PlusIcon, VideoCameraIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react"
import { ProductWizard } from "@/components/products/ProductWizard"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import {
  IMAGE_LIMIT,
  VIDEO_LIMIT,
  checkProductImage,
  checkProductVideo,
  fetchStepThree,
  saveStepThree,
  type MediaDraft,
  type MediaItem,
  type MediaNotice,
} from "@/lib/product-media"
import { cn } from "@/lib/utils"

export function ProductStepThree({ productId }: { productId: number }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [dialog, setDialog] = useState<(MediaNotice & { ok: boolean }) | null>(null)
  const [saving, setSaving] = useState(false)
  const [coverUrl, setCoverUrl] = useState("")
  const [coverFile, setCoverFile] = useState<MediaDraft | null>(null)
  const [images, setImages] = useState<MediaItem[]>([])
  const [newImages, setNewImages] = useState<MediaDraft[]>([])
  const [videos, setVideos] = useState<MediaItem[]>([])
  const [newVideos, setNewVideos] = useState<MediaDraft[]>([])
  const cover = coverFile?.url || coverUrl
  const imageCount = images.filter((item) => item.owned).length + newImages.length
  const videoCount = videos.filter((item) => item.owned).length + newVideos.length
  const summary = [
    ["عکس اصلی", cover ? "انتخاب شده" : "انتخاب نشده", Boolean(cover), ImageIcon],
    ["گالری", imageCount.toLocaleString("fa-IR"), imageCount > 0, ImagesIcon],
    ["ویدیو", videoCount.toLocaleString("fa-IR"), videoCount > 0, VideoCameraIcon],
  ] as const

  useEffect(() => {
    if (!productId) return
    let alive = true
    fetchStepThree(productId)
      .then((step) => {
        if (!alive) return
        setCoverUrl(step.image_cover || "")
        setImages(step.images || [])
        setVideos(step.videos || [])
        setLoadError("")
      })
      .catch((err: unknown) => {
        if (alive) setLoadError(err instanceof Error ? err.message : "مدیا دریافت نشد")
      })
      .finally(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [productId])

  function warn(notice: MediaNotice) {
    setDialog({ ok: false, title: notice.title, text: notice.text })
  }

  async function takeCover(file?: File) {
    if (!file) return
    const problem = await checkProductImage(file)
    if (problem) {
      warn(problem)
      return
    }
    if (coverFile) URL.revokeObjectURL(coverFile.url)
    setCoverFile({ file, url: URL.createObjectURL(file) })
  }

  async function takeGallery(files: File[]) {
    const room = IMAGE_LIMIT - imageCount
    const next: MediaDraft[] = []
    let problem: MediaNotice | null = null
    for (const file of files) {
      if (next.length >= room) {
        problem = problem ?? { title: "تعداد زیاد است", text: "برای یک کالا تا ۱۰ تصویر می‌توانید اضافه کنید." }
        break
      }
      const issue = await checkProductImage(file)
      if (issue) {
        problem = problem ?? issue
        continue
      }
      next.push({ file, url: URL.createObjectURL(file) })
    }
    if (problem) warn(problem)
    if (next.length) setNewImages((current) => [...current, ...next])
  }

  function takeVideo(file?: File) {
    if (!file) return
    if (videoCount >= VIDEO_LIMIT) {
      warn({ title: "تعداد زیاد است", text: "برای یک کالا تا ۳ ویدیو می‌توانید اضافه کنید." })
      return
    }
    const problem = checkProductVideo(file)
    if (problem) {
      warn(problem)
      return
    }
    setNewVideos((current) => [...current, { file, url: URL.createObjectURL(file) }])
  }

  return (
    <ProductWizard
      step={3}
      productId={productId}
      title="مدیا"
      subtitle={productId ? "عکس اصلی، گالری و ویدیو" : "اول مرحله‌های قبل را ثبت کنید"}
      backHref={productId ? `/products/new?step=2&product=${productId}` : "/products/new?step=1"}
      backLabel="مرحله قبل"
      nextLabel="تنوع کالا"
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
            if (!cover) {
              warn({ title: "عکس اصلی لازم است", text: "عکس اصلی را باید ارسال کنید." })
              return
            }
            setSaving(true)
            saveStepThree(productId, {
              cover: coverFile?.file || null,
              images: newImages.map((item) => item.file),
              imageIds: images.filter((item) => item.owned).map((item) => item.id),
              videos: newVideos.map((item) => item.file),
              videoIds: videos.filter((item) => item.owned).map((item) => item.id),
            })
              .then(() => {
                newImages.forEach((item) => URL.revokeObjectURL(item.url))
                newVideos.forEach((item) => URL.revokeObjectURL(item.url))
                if (coverFile) URL.revokeObjectURL(coverFile.url)
                router.push(`/products/new?step=4&product=${productId}`)
              })
              .catch((err: unknown) => {
                warn({ title: "ذخیره نشد", text: err instanceof Error ? err.message : "ذخیره مدیا انجام نشد." })
              })
              .finally(() => setSaving(false))
          }}
        >
          <div className="flex flex-col gap-4 xl:col-start-1">
            <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-950">
              <LightbulbIcon className="mt-0.5 size-5 shrink-0 text-sky-500" weight="fill" />
              <div className="text-sm leading-7">
                <p className="font-bold">نکته</p>
                <p>
                  اندازه عکس اصلی و گالری باید دقیقاً <span className="font-bold">۷۰۰×۷۰۰</span> پیکسل باشد و حجم هر عکس کمتر از <span className="font-bold">۳۰۰ کیلوبایت</span>. پس‌زمینه عکس اصلی سفید باشد.
                </p>
                <p>
                  حجم هر ویدیو حداکثر <span className="font-bold">۱۵ مگابایت</span> است.
                </p>
              </div>
            </div>
            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ImageIcon className="size-5" weight="duotone" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">
                    عکس اصلی <span className="text-[#DD794F]">*</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">همین عکس در فهرست کالا دیده می‌شود</p>
                </div>
              </div>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-white p-4 sm:flex-row sm:items-stretch">
                {cover ? (
                  <Image src={cover} alt="عکس اصلی" width={144} height={144} unoptimized className="size-36 rounded-2xl border object-contain" />
                ) : (
                  <span className="flex size-36 items-center justify-center rounded-2xl border border-dashed text-primary">
                    <PlusIcon className="size-8" />
                  </span>
                )}
                <span className="flex flex-1 items-center text-sm font-medium text-primary">{cover ? "تغییر عکس اصلی" : "انتخاب عکس اصلی"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ""
                    void takeCover(file)
                  }}
                />
              </label>
            </section>

            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ImagesIcon className="size-5" weight="duotone" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">گالری تصاویر</h2>
                  <p className="text-xs text-muted-foreground">{imageCount.toLocaleString("fa-IR")} از {IMAGE_LIMIT.toLocaleString("fa-IR")}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {images.map((item) => (
                  <span key={item.id} className="relative size-24 overflow-hidden rounded-2xl border">
                    <Image src={item.url} alt="" width={96} height={96} unoptimized className="size-full object-cover" />
                    {item.owned ? (
                      <button
                        type="button"
                        className="absolute end-1.5 bottom-1.5 flex size-6 items-center justify-center rounded-lg bg-[#DD794F] text-white"
                        onClick={() => setImages((current) => current.filter((image) => image.id !== item.id))}
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    ) : null}
                  </span>
                ))}
                {newImages.map((item) => (
                  <span key={item.url} className="relative size-24 overflow-hidden rounded-2xl border">
                    <Image src={item.url} alt="" width={96} height={96} unoptimized className="size-full object-cover" />
                    <button
                      type="button"
                      className="absolute end-1.5 bottom-1.5 flex size-6 items-center justify-center rounded-lg bg-[#DD794F] text-white"
                      onClick={() => {
                        URL.revokeObjectURL(item.url)
                        setNewImages((current) => current.filter((image) => image.url !== item.url))
                      }}
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </span>
                ))}
                <label className={cn("flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed text-primary", imageCount >= IMAGE_LIMIT && "pointer-events-none opacity-50")}>
                  <PlusIcon className="size-5" />
                  <span className="text-xs">افزودن</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                      const files = Array.from(event.target.files || [])
                      event.target.value = ""
                      void takeGallery(files)
                    }}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <VideoCameraIcon className="size-5" weight="duotone" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">ویدیو</h2>
                  <p className="text-xs text-muted-foreground">{videoCount.toLocaleString("fa-IR")} از {VIDEO_LIMIT.toLocaleString("fa-IR")}، هر کدام تا ۱۵ مگابایت</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {videos.map((item) => (
                  <span key={item.id} className="relative h-28 w-44 overflow-hidden rounded-2xl border bg-black">
                    <video src={item.url} className="size-full object-cover" controls />
                    {item.owned ? (
                      <button
                        type="button"
                        className="absolute end-1.5 top-1.5 flex size-6 items-center justify-center rounded-lg bg-[#DD794F] text-white"
                        onClick={() => setVideos((current) => current.filter((video) => video.id !== item.id))}
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    ) : null}
                  </span>
                ))}
                {newVideos.map((item) => (
                  <span key={item.url} className="relative h-28 w-44 overflow-hidden rounded-2xl border bg-black">
                    <video src={item.url} className="size-full object-cover" controls />
                    <button
                      type="button"
                      className="absolute end-1.5 top-1.5 flex size-6 items-center justify-center rounded-lg bg-[#DD794F] text-white"
                      onClick={() => {
                        URL.revokeObjectURL(item.url)
                        setNewVideos((current) => current.filter((video) => video.url !== item.url))
                      }}
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </span>
                ))}
                <label className={cn("flex h-28 w-44 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed text-primary", videoCount >= VIDEO_LIMIT && "pointer-events-none opacity-50")}>
                  <PlusIcon className="size-5" />
                  <span className="text-xs">بارگذاری ویدیو</span>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,.avi"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      event.target.value = ""
                      takeVideo(file)
                    }}
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-4 xl:sticky xl:top-4 xl:col-start-2 xl:row-start-1">
            <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="font-semibold">خلاصه این مرحله</h2>
              <p className="mt-1 text-xs text-muted-foreground">عکس اصلی، گالری و ویدیوی کالا</p>
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
            <div className="hidden xl:block">
              <Button type="submit" size="lg" className="h-12 w-full rounded-2xl text-base" disabled={saving}>
                {saving ? "در حال ذخیره..." : "تایید و ادامه"}
              </Button>
              <p className="mt-2 text-center text-xs leading-6 text-muted-foreground">با تایید، مرحله تنوع کالا باز می‌شود.</p>
            </div>
          </aside>

          <div className="fixed inset-x-3 bottom-3 z-30 xl:hidden">
            <Button type="submit" size="lg" className="h-12 w-full rounded-2xl text-base shadow-lg" disabled={saving}>
              {saving ? "در حال ذخیره..." : "تایید و ادامه"}
            </Button>
          </div>
        </form>
      )}
      <Modal open={dialog !== null} onClose={() => setDialog(null)} size="sm">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <div className={`grid size-11 place-items-center rounded-full ${dialog?.ok ? "bg-primary/12 text-[#537000]" : "bg-destructive/10 text-destructive"}`}>
            {dialog?.ok ? <CheckIcon weight="bold" className="size-5" /> : <WarningCircleIcon weight="bold" className="size-5" />}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{dialog?.title}</h2>
          <p className="mb-1 text-sm text-muted-foreground">{dialog?.text}</p>
          <Button type="button" onClick={() => setDialog(null)} className="mt-1 min-w-[140px] rounded-xl">
            متوجه شدم
          </Button>
        </div>
      </Modal>
    </ProductWizard>
  )
}
