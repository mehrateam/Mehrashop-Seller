"use client"

import { useEffect, useState, type FormEvent } from "react"
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordOtp, resetForgottenPassword, verifyPasswordOtp } from "@/lib/auth"
import { digits, normalizePhone } from "@/lib/register"

const field =
  "h-12 rounded-xl border-border bg-card px-3.5 text-sm focus-visible:border-primary focus-visible:ring-primary/15"

export function ForgotPassword({
  account,
  onBack,
  onReset,
}: {
  account: string
  onBack: () => void
  onReset: () => void
}) {
  const preset = normalizePhone(account)
  const [step, setStep] = useState<"phone" | "code" | "password">("phone")
  const [phone, setPhone] = useState(/^09\d{9}$/.test(preset) ? preset : "")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [repeat, setRepeat] = useState("")
  const [show, setShow] = useState(false)
  const [token, setToken] = useState("")
  const [wait, setWait] = useState(0)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (wait <= 0) return
    const timer = window.setInterval(() => setWait((left) => (left > 0 ? left - 1 : 0)), 1000)
    return () => window.clearInterval(timer)
  }, [wait])

  async function sendCode(target: string) {
    const mobile = normalizePhone(target)
    if (!/^09\d{9}$/.test(mobile)) {
      setError("شماره موبایل را با ۰۹ وارد کنید")
      return
    }
    setError("")
    setLoading(true)
    try {
      setWait(await requestPasswordOtp(mobile))
      setPhone(mobile)
      setCode("")
      setStep("code")
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد")
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (step === "phone") {
      await sendCode(phone)
      return
    }

    if (step === "code") {
      const pin = digits(code).replace(/\D/g, "")
      if (!/^\d{6}$/.test(pin)) {
        setError("کد ۶ رقمی پیامک را وارد کنید")
        return
      }
      setError("")
      setLoading(true)
      try {
        setToken(await verifyPasswordOtp(phone, pin))
        setStep("password")
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطایی رخ داد")
      } finally {
        setLoading(false)
      }
      return
    }

    if (password.length < 8) {
      setError("رمز عبور حداقل ۸ کاراکتر است")
      return
    }
    if (password !== repeat) {
      setError("رمز عبور و تکرار آن یکسان نیستند")
      return
    }
    setError("")
    setLoading(true)
    try {
      await resetForgottenPassword(token, password, repeat)
      onReset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد")
    } finally {
      setLoading(false)
    }
  }

  const hint =
    step === "phone"
      ? "شماره موبایل حساب را وارد کنید تا کد بازیابی پیامک شود."
      : step === "code"
        ? `کد تأیید برای شماره ${phone} ارسال شد.`
        : "رمز عبور جدید انتخاب کنید."

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="border-t border-border">
          <h2 className="-mt-px inline-block border-t-2 border-primary py-3 text-[15px] font-bold text-primary">
            بازیابی رمز عبور
          </h2>
        </div>
        <p className="text-[13px] leading-6 text-muted-foreground">{hint}</p>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {step === "phone" ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="resetPhone" className="sr-only">
            شماره موبایل
          </Label>
          <Input
            id="resetPhone"
            name="phone"
            type="text"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="لطفا شماره موبایل خود را وارد کنید"
            autoComplete="tel"
            required
            autoFocus
            className={field}
          />
        </div>
      ) : null}

      {step === "code" ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="resetCode" className="sr-only">
            کد تأیید
          </Label>
          <Input
            id="resetCode"
            name="code"
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="کد تأیید را وارد کنید"
            autoComplete="one-time-code"
            required
            autoFocus
            className={field}
          />
          <button
            type="button"
            disabled={wait > 0 || loading}
            className="w-fit text-xs font-medium text-primary disabled:text-muted-foreground"
            onClick={() => sendCode(phone)}
          >
            {wait > 0 ? `ارسال مجدد تا ${wait} ثانیه` : "ارسال مجدد"}
          </button>
        </div>
      ) : null}

      {step === "password" ? (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Label htmlFor="newPassword" className="sr-only">
              رمز عبور
            </Label>
            <Input
              id="newPassword"
              name="newPassword"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              autoComplete="new-password"
              required
              autoFocus
              className={`${field} pe-12`}
            />
            <button
              type="button"
              onClick={() => setShow((open) => !open)}
              aria-label={show ? "پنهان کردن رمز" : "نمایش رمز"}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {show ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
            </button>
          </div>
          <div className="relative">
            <Label htmlFor="repeatPassword" className="sr-only">
              تکرار رمز عبور
            </Label>
            <Input
              id="repeatPassword"
              name="repeatPassword"
              type={show ? "text" : "password"}
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              placeholder="تکرار رمز عبور"
              autoComplete="new-password"
              required
              className={field}
            />
          </div>
        </div>
      ) : null}

      <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-sm font-semibold shadow-none">
        {loading ? "لطفا صبر کنید..." : "تایید"}
      </Button>

      <button type="button" onClick={onBack} className="text-center text-sm text-primary underline">
        بازگشت به صفحه ورود
      </button>
    </form>
  )
}
