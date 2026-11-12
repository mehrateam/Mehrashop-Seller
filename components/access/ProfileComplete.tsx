"use client"

import { useState, type FormEvent } from "react"
import { UploadField } from "@/components/access/UploadField"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ensureSession } from "@/lib/auth"
import { submitSilver } from "@/lib/register"
import { useSeller } from "@/lib/use-seller"

const field =
  "h-11 w-full rounded-xl border border-border bg-muted px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function ProfileComplete() {
  const user = useSeller()
  const [firstName, setFirstName] = useState(user?.first_name ?? "")
  const [lastName, setLastName] = useState(user?.last_name ?? "")
  const [gender, setGender] = useState("")
  const [nationalCode, setNationalCode] = useState("")
  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (!user?.id || user.docs_sent) return null

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const sellerId = user?.id
    if (!sellerId) return
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setError("نام و نام خانوادگی را کامل بنویسید")
      return
    }
    if (gender !== "male" && gender !== "female") {
      setError("جنسیت را انتخاب کنید")
      return
    }
    if (!/^\d{10}$/.test(nationalCode.replace(/\D/g, ""))) {
      setError("کد ملی باید ۱۰ رقم باشد")
      return
    }
    if (!front || !back) {
      setError("روی و پشت کارت ملی را بگذارید")
      return
    }
    setLoading(true)
    setError("")
    const result = await submitSilver({
      sellerId,
      kind: "genuine",
      firstName,
      lastName,
      nationalCode,
      companyName: "",
      companyType: "",
      registrationNumber: "",
      nationalId: "",
      front,
      back,
      people: [],
      gender,
    })
    if (!result.ok) {
      setLoading(false)
      setError(result.message)
      return
    }
    await ensureSession()
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="rounded-2xl ring-foreground/5">
        <CardContent className="flex flex-col gap-4 pt-(--card-spacing)">
          <div>
            <h2 className="text-lg font-bold">تکمیل مشخصات فروشنده</h2>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">
              این فرم فقط برای حساب‌های ناقص است و فروش را قفل نمی‌کند.
            </p>
          </div>
          {error ? <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <UploadField label="روی کارت ملی" file={front} onPick={setFront} contain />
            <UploadField label="پشت کارت ملی" file={back} onPick={setBack} contain />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">نام</span>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">نام خانوادگی</span>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">جنسیت</span>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={field}>
                <option value="">انتخاب</option>
                <option value="male">مرد</option>
                <option value="female">زن</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">کد ملی</span>
              <input value={nationalCode} onChange={(e) => setNationalCode(e.target.value)} inputMode="numeric" className={field} />
            </label>
          </div>
          <Button type="submit" disabled={loading} className="h-11 rounded-xl">
            {loading ? "در حال ذخیره..." : "ذخیره مشخصات"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
