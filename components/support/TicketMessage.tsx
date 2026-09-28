"use client"

import { HeadsetIcon, UserIcon } from "@phosphor-icons/react"
import type { SupportMessage } from "@/lib/support"
import { mediaUrl } from "@/lib/support"

export function TicketMessage({ message }: { message: SupportMessage }) {
  const mine = message.author === "seller"

  return (
    <div className={`flex gap-2.5 ${mine ? "flex-row" : "flex-row-reverse"}`}>
      <div
        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
          mine ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {mine ? <UserIcon className="size-4" weight="bold" /> : <HeadsetIcon className="size-4" weight="bold" />}
      </div>

      <div className={`flex min-w-0 max-w-[min(100%,28rem)] flex-col gap-1 ${mine ? "items-start" : "items-end"}`}>
        <div className="flex items-center gap-2 px-0.5 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground/80">{mine ? "شما" : "پشتیبانی"}</span>
          <span>·</span>
          <span>{message.created_at}</span>
        </div>

        <div
          className={
            mine
              ? "rounded-2xl rounded-ss-md bg-primary px-3.5 py-2.5 text-primary-foreground shadow-sm"
              : "rounded-2xl rounded-se-md border bg-card px-3.5 py-2.5 shadow-sm"
          }
        >
          <p className="text-[13px] leading-7 whitespace-pre-wrap">{message.text}</p>
          {message.attachments?.map((file) =>
            file.file ? (
              <a
                key={file.id}
                href={mediaUrl(file.file)}
                target="_blank"
                rel="noreferrer"
                className={`mt-2 inline-flex rounded-lg border border-dashed px-2.5 py-1 text-xs ${
                  mine
                    ? "border-primary-foreground/35 text-primary-foreground hover:bg-primary-foreground/10"
                    : "border-border text-primary hover:bg-muted"
                }`}
              >
                دانلود پیوست
              </a>
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}
