"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CalendarBlankIcon,
  CaretLeftIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@phosphor-icons/react"
import { SORTS, STATUS_CLASS, STATUS_TABS, fetchOrders, toman, type SellerOrder } from "@/lib/orders"

export function OrderList() {
  const router = useRouter()
  const params = useSearchParams()
  const tab = params.get("tab") || "all"
  const sort = params.get("sort") || "newest"
  const q = params.get("q") || ""
  const queryKey = `${tab}:${sort}:${q}`
  const [draft, setDraft] = useState(q)
  const [draftQuery, setDraftQuery] = useState(q)
  if (q !== draftQuery) {
    setDraftQuery(q)
    setDraft(q)
  }
  const [data, setData] = useState<{
    key: string
    orders: SellerOrder[]
    counts: Record<string, number>
  } | null>(null)
  const [error, setError] = useState("")
  const ready = data?.key === queryKey
  const orders = ready ? data.orders : null
  const counts = ready ? data.counts : {}

  useEffect(() => {
    let alive = true
    fetchOrders(tab, sort, q)
      .then((res) => {
        if (!alive) return
        setData({ key: queryKey, orders: res.orders, counts: res.counts })
        setError("")
      })
      .catch((err: unknown) => {
        if (!alive) return
        setData({ key: queryKey, orders: [], counts: {} })
        setError(err instanceof Error ? err.message : "خطا در دریافت سفارش‌ها")
      })
    return () => {
      alive = false
    }
  }, [tab, sort, q, queryKey])

  function setQuery(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    router.replace(`/orders?${next}`)
  }

  function onSearch(e: FormEvent) {
    e.preventDefault()
    setQuery("q", draft.trim())
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold tracking-tight">سفارش‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">پیگیری و انجام سفارش‌های فروشگاه</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-10 items-center gap-2 rounded-xl border bg-card px-3 text-sm shadow-sm">
          <span className="text-muted-foreground">وضعیت</span>
          <select
            value={tab}
            onChange={(e) => setQuery("tab", e.target.value === "all" ? "" : e.target.value)}
            className="bg-transparent font-medium outline-none"
          >
            {STATUS_TABS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
                {counts[item.id] != null ? ` (${counts[item.id]})` : ""}
              </option>
            ))}
          </select>
        </label>
        <form onSubmit={onSearch} className="flex h-10 min-w-48 flex-1 items-center gap-2 rounded-xl border bg-card px-3 text-sm shadow-sm sm:max-w-xs">
          <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="کد، نام یا شهر"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </form>
        <label className="flex h-10 items-center gap-2 rounded-xl border bg-card px-3 text-sm shadow-sm">
          <span className="text-muted-foreground">مرتب‌سازی</span>
          <select
            value={sort}
            onChange={(e) => setQuery("sort", e.target.value === "newest" ? "" : e.target.value)}
            className="bg-transparent font-medium outline-none"
          >
            {SORTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {orders === null ? (
        <div className="flex h-36 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
          در حال بارگذاری...
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card px-5 py-14 text-center">
          <ShoppingCartIcon className="size-8 text-muted-foreground/50" />
          <p className="font-medium">سفارشی یافت نشد</p>
          <p className="text-sm text-muted-foreground">با این فیلتر سفارشی وجود ندارد</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders?order=${order.id}`}
              className="group flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold leading-7">سفارش #{order.id}</h2>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <UserIcon className="size-3.5" />
                    {order.customer_name}
                  </p>
                </div>
                <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[order.status] || STATUS_CLASS.cancelled}`}>
                  {order.status_label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon className="size-3.5" />
                  {order.province}، {order.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarBlankIcon className="size-3.5" />
                  {order.created_at}
                </span>
                <span className="font-semibold text-foreground">{toman(order.total)}</span>
              </div>

              <div className="flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted-foreground">آخرین تغییر: {order.updated_at || "—"}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  مشاهده
                  <CaretLeftIcon className="size-3.5" weight="bold" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
