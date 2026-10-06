"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { BuildingsIcon, CheckCircleIcon, PlusIcon, StarIcon, TrashIcon, UserIcon } from "@phosphor-icons/react"
import { TierTrack } from "@/components/access/TierTrack"
import { UploadField } from "@/components/access/UploadField"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ensureSession } from "@/lib/auth"
import {
  COMPANY_TYPES,
  silverError,
  submitSilver,
  type SellerKind,
  type Signatory,
} from "@/lib/register"
import { GoldShop } from "@/components/access/GoldShop"
import { fetchStore, updateStore } from "@/lib/store"
import { tierAt } from "@/lib/tier"
import { useSeller } from "@/lib/use-seller"
import { cn } from "@/lib/utils"

const field =
  "h-11 w-full rounded-xl border border-border bg-muted px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function AccessScreen() {
  const user = useSeller()
  const tier = tierAt(user?.tier)
  const [editing, setEditing] = useState(false)
  const done = tier === "gold" && Boolean(user?.gold_done)
  const showSilver = Boolean(user) && ((tier === "bronze" && user.bronze_done) || (tier === "silver" && editing))

  useEffect(() => {
    ensureSession()
  }, [])

  useEffect(() => {
    if (!showSilver || window.location.hash !== "#upload") return
    document.getElementById("upload")?.scrollIntoView({ block: "start" })
  }, [showSilver])

  if (!user) return null

  const showBronze = tier === "bronze" && !user.bronze_done

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{done ? "سطح طلا" : "سطح حساب"}</h1>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          {done ? "ثبت‌نام فروشگاه کامل شده است." : "پنل از همین حالا باز است. سطح آخر طلاست: پروفایل و آدرس."}
        </p>
      </div>
      <TierTrack current={tier} />
      {done ? (
        <Card className="overflow-hidden rounded-3xl bg-[#f3f6ec] ring-primary/20">
          <CardContent className="flex flex-col items-center gap-5 px-6 py-12 text-center">
            <span className="grid size-20 place-items-center rounded-full bg-white shadow-[0_10px_30px_rgba(128,173,1,0.18)]">
              <StarIcon className="size-10 text-[#e0b84a]" weight="fill" />
            </span>
            <div className="max-w-sm">
              <p className="text-xs font-bold text-primary">ستاره طلا</p>
              <h2 className="mt-2 text-2xl font-bold">ثبت‌نام کامل شد</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                فروشگاه آماده‌ست و محصولات باز است. از این‌جا کالا بگذارید.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/products" className={cn(buttonVariants(), "h-11 rounded-xl px-5")}>
                گذاشتن محصول
              </Link>
              <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-xl bg-white px-5")}>
                داشبورد
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
      {showBronze ? <BronzeFinish /> : null}
      {tier === "silver" && !editing ? <Waiting onEdit={() => setEditing(true)} /> : null}
      {showSilver ? <SilverForm sellerId={user.id} legal={Boolean(user.is_legal)} onDone={() => setEditing(false)} /> : null}
      {tier === "gold" && !done ? <GoldShop /> : null}
    </div>
  )
}

