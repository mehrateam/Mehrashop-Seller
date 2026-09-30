"use client"

import { useEffect, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRightIcon,
  BarcodeIcon,
  CalendarBlankIcon,
  ClockCountdownIcon,
  DownloadSimpleIcon,
  HashIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  SealCheckIcon,
  TruckIcon,
  UserIcon,
  WalletIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
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
    await run(() => postOrder(id, "ship", { handover_time: handover, tracking_code: tracking.trim() }))
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Link href="/orders" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowRightIcon className="size-4" />
            سفارش‌ها
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight">سفارش #{id}</h1>
            {order && flowIndex(order.status) < 0 ? (
              <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[order.status] || STATUS_CLASS.cancelled}`}>
                {order.status_label}
              </span>
            ) : null}
          </div>
        </div>
        <Button
          variant="outline"
          className="h-10 rounded-xl"
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
          {flowIndex(order.status) >= 0 ? (
            <ol className="grid grid-cols-4 rounded-2xl border bg-card px-2 py-5 shadow-sm sm:px-6">
              {ORDER_FLOW.map((step, index) => {
                const current = flowIndex(order.status)
                const done = current === ORDER_FLOW.length - 1 || index < current
                const active = index === current && current < ORDER_FLOW.length - 1
                const StepIcon = stepIcons[index]
                return (
                  <li key={step.id} className="relative flex flex-col items-center gap-2 text-center">
                    {index < ORDER_FLOW.length - 1 ? (
                      <span className={`absolute top-4 start-1/2 h-px w-full ${index < current ? "bg-primary" : "bg-border"}`} />
                    ) : null}
                    <span
                      className={`relative z-10 flex size-8 items-center justify-center rounded-full ${
                        done
                          ? "bg-primary text-primary-foreground"
                          : active
                            ? "border-2 border-primary bg-card text-primary"
                            : "border bg-card text-muted-foreground"
                      }`}
                    >
                      <StepIcon className="size-4" weight={done ? "fill" : "regular"} />
                    </span>
                    <span className={`px-1 text-[11px] leading-4 sm:text-xs ${active || done ? "font-semibold" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          ) : null}

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-base font-semibold leading-7">
                  <UserIcon className="size-4 shrink-0 text-muted-foreground" />
                  {order.customer_name}
                </h2>
                <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                  <PhoneIcon className="size-4 shrink-0" />
                  <span dir="ltr">{order.phone || "—"}</span>
                </p>
              </div>
              <div className="shrink-0 text-end">
                <p className="flex items-center justify-end gap-1.5 text-base font-bold">
                  <WalletIcon className="size-4 text-muted-foreground" />
                  {toman(order.total)}
                </p>
                <p className="mt-1.5 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                  <CalendarBlankIcon className="size-3.5" />
                  {order.created_at}
                </p>
              </div>
            </div>
            <p className="mt-4 flex items-start gap-2 border-t pt-4 text-sm leading-7">
              <MapPinIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <span>{place || "—"}</span>
            </p>
            {order.postal_code || order.tracking_code ? (
              <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 ps-6 text-xs text-muted-foreground">
                {order.postal_code ? (
                  <span className="inline-flex items-center gap-1.5">
                    <HashIcon className="size-3.5" />
                    <span className="font-medium text-foreground">{order.postal_code}</span>
                  </span>
                ) : null}
                {order.tracking_code ? (
                  <span className="inline-flex items-center gap-1.5 break-all">
                    <BarcodeIcon className="size-3.5 shrink-0" />
                    <span className="font-medium text-foreground">{order.tracking_code}</span>
                  </span>
                ) : null}
              </p>
            ) : null}
          </section>

          <div className="flex flex-col gap-2.5">
            {order.items?.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
                {item.image ? (
                  <Image src={mediaUrl(item.image)} alt={item.title || "کالا"} width={64} height={64} className="size-16 rounded-lg border object-contain" />
                ) : (
                  <div className="size-16 rounded-lg border bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.title || "کالا"}</p>
                  {item.variety ? <p className="mt-1 text-xs text-muted-foreground">{item.variety}</p> : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.quantity} عدد · موجودی {item.stock} · {toman(item.line_total)}
                  </p>
                  {item.rejection_reason ? (
                    <p className="mt-1 text-xs font-medium text-destructive">علت رد: {item.rejection_reason}</p>
                  ) : null}
                </div>
                {order.status === "paid" && item.status !== "rejected" ? (
                  rejecting === item.id ? (
                    <form className="flex w-full flex-col gap-2 sm:w-56" onSubmit={(e) => onRejectItem(e, item.id)}>
                      <select value={reason} onChange={(e) => setReason(e.target.value)} className="h-9 rounded-lg border bg-transparent px-2 text-sm">
                        {REJECT_REASONS.map((itemReason) => (
                          <option key={itemReason} value={itemReason}>{itemReason}</option>
                        ))}
                      </select>
                      {reason === "دلایل دیگر" || reason === "نیازمند تماس" ? (
                        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="توضیح" className="h-9 rounded-lg border bg-transparent px-2 text-sm outline-none" />
                      ) : null}
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" variant="destructive" disabled={busy}>رد کالا</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setRejecting(0)}>انصراف</Button>
                      </div>
                    </form>
                  ) : (
                    <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={() => setRejecting(item.id)}>
                      رد کالا
                    </Button>
                  )
                ) : (
                  <span className="text-xs text-muted-foreground">{item.status_label}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {order.status === "paid" && active.length === 0 ? (
              <Button disabled={busy} variant="destructive" onClick={() => run(() => postOrder(id, "reject"))}>
                رد سفارش
              </Button>
            ) : null}
            {order.status === "paid" && active.length > 0 ? (
              <Button disabled={busy} onClick={() => run(() => postOrder(id, "approve"))}>
                تایید سفارش
              </Button>
            ) : null}
            {order.status === "processing" ? (
              <Button disabled={busy} onClick={() => run(() => postOrder(id, "status", { status: "ready_for_shipping" }))}>
                آماده ارسال
              </Button>
            ) : null}
          </div>

          {order.status === "ready_for_shipping" ? (
            <form onSubmit={onShip} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <p className="text-sm font-semibold">ثبت ارسال</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-muted-foreground">تاریخ تحویل به پست</span>
                  <input type="datetime-local" required value={handover} onChange={(e) => setHandover(e.target.value)} className="h-10 rounded-xl border bg-transparent px-3" />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-muted-foreground">کد رهگیری</span>
                  <input required value={tracking} onChange={(e) => setTracking(e.target.value)} className="h-10 rounded-xl border bg-transparent px-3 outline-none" />
                </label>
              </div>
              <Button type="submit" className="w-fit" disabled={busy}>ثبت و ارسال</Button>
            </form>
          ) : null}
        </>
      )}
    </div>
  )
}
