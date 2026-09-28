"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CalendarBlankIcon,
  CaretLeftIcon,
  FolderIcon,
  PlusIcon,
  TicketIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SORTS, STATUS_CLASS, STATUS_TABS, fetchTickets, type SupportTicket } from "@/lib/support"

export function TicketList() {
  const router = useRouter()
  const params = useSearchParams()
  const tab = params.get("tab") || "all"
  const sort = params.get("sort") || "newest"
  const queryKey = `${tab}:${sort}`
  const [data, setData] = useState<{
    key: string
    tickets: SupportTicket[]
    counts: Record<string, number>
  } | null>(null)
  const [error, setError] = useState("")
  const ready = data?.key === queryKey
  const tickets = ready ? data.tickets : null
  const counts = ready ? data.counts : {}

  useEffect(() => {
    let alive = true
    fetchTickets(tab, sort)
      .then((res) => {
        if (!alive) return
        setData({ key: queryKey, tickets: res.tickets, counts: res.counts })
        setError("")
      })
      .catch((err: unknown) => {
        if (!alive) return
        setData({ key: queryKey, tickets: [], counts: {} })
        setError(err instanceof Error ? err.message : "خطا در دریافت تیکت‌ها")
      })
    return () => {
      alive = false
    }
  }, [tab, sort, queryKey])

  function setQuery(key: string, value: string) {
    const next = new URLSearchParams(params)
    next.set(key, value)
    router.replace(`/support?${next}`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">تیکت‌های پشتیبانی</h1>
          <p className="mt-1 text-sm text-muted-foreground">پیگیری درخواست‌ها و پاسخ پشتیبانی</p>
        </div>
        <Button size="lg" className="h-10 rounded-xl px-4" onClick={() => router.push("/support/new")}>
          <PlusIcon weight="bold" />
          ایجاد تیکت جدید
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-1 shadow-sm">
          {STATUS_TABS.map((item) => {
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setQuery("tab", item.id)}
                className={
                  active
                    ? "shrink-0 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
                    : "shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                }
              >
                {item.label}
                <span className={active ? "ms-1.5 opacity-80" : "ms-1.5 text-muted-foreground/70"}>
                  {counts[item.id] ?? "·"}
                </span>
              </button>
            )
          })}
        </div>

        <label className="flex h-10 items-center gap-2 rounded-xl border bg-card px-3 text-sm shadow-sm">
          <span className="text-muted-foreground">مرتب‌سازی</span>
          <select
            value={sort}
            onChange={(e) => setQuery("sort", e.target.value)}
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

      {tickets === null ? (
        <div className="flex h-36 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
          در حال بارگذاری...
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card px-5 py-14 text-center">
          <TicketIcon className="size-8 text-muted-foreground/50" />
          <p className="font-medium">تیکتی یافت نشد</p>
          <p className="text-sm text-muted-foreground">با این فیلتر تیکتی وجود ندارد</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/support?ticket=${ticket.id}`}
              className="group flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-[15px] font-semibold leading-7">{ticket.title}</h2>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <TicketIcon className="size-3.5" />
                    #{ticket.id}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[ticket.status] || STATUS_CLASS.closed}`}
                >
                  {ticket.status_label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                {ticket.group?.name ? (
                  <span className="inline-flex items-center gap-1.5">
                    <FolderIcon className="size-3.5" />
                    {ticket.group.name}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarBlankIcon className="size-3.5" />
                  {ticket.created_at}
                </span>
              </div>

              <div className="flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted-foreground">آخرین بروزرسانی: {ticket.updated_at || "—"}</span>
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
