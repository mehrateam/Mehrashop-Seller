"use client"

import { useEffect, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRightIcon,
  ClockCountdownIcon,
  DownloadSimpleIcon,
  PackageIcon,
  SealCheckIcon,
  TruckIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { ShamsiDate } from "@/components/ui/shamsi-date"
import {
  ORDER_FLOW,
  REJECT_REASONS,
  STATUS_CLASS,
  downloadInvoice,
  fetchOrder,
  flowIndex,
  mediaUrl,
  postOrder,
  rejectOrderItem,
  toman,
  type SellerOrder,
} from "@/lib/orders"

export function OrderView({ id }: { id: string }) {
  const [order, setOrder] = useState<SellerOrder | null>(null)
  const [loadedId, setLoadedId] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [rejecting, setRejecting] = useState(0)
  const [reason, setReason] = useState(REJECT_REASONS[0])
  const [note, setNote] = useState("")
  const [handover, setHandover] = useState("")
  const [tracking, setTracking] = useState("")
  const stepIcons = [ClockCountdownIcon, PackageIcon, SealCheckIcon, TruckIcon]
  const loading = loadedId !== id
  const active = order?.items?.filter((item) => item.status !== "rejected") ?? []
  const place = [order?.province, order?.city === order?.province ? "" : order?.city, order?.address].filter(Boolean).join("، ")
  const current = flowIndex(order?.status ?? "")

  useEffect(() => {
    let alive = true
    fetchOrder(id)
      .then((data) => {
        if (!alive) return
        setOrder(data)
        setLoadedId(id)
        setError("")
      })
      .catch((err: unknown) => {
        if (!alive) return
        setOrder(null)
        setLoadedId(id)
        setError(err instanceof Error ? err.message : "سفارش یافت نشد")
      })
    return () => {
      alive = false
    }
  }, [id])

  async function run(task: () => Promise<SellerOrder>) {
    setError("")
    setBusy(true)
    try {
      setOrder(await task())
      setRejecting(0)
      setNote("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "عملیات ناموفق بود")
    } finally {
      setBusy(false)
    }
  }

  async function onRejectItem(e: FormEvent, itemId: number) {
    e.preventDefault()
    const needsNote = reason === "دلایل دیگر" || reason === "نیازمند تماس"
    if (needsNote && !note.trim()) {
      setError("توضیح را وارد کنید")
      return
    }
    const finalReason = reason === "دلایل دیگر" ? note.trim() : reason
    await run(() => rejectOrderItem(itemId, finalReason, note.trim()))
  }

  async function onShip(e: FormEvent) {
    e.preventDefault()
    if (!handover) {
      setError("تاریخ تحویل را وارد کنید")
      return
    }
    await run(() => postOrder(id, "ship", { handover_time: handover, tracking_code: tracking.trim() }))
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-3">
          <Link href="/orders" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowRightIcon className="size-4" />
            سفارش‌ها
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight">سفارش #{id}</h1>
            {order ? (
              <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[order.status] || STATUS_CLASS.cancelled}`}>
                {order.status_label}
              </span>
            ) : null}
          </div>
        </div>
        <Button
          variant="outline"
          className="h-10 rounded-xl bg-card px-4"
          disabled={busy || loading}
          onClick={() => {
            setError("")
            downloadInvoice(id).catch((err: unknown) => {
              setError(err instanceof Error ? err.message : "دانلود فاکتور ناموفق بود")
            })
          }}
        >
          <DownloadSimpleIcon />
          دانلود فاکتور
        </Button>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading || !order ? (
        <div className="flex h-36 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
          {loading ? "در حال بارگذاری..." : "سفارش یافت نشد"}
        </div>
      ) : (
        <>
          {current >= 0 ? (
            <ol className="grid grid-cols-4 rounded-2xl border bg-card px-2 py-6 shadow-sm sm:px-6">
              {ORDER_FLOW.map((step, index) => {
                const done = current === ORDER_FLOW.length - 1 || index < current
                const here = index === current && current < ORDER_FLOW.length - 1
                const StepIcon = stepIcons[index]
                return (
                  <li key={step.id} className="relative flex flex-col items-center gap-2.5 text-center">
                    {index < ORDER_FLOW.length - 1 ? (
                      <span className={`absolute top-[18px] start-1/2 h-0.5 w-full ${index < current ? "bg-primary" : "bg-border"}`} />
                    ) : null}
                    <span
                      className={`relative z-10 flex size-9 items-center justify-center rounded-full ${
                        done
                          ? "bg-primary text-primary-foreground"
                          : here
                            ? "bg-card text-primary ring-4 ring-primary/20"
                            : "border bg-card text-muted-foreground"
                      }`}
                    >
                      <StepIcon className="size-4" weight={done ? "fill" : "regular"} />
                    </span>
                    <span className={`max-w-28 text-xs leading-5 ${here ? "font-semibold text-primary" : done ? "font-semibold" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          ) : null}

          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b bg-primary/5 px-5 py-4">
              <div>
                <p className="text-xs text-muted-foreground">مبلغ سفارش</p>
                <p className="mt-1.5 text-2xl font-bold leading-none text-primary">{toman(order.total)}</p>
                {order.subtotal || order.shipping_cost ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {order.subtotal ? `کالاها ${toman(order.subtotal)}` : ""}
                    {order.subtotal && order.shipping_cost ? " · " : ""}
                    {order.shipping_cost ? `ارسال ${toman(order.shipping_cost)}` : ""}
                  </p>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{order.created_at}</p>
            </div>
            <dl className="grid gap-x-8 gap-y-4 px-5 py-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">خریدار</dt>
                <dd className="mt-1 font-medium">{order.customer_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">موبایل</dt>
                <dd className="mt-1 text-end font-medium" dir="ltr">{order.phone || "—"}</dd>
              </div>
              {order.postal_code ? (
                <div>
                  <dt className="text-xs text-muted-foreground">کد پستی</dt>
                  <dd className="mt-1 text-end font-medium" dir="ltr">{order.postal_code}</dd>
                </div>
              ) : null}
              {order.tracking_code ? (
                <div>
                  <dt className="text-xs text-muted-foreground">کد رهگیری</dt>
                  <dd className="mt-1 text-end font-medium break-all" dir="ltr">{order.tracking_code}</dd>
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">آدرس</dt>
                <dd className="mt-1 leading-7">{place || "—"}</dd>
              </div>
            </dl>
          </section>

          <section className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold">کالاها</h2>
              <span className="text-xs text-muted-foreground">{order.items?.length ?? 0} قلم</span>
            </div>
            {order.items?.map((item) => (
              <article
                key={item.id}
                className={`flex gap-3.5 rounded-2xl border bg-card p-4 shadow-sm ${item.status === "rejected" ? "opacity-60" : ""}`}
              >
                {item.image ? (
                  <Image src={mediaUrl(item.image)} alt={item.title || "کالا"} width={72} height={72} className="size-[4.5rem] shrink-0 rounded-xl border bg-muted object-contain" />
                ) : (
                  <div className="flex size-[4.5rem] shrink-0 items-center justify-center rounded-xl border bg-muted text-muted-foreground">
                    <PackageIcon className="size-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold leading-6">{item.title || "کالا"}</p>
                    <p className="shrink-0 text-lg font-bold text-primary">{toman(item.line_total)}</p>
                  </div>
                  {item.variety ? <p className="mt-1 text-sm text-muted-foreground">{item.variety}</p> : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-muted px-2 py-1 font-medium">{item.quantity} عدد</span>
                    <span className="text-muted-foreground">موجودی {item.stock}</span>
                    {order.status === "paid" && item.status !== "rejected" ? null : (
                      <span className={`rounded-md px-2 py-1 font-semibold ${STATUS_CLASS[item.status] || "bg-muted text-muted-foreground"}`}>
                        {item.status_label}
                      </span>
                    )}
                  </div>
                  {item.rejection_reason ? (
                    <p className="mt-2 text-xs font-medium text-destructive">علت رد: {item.rejection_reason}</p>
                  ) : null}
                  {order.status === "paid" && item.status !== "rejected" ? (
                    rejecting === item.id ? (
                      <form className="mt-3 grid max-w-sm gap-2" onSubmit={(e) => onRejectItem(e, item.id)}>
                        <select value={reason} onChange={(e) => setReason(e.target.value)} className="h-10 rounded-xl border bg-transparent px-3 text-sm">
                          {REJECT_REASONS.map((itemReason) => (
                            <option key={itemReason} value={itemReason}>{itemReason}</option>
                          ))}
                        </select>
                        {reason === "دلایل دیگر" || reason === "نیازمند تماس" ? (
                          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="توضیح" className="h-10 rounded-xl border bg-transparent px-3 text-sm outline-none" />
                        ) : null}
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" variant="destructive" disabled={busy}>رد کالا</Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => setRejecting(0)}>انصراف</Button>
                        </div>
                      </form>
                    ) : (
                      <Button type="button" size="sm" variant="destructive" className="mt-3" disabled={busy} onClick={() => setRejecting(item.id)}>
                        رد کالا
                      </Button>
                    )
                  ) : null}
                </div>
              </article>
            ))}
          </section>

          {order.status === "paid" || order.status === "processing" ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-5 py-4 shadow-sm">
              <p className="text-sm text-muted-foreground">
                {order.status === "processing"
                  ? "بسته که آماده شد، برای ارسال علامت بزنید."
                  : active.length
                    ? "کالاهای قابل ارسال را تایید کنید."
                    : "همه کالاها رد شده‌اند."}
              </p>
              {order.status === "paid" && active.length === 0 ? (
                <Button className="h-10 rounded-xl px-4" disabled={busy} variant="destructive" onClick={() => run(() => postOrder(id, "reject"))}>
                  رد سفارش
                </Button>
              ) : null}
              {order.status === "paid" && active.length > 0 ? (
                <Button className="h-10 rounded-xl px-4" disabled={busy} onClick={() => run(() => postOrder(id, "approve"))}>
                  تایید سفارش
                </Button>
              ) : null}
              {order.status === "processing" ? (
                <Button className="h-10 rounded-xl px-4" disabled={busy} onClick={() => run(() => postOrder(id, "status", { status: "ready_for_shipping" }))}>
                  آماده ارسال
                </Button>
              ) : null}
            </div>
          ) : null}

          {order.status === "ready_for_shipping" ? (
            <form onSubmit={onShip} className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm">
              <div>
                <p className="font-semibold">ثبت ارسال</p>
                <p className="mt-1 text-sm text-muted-foreground">تاریخ تحویل به پست و کد رهگیری را وارد کنید.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 text-sm">
                  <span className="text-muted-foreground">تاریخ تحویل به پست</span>
                  <ShamsiDate value={handover} onChange={setHandover} />
                </div>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-muted-foreground">کد رهگیری</span>
                  <input required value={tracking} onChange={(e) => setTracking(e.target.value)} className="h-10 rounded-xl border bg-transparent px-3 outline-none focus-visible:border-primary" />
                </label>
              </div>
              <Button type="submit" className="h-10 w-fit rounded-xl px-4" disabled={busy}>ثبت و ارسال</Button>
            </form>
          ) : null}
        </>
      )}
    </div>
  )
}
