"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRightIcon, WarningCircleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FILE_ACCEPT, createTicket, fetchGroups, fileError, type SupportGroup } from "@/lib/support"

const notes = [
  "با فونت فارسی، مشکل یا خواسته خود را کامل توضیح دهید.",
  "از توضیح کلی پرهیز کنید؛ پشتیبانی از جزئیات قبلی شما خبر ندارد.",
  "پاسخ زمان می‌برد. درخواست را تکرار نکنید.",
  "برای پاسخ به پیام پشتیبانی، تیکت جدید نسازید و همان تیکت را ادامه دهید.",
]

export function CreateTicket() {
  const router = useRouter()
  const [groups, setGroups] = useState<SupportGroup[]>([])
  const [title, setTitle] = useState("")
  const [groupId, setGroupId] = useState("")
  const [text, setText] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let alive = true
    fetchGroups()
      .then((data) => {
        if (alive) setGroups(data)
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : "خطا در دریافت گروه‌ها")
      })
    return () => {
      alive = false
    }
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !groupId || !text.trim()) {
      setError("عنوان، نوع پشتیبانی و توضیحات الزامی است")
      return
    }
    const invalid = fileError(files)
    if (invalid) {
      setError(invalid)
      return
    }
    const body = new FormData()
    body.append("title", title.trim())
    body.append("group_id", groupId)
    body.append("text", text.trim())
    files.forEach((file) => body.append("files", file))
    setError("")
    setLoading(true)
    try {
      const ticket = await createTicket(body)
      router.replace(`/support?ticket=${ticket.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت تیکت ناموفق بود")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div>
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRightIcon className="size-4" />
          تیکت‌های پشتیبانی
        </Link>
        <h1 className="mt-2 text-lg font-bold tracking-tight">ایجاد تیکت</h1>
      </div>

      <div className="flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3.5 text-sm leading-7 text-amber-950">
        <WarningCircleIcon className="mt-0.5 size-5 shrink-0 text-amber-600" weight="fill" />
        <ul className="space-y-1">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
        {error ? (
          <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-[13px] font-semibold">
              موضوع تیکت
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="موضوع را در چند کلمه بنویسید"
              className="h-10 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="group" className="text-[13px] font-semibold">
              نوع پشتیبانی
            </Label>
            <select
              id="group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="h-10 rounded-xl border bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
            >
              <option value="">انتخاب کنید</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="text" className="text-[13px] font-semibold">
            توضیحات
          </Label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="مشکل یا درخواست خود را کامل توضیح دهید."
            className="min-h-48 w-full rounded-xl border px-3.5 py-3 text-sm leading-7 outline-none focus-visible:border-ring"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="files" className="text-[13px] font-semibold">
            فایل ضمیمه
          </Label>
          <Input
            id="files"
            type="file"
            multiple
            accept={FILE_ACCEPT}
            className="h-10 rounded-xl"
            onChange={(e) => {
              const next = Array.from(e.target.files ?? [])
              const invalid = fileError(next)
              if (invalid) {
                setError(invalid)
                e.target.value = ""
                setFiles([])
                return
              }
              setFiles(next)
            }}
          />
          {files.length ? <p className="text-xs text-muted-foreground">{files.length} فایل انتخاب شد</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" size="lg" className="h-10 rounded-xl px-5" onClick={() => router.push("/support")}>
            انصراف
          </Button>
          <Button type="submit" size="lg" className="h-10 rounded-xl px-5" disabled={loading}>
            {loading ? "در حال ارسال..." : "ارسال تیکت"}
          </Button>
        </div>
      </form>
    </div>
  )
}
