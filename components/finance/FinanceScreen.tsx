"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarBlankIcon, MagnifyingGlassIcon, WalletIcon } from "@phosphor-icons/react"
import { Card, CardContent } from "@/components/ui/card"
import { KINDS, SORTS, fetchFinance, type Sale } from "@/lib/finance"
import { STATUS_CLASS, toman } from "@/lib/orders"

export function FinanceScreen() {
  const router = useRouter()
  const params = useSearchParams()
  const kind = params.get("kind") || "all"
  const sort = params.get("sort") || "newest"
  const q = params.get("q") || ""
  const queryKey = `${kind}:${sort}:${q}`
  const [draft, setDraft] = useState(q)
  const [draftQuery, setDraftQuery] = useState(q)
  if (q !== draftQuery) {
    setDraftQuery(q)
    setDraft(q)
  }
  const [data, setData] = useState<{
    key: string
    summary: { sales_total: number; sales_count: number; month_total: number; month_count: number }
    transactions: Sale[]
    counts: Record<string, number>
    page: number
    pages: number
  } | null>(null)
  const [error, setError] = useState("")
  const [more, setMore] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const ready = data?.key === queryKey
  const rows = ready ? data.transactions : null
  const counts = ready ? data.counts : {}
  const summary = ready ? data.summary : null
  const page = ready ? data.page : 0
  const pages = ready ? data.pages : 0
  const showingVoid = kind === "void"

  useEffect(() => {
    let alive = true
    fetchFinance(kind, sort, q)
      .then((res) => {
        if (!alive) return
        setData({ key: queryKey, ...res })
        setError("")
      })
      .catch((err: unknown) => {
        if (!alive) return
        setData(null)
        setError(err instanceof Error ? err.message : "خطا در دریافت تراکنش‌ها")
      })
    return () => {
      alive = false
    }
  }, [kind, sort, q, queryKey])

  useEffect(() => {
    const node = endRef.current
    if (!node || !ready || page >= pages) return
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer.disconnect()
      setMore(true)
      fetchFinance(kind, sort, q, page + 1)
        .then((res) => {
          setData((prev) => {
            if (!prev || prev.key !== queryKey) return prev
            const seen = new Set(prev.transactions.map((row) => row.id))
            return {
              ...prev,
              transactions: [...prev.transactions, ...res.transactions.filter((row) => !seen.has(row.id))],
              page: res.page,
              pages: res.pages,
            }
          })
          setError("")
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "خطا در دریافت تراکنش‌ها")
        })
        .finally(() => setMore(false))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [ready, page, pages, kind, sort, q, queryKey])

  function setQuery(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    router.replace(`/finance?${next}`)
  }

  function onSearch(e: FormEvent) {
    e.preventDefault()
    setQuery("q", draft.trim())
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold tracking-tight">تراکنش‌های مالی</h1>
        <p className="mt-1 text-sm text-muted-foreground">پرداخت‌های ثبت‌شده فروشگاه</p>
      </div>

      <Card className="rounded-2xl ring-foreground/5">
        <CardContent className="grid gap-5 pt-(--card-spacing) sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">مجموع فروش</p>
            <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">
              {summary ? toman(summary.sales_total) : "—"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {summary ? `${summary.sales_count.toLocaleString("fa-IR")} سفارش پرداخت‌شده` : "در حال محاسبه"}
            </p>
          </div>
          <div className="sm:border-s sm:ps-6">
            <p className="text-sm font-semibold text-muted-foreground">این ماه</p>
            <p className="mt-2 text-xl font-bold tracking-tight tabular-nums">
              {summary ? toman(summary.month_total) : "—"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {summary
                ? `${summary.month_count.toLocaleString("fa-IR")} سفارش، بخشی از مجموع`
                : "در حال محاسبه"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-10 items-center gap-2 rounded-xl border bg-card px-3 text-sm shadow-sm">
          <span className="text-muted-foreground">نمایش</span>
          <select
            value={kind === "void" ? "void" : "sales"}
            onChange={(e) => setQuery("kind", e.target.value === "sales" ? "" : e.target.value)}
            className="bg-transparent font-medium outline-none"
          >
            {KINDS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
                {counts[item.id] != null ? ` (${Number(counts[item.id]).toLocaleString("fa-IR")})` : ""}
              </option>
            ))}
          </select>
        </label>
        <form onSubmit={onSearch} className="flex h-10 min-w-48 flex-1 items-center gap-2 rounded-xl border bg-card px-3 text-sm shadow-sm sm:max-w-xs">
          <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="کد سفارش یا نام مشتری"
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

      {showingVoid ? (
        <p className="text-sm text-muted-foreground">این فهرست در مجموع فروش حساب نشده است.</p>
      ) : null}

      {rows === null && !error ? (
        <div className="flex h-36 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
          در حال بارگذاری...
        </div>
      ) : rows && rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card px-5 py-14 text-center">
          <WalletIcon className="size-8 text-muted-foreground/50" />
          <p className="font-medium">{showingVoid ? "لغو یا مرجوعی نیست" : "فروش پرداخت‌شده‌ای نیست"}</p>
          <p className="text-sm text-muted-foreground">
            {showingVoid ? "سفارش لغوشده‌ای برای این جستجو نیست" : "بعد از پرداخت مشتری، مبلغ فروش اینجا دیده می‌شود"}
          </p>
        </div>
      ) : rows ? (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="hidden grid-cols-[minmax(0,1.4fr)_9rem_8.5rem_11rem] gap-4 border-b px-5 py-3 text-xs font-semibold text-muted-foreground sm:grid">
            <span>سفارش</span>
            <span>تاریخ</span>
            <span>وضعیت</span>
            <span className="text-end">مبلغ</span>
          </div>
          {rows.map((row) => (
            <Link
              key={row.id}
              href={`/orders?order=${row.id}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b px-4 py-4 transition-colors last:border-b-0 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:grid-cols-[minmax(0,1.4fr)_9rem_8.5rem_11rem] sm:px-5"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold">
                  سفارش #{row.id}
                  <span className="font-normal text-muted-foreground"> · {row.customer_name}</span>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2 sm:hidden">
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[row.status] || STATUS_CLASS.cancelled}`}>
                    {row.status_label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarBlankIcon className="size-3.5" />
                    {row.created_at}
                  </span>
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  کالا {toman(row.subtotal)}
                  <span className="px-1">·</span>
                  ارسال {toman(row.shipping_cost)}
                </p>
              </div>
              <p className="hidden text-sm text-muted-foreground sm:block">{row.created_at}</p>
              <span className={`hidden w-fit rounded-lg px-2.5 py-1 text-xs font-semibold sm:inline-flex ${STATUS_CLASS[row.status] || STATUS_CLASS.cancelled}`}>
                {row.status_label}
              </span>
              <p className={`text-end text-base font-bold tabular-nums sm:text-[15px] ${showingVoid ? "text-muted-foreground" : ""}`}>
                {toman(row.total)}
              </p>
            </Link>
          ))}
          {page < pages ? (
            <div ref={endRef} className="flex h-14 items-center justify-center text-sm text-muted-foreground">
              {more ? "در حال بارگذاری..." : ""}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