function BronzeFinish() {
  const [logo, setLogo] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSave(event: FormEvent) {
    event.preventDefault()
    if (!logo) {
      setError("لوگو یا عکس پروفایل را بگذارید")
      return
    }
    setLoading(true)
    setError("")
    try {
      const store = await fetchStore()
      const body = new FormData()
      body.append("logo", logo)
      await updateStore(store.id, body)
      await ensureSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره لوگو انجام نشد")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl ring-foreground/5">
      <CardContent className="flex flex-col gap-4 pt-(--card-spacing)">
        <p className="text-sm leading-7 text-muted-foreground">لوگو را بگذارید. سطح شما برنز می‌ماند تا کارت ملی را بفرستید.</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <form onSubmit={onSave} className="flex flex-col gap-4">
          <UploadField label="لوگو یا عکس پروفایل" file={logo} onPick={setLogo} />
          <Button type="submit" disabled={loading} className="h-11 rounded-xl">
            {loading ? "در حال ذخیره..." : "ذخیره لوگو"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function Waiting({ onEdit }: { onEdit: () => void }) {
  return (
    <Card className="rounded-2xl ring-foreground/5">
      <CardContent className="flex flex-col items-start gap-3 pt-(--card-spacing)">
        <CheckCircleIcon className="size-10 text-primary" weight="duotone" />
        <h2 className="text-lg font-bold">مدارک رسید</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          سطح شما نقره است تا مدیر تایید کند. بعد از تایید، پروفایل و بنر و آدرس را در طلا کامل می‌کنید.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className={cn(buttonVariants(), "h-11 rounded-xl px-4")}>
            رفتن به داشبورد
          </Link>
          <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={onEdit}>
            اصلاح مدارک
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SilverForm({ sellerId, legal, onDone }: { sellerId?: number; legal: boolean; onDone: () => void }) {
  const [kind, setKind] = useState<SellerKind>(legal ? "legal" : "genuine")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [nationalCode, setNationalCode] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyType, setCompanyType] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [people, setPeople] = useState<Signatory[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function patchPerson(index: number, patch: Partial<Signatory>) {
    setPeople((list) => list.map((person, item) => (item === index ? { ...person, ...patch } : person)))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const message = silverError({
      kind,
      firstName,
      lastName,
      nationalCode,
      companyName,
      companyType,
      registrationNumber,
      nationalId,
      front,
      back,
      people,
    })
    if (message || !sellerId || !front || !back) {
      setError(message || "شناسه حساب پیدا نشد. یک بار خارج شوید و دوباره وارد شوید.")
      return
    }
    const ready = people.flatMap((person) =>
      person.front && person.back ? [{ name: person.name, front: person.front, back: person.back }] : []
    )
    setLoading(true)
    setError("")
    const result = await submitSilver({
      sellerId,
      kind,
      firstName,
      lastName,
      nationalCode,
      companyName,
      companyType,
      registrationNumber,
      nationalId,
      front,
      back,
      people: ready,
    })
    if (!result.ok) {
      setLoading(false)
      setError(result.message)
      return
    }
    await ensureSession()
    setLoading(false)
    onDone()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Card className="rounded-2xl ring-foreground/5">
        <CardContent className="flex flex-col gap-4 pt-(--card-spacing)">
          <div>
            <h2 className="text-lg font-bold">آپلود کارت ملی</h2>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">
              عکس رو و پشت را در کادرهای سبز بگذارید. بعد نام را بنویسید و دکمه پایین را بزنید تا به نقره بروید.
            </p>
          </div>
          <div id="upload" className="scroll-mt-6 grid gap-3 sm:grid-cols-2">
            <UploadField label="روی کارت ملی" file={front} onPick={setFront} contain />
            <UploadField label="پشت کارت ملی" file={back} onPick={setBack} contain />
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
            {(
              [
                ["genuine", "حقیقی", UserIcon],
                ["legal", "حقوقی", BuildingsIcon],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                className={cn(
                  "flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold",
                  kind === value ? "bg-white shadow-sm" : "text-muted-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
          {error ? <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          {kind === "legal" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-xs font-semibold text-muted-foreground">نام شرکت</span>
                <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} className={field} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">نوع شرکت</span>
                <select value={companyType} onChange={(event) => setCompanyType(event.target.value)} className={field}>
                  <option value="">انتخاب</option>
                  {COMPANY_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">شماره ثبت</span>
                <input value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value)} className={field} />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-xs font-semibold text-muted-foreground">شناسه ملی</span>
                <input value={nationalId} onChange={(event) => setNationalId(event.target.value)} inputMode="numeric" className={field} />
              </label>
            </div>
          ) : (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">کد ملی</span>
              <input value={nationalCode} onChange={(event) => setNationalCode(event.target.value)} inputMode="numeric" className={field} />
            </label>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">{kind === "legal" ? "نام مدیرعامل" : "نام"}</span>
              <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">نام خانوادگی</span>
              <input value={lastName} onChange={(event) => setLastName(event.target.value)} className={field} />
            </label>
          </div>
        </CardContent>
      </Card>

      {kind === "legal"
        ? people.map((person, index) => (
            <Card key={index} className="rounded-2xl ring-foreground/5">
              <CardContent className="flex flex-col gap-3 pt-(--card-spacing)">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">صاحب امضا {(index + 2).toLocaleString("fa-IR")}</p>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="حذف"
                    onClick={() => setPeople((list) => list.filter((_, item) => item !== index))}
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
                <input
                  value={person.name}
                  onChange={(event) => patchPerson(index, { name: event.target.value })}
                  placeholder="نام و نام خانوادگی"
                  className={field}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <UploadField label="روی کارت ملی" file={person.front} onPick={(file) => patchPerson(index, { front: file })} contain />
                  <UploadField label="پشت کارت ملی" file={person.back} onPick={(file) => patchPerson(index, { back: file })} contain />
                </div>
              </CardContent>
            </Card>
          ))
        : null}

      {kind === "legal" ? (
        <button
          type="button"
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-dashed text-sm font-semibold text-primary"
          onClick={() => setPeople((list) => [...list, { name: "", front: null, back: null }])}
        >
          <PlusIcon className="size-4" />
          افزودن صاحب امضا
        </button>
      ) : null}

      <div className="sticky bottom-3 z-10">
        <Button type="submit" disabled={loading} className="h-12 w-full rounded-2xl text-[15px] font-semibold shadow-lg">
          {loading ? "در حال ارسال..." : "ثبت کارت ملی"}
        </Button>
      </div>
    </form>
  )
}
