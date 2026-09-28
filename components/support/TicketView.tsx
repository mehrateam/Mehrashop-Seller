"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  PaperclipIcon,
  SealCheckIcon,
  SealWarningIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { TicketMessage } from "@/components/support/TicketMessage"
import {
  FILE_ACCEPT,
  STATUS_CLASS,
  fetchTicket,
  fileError,
  postTicket,
  replyTicket,
  type SupportTicket,
} from "@/lib/support"

export function TicketView({ id }: { id: string }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [loadedId, setLoadedId] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [text, setText] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const loading = loadedId !== id

  useEffect(() => {
    let alive = true
    fetchTicket(id)
      .then((data) => {
        if (!alive) return
        setTicket(data)
        setLoadedId(id)
        setError("")
      })
      .catch((err: unknown) => {
        if (!alive) return
        setTicket(null)
        setLoadedId(id)
        setError(err instanceof Error ? err.message : "تیکت یافت نشد")
      })
    return () => {
      alive = false
    }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [ticket?.messages?.length])

  async function run(task: () => Promise<SupportTicket>) {
    setError("")
    setBusy(true)
    try {
      setTicket(await task())
    } catch (err) {
      setError(err instanceof Error ? err.message : "عملیات ناموفق بود")
    } finally {
      setBusy(false)
    }
  }

  async function onReply(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) {
      setError("متن پاسخ را وارد کنید")
      return
    }
    const invalid = fileError(files)
    if (invalid) {
      setError(invalid)
      return
    }
    const body = new FormData()
    body.append("text", text.trim())
    files.forEach((file) => body.append("files", file))
    setError("")
    setBusy(true)
    try {
      setTicket(await replyTicket(id, body))
      setText("")
      setFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال پاسخ ناموفق بود")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
        در حال بارگذاری تیکت...
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex flex-col gap-3">
        <Link href="/support" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowRightIcon className="size-4" />
          بازگشت
        </Link>
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error || "تیکت یافت نشد"}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRightIcon className="size-4" />
          تیکت‌های پشتیبانی
        </Link>
        <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[ticket.status] || STATUS_CLASS.closed}`}>
          {ticket.status_label}
        </span>
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-muted/30 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-7 sm:text-[17px]">{ticket.title}</h1>
            <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>#{ticket.id}</span>
              {ticket.group?.name ? <span>{ticket.group.name}</span> : null}
              <span>{ticket.created_at}</span>
            </p>
          </div>
          {ticket.is_closed ? (
            <Button
              size="lg"
              variant="outline"
              className="h-9 rounded-xl px-4"
              disabled={busy}
              onClick={() => run(() => postTicket(id, "reopen"))}
            >
              بازگشایی تیکت
            </Button>
          ) : (
            <Button
              size="lg"
              variant="outline"
              className="h-9 rounded-xl px-4"
              disabled={busy}
              onClick={() => run(() => postTicket(id, "close"))}
            >
              بستن تیکت
            </Button>
          )}
        </div>

        <div className="flex max-h-[min(560px,58vh)] flex-col gap-4 overflow-y-auto bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,var(--muted)_55%,transparent))] px-4 py-5 sm:px-6">
          {(ticket.messages ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">هنوز پیامی ثبت نشده</p>
          ) : (
            (ticket.messages ?? []).map((message) => <TicketMessage key={message.id} message={message} />)
          )}
          <div ref={bottomRef} />
        </div>

        {ticket.is_closed && !ticket.satisfaction ? (
          <div className="flex flex-wrap items-center gap-2 border-t bg-muted/20 px-4 py-3.5 sm:px-6">
            <span className="text-sm">از پاسخ پشتیبانی راضی بودید؟</span>
            <Button
              size="sm"
              className="h-8 rounded-lg"
              disabled={busy}
              onClick={() => run(() => postTicket(id, "satisfaction", { is_satisfied: true }))}
            >
              <SealCheckIcon weight="bold" />
              راضی
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-lg"
              disabled={busy}
              onClick={() => run(() => postTicket(id, "satisfaction", { is_satisfied: false }))}
            >
              <SealWarningIcon weight="bold" />
              ناراضی
            </Button>
          </div>
        ) : null}

        {ticket.satisfaction ? (
          <p className="border-t bg-muted/20 px-4 py-3 text-sm sm:px-6">
            رضایت ثبت‌شده:{" "}
            <span className="font-semibold">{ticket.satisfaction.is_satisfied ? "راضی" : "ناراضی"}</span>
          </p>
        ) : null}

        {error ? <p className="border-t px-4 py-2 text-sm text-destructive sm:px-6">{error}</p> : null}

        {!ticket.is_closed ? (
          <form onSubmit={onReply} className="border-t bg-card px-4 py-4 sm:px-6">
            <div className="flex gap-2.5">
              <div className="flex shrink-0 flex-col gap-2">
                <Button type="submit" size="icon-lg" className="size-11 rounded-xl" disabled={busy} aria-label="ارسال پاسخ">
                  <PaperPlaneTiltIcon weight="fill" className="size-5" />
                </Button>
                <label className="inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <PaperclipIcon className="size-5" />
                  <input
                    type="file"
                    multiple
                    accept={FILE_ACCEPT}
                    className="hidden"
                    onChange={(e) => {
                      const next = Array.from(e.target.files ?? [])
                      const invalid = fileError(next)
                      if (invalid) {
                        setError(invalid)
                        e.target.value = ""
                        return
                      }
                      setFiles(next)
                    }}
                  />
                </label>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="پاسخ خود را بنویسید..."
                rows={4}
                className="min-h-[5.5rem] w-full resize-y rounded-xl border bg-muted/40 px-3.5 py-3 text-sm leading-6 outline-none transition-colors focus-visible:border-ring focus-visible:bg-background"
              />
            </div>
            {files.length ? (
              <p className="mt-2 text-xs text-muted-foreground">{files.length} فایل برای ارسال انتخاب شد</p>
            ) : null}
          </form>
        ) : null}
      </section>
    </div>
  )
}
