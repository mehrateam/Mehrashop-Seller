"use client"

import { useEffect, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, DownloadSimpleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  REJECT_REASONS,
  STATUS_CLASS,
  downloadInvoice,
  fetchOrder,
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
  const loading = loadedId !== id
  const active = order?.items?.filter((item) => item.status !== "rejected") ?? []

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
            {order ? (
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
          <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:grid-cols-2 sm:p-5">
            <p className="text-sm"><span className="text-muted-foreground">مشتری: </span>{order.customer_name}</p>
            <p className="text-sm"><span className="text-muted-foreground">تلفن: </span>{order.phone || "—"}</p>
            <p className="text-sm"><span className="text-muted-foreground">شهر: </span>{order.province}، {order.city}</p>
            <p className="text-sm"><span className="text-muted-foreground">کد پستی: </span>{order.postal_code || "—"}</p>
            <p className="text-sm sm:col-span-2"><span className="text-muted-foreground">آدرس: </span>{order.address || "—"}</p>
            <p className="text-sm"><span className="text-muted-foreground">تاریخ: </span>{order.created_at}</p>
            <p className="text-sm font-semibold">{toman(order.total)}</p>
            {order.tracking_code ? (
              <p className="text-sm sm:col-span-2"><span className="text-muted-foreground">کد رهگیری: </span>{order.tracking_code}</p>
            ) : null}
          </div>

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
