import Link from "next/link"
import { HeadsetIcon, PlusIcon } from "@phosphor-icons/react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { STATUS_CLASS, type SupportTicket } from "@/lib/support"

export function DashboardTickets({
  ready,
  tickets,
  counts,
}: {
  ready: boolean
  tickets: SupportTicket[]
  counts: Record<string, number>
}) {
  const summary = [
    counts.open ? `${counts.open.toLocaleString("fa-IR")} باز` : "",
    counts.in_review ? `${counts.in_review.toLocaleString("fa-IR")} در بررسی` : "",
    counts.answered ? `${counts.answered.toLocaleString("fa-IR")} پاسخ‌داده‌شده` : "",
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <Card className="h-full rounded-2xl ring-foreground/5">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>تیکت‌های پشتیبانی</CardTitle>
          <CardDescription>{!ready ? "در حال بارگذاری" : summary || "پیام بازی ندارید"}</CardDescription>
        </div>
        <CardAction className="flex gap-2">
          <Link href="/support/new" className={buttonVariants({ size: "sm" })}>
            <PlusIcon data-icon="inline-start" />
            تیکت جدید
          </Link>
          <Link href="/support" className={buttonVariants({ variant: "outline", size: "sm" })}>
            همه
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        {!ready ? (
          <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
        ) : tickets.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HeadsetIcon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">صندوق پشتیبانی خلوت است</p>
              <p className="text-xs text-muted-foreground">هر وقت سوالی بود، از همین‌جا بپرسید.</p>
            </div>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/support?ticket=${ticket.id}`}
              className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{ticket.title}</p>
                <p className="text-xs text-muted-foreground">
                  #{ticket.id}
                  {ticket.group?.name ? ` · ${ticket.group.name}` : ""}
                  {ticket.updated_at ? ` · ${ticket.updated_at}` : ""}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold ${STATUS_CLASS[ticket.status] || STATUS_CLASS.closed}`}
              >
                {ticket.status_label}
              </span>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}
