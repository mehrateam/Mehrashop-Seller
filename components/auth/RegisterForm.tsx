"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircleIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import { UploadField } from "@/components/access/UploadField"
import { Button } from "@/components/ui/button"
import { login } from "@/lib/auth"
import { bronzeError, checkSellerOtp, classifyAccount, digits, normalizePhone, sendSellerOtp, submitBronze } from "@/lib/register"

const cap = "text-[13px] font-medium text-[#3d4336]"
const box =
  "h-12 w-full rounded-2xl bg-[#f7f8f5] px-4 text-[15px] text-foreground shadow-[0_0_0_1px_#e6eadf] outline-none transition-shadow placeholder:text-[#a8ae9f] focus:bg-white focus:shadow-[0_0_0_1.5px_#80ad01,0_0_0_4px_rgba(128,173,1,0.14)]"

const perks = ["کد تایید با همان پیامک مهراشاپ می‌آید", "بعد از ثبت‌نام وارد پنل می‌شوید", "فقط کالای گیاهی، طبیعی و وگان"]

export function RegisterForm() {
  const router = useRouter()
  const slots = useRef<Array<HTMLInputElement | null>>([])
  const account = useSearchParams().get("account") ?? ""
  const found = classifyAccount(account)
  const [step, setStep] = useState<"form" | "code">("form")
  const [phone, setPhone] = useState(found.phone)
  const [username, setUsername] = useState(found.username)
  const [seenAccount, setSeenAccount] = useState(account)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [logo, setLogo] = useState<File | null>(null)
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [wait, setWait] = useState(0)
  const [sellerId, setSellerId] = useState<number | null>(null)
  const [storeId, setStoreId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  if (seenAccount !== account) {
    setSeenAccount(account)
    if (found.phone) setPhone(found.phone)
    if (found.username) setUsername(found.username)
  }

  useEffect(() => {
    if (wait <= 0) return
    const timer = window.setInterval(() => setWait((left) => (left > 0 ? left - 1 : 0)), 1000)
    return () => window.clearInterval(timer)
  }, [wait])

  useEffect(() => {
    if (step === "code") slots.current[0]?.focus()
  }, [step])

  async function requestCode() {
    const message = bronzeError({ phone, username, password, logo, storeId })
    if (message) {
      setError(message)
      return false
    }
    setError("")
    setLoading(true)
    const sent = await sendSellerOtp(phone)
    setLoading(false)
    if (!sent.ok) {
      setError(sent.message)
      return false
    }
    setWait(sent.retryAfter)
    setCode(["", "", "", "", "", ""])
    setStep("code")
    return true
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (step === "form") {
      await requestCode()
      return
    }
    const pin = digits(code.join(""))
    if (!/^\d{6}$/.test(pin)) {
      setError("کد ۶ رقمی پیامک را وارد کنید")
      return
    }
    setError("")
    setLoading(true)
    const checked = await checkSellerOtp(phone, pin)
    if (!checked.ok) {
      setLoading(false)
      setError(checked.message)
      return
    }
    const result = await submitBronze({ phone, username, password, logo, sellerId, storeId })
    setSellerId(result.sellerId)
    setStoreId(result.storeId)
    if (!result.ok) {
      setLoading(false)
      setError(result.message)
      return
    }
    try {
      await login(normalizePhone(phone), password)
      sessionStorage.setItem("show_welcome_modal", "1")
      router.replace("/access")
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : "حساب ساخته شد. از صفحه ورود داخل شوید.")
    }
  }

  const pin = code.join("")

  return (
    <div className="flex min-h-svh bg-[#f7f8f5]">
      <aside className="sticky top-0 hidden h-svh w-[42%] flex-col justify-between overflow-hidden bg-[#f3f6ec] px-12 py-12 lg:flex xl:w-[46%] xl:px-16">
        <div className="flex max-w-sm flex-col gap-8">
          <Image src="/brand/logo.svg" alt="مهراشاپ" width={345} height={107} className="h-12 w-auto" />
          <div className="flex flex-col gap-3">
            <h1 className="text-[1.85rem] leading-snug font-bold tracking-tight">فروشگاه‌تان را باز کنید</h1>
            <p className="text-sm leading-7 text-muted-foreground">
              نام کاربری و لوگو را بگذارید. کد تایید با پیامک می‌آید و بعد ثبت‌نام تمام می‌شود.
            </p>
          </div>
          <ul className="flex flex-col gap-3.5 text-sm leading-6">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5">
                <CheckCircleIcon className="size-5 shrink-0 text-primary" weight="duotone" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
        <Image
          src="/brand/login-art.svg"
          alt=""
          width={345}
          height={143}
          className="mt-8 h-auto max-h-[46%] w-full max-w-sm object-contain"
        />
      </aside>

      <section className="flex min-w-0 flex-1 justify-center px-5 py-6 sm:px-8 lg:items-center">
        <div className="flex w-full max-w-[440px] flex-col gap-5">
          <header className="flex items-center justify-between">
            <Image src="/brand/logo.svg" alt="مهراشاپ" width={345} height={107} className="h-11 w-auto lg:hidden" />
            <Link
              href="/auth"
              className="ms-auto rounded-full bg-white px-4 py-2 text-sm font-medium text-[#3d4336] shadow-[0_0_0_1px_#e6eadf]"
            >
              ورود
            </Link>
          </header>

          <form onSubmit={onSubmit} className="flex flex-col gap-5 rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_#e6eadf] sm:p-7">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-primary">{step === "form" ? "۱ از ۲ · اطلاعات" : "۲ از ۲ · کد تایید"}</p>
              <h2 className="text-[1.65rem] font-bold tracking-tight">{step === "form" ? "ثبت‌نام" : "کد پیامک"}</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {step === "form"
                  ? "لوگو، نام کاربری و رمز را وارد کنید. کد تایید به موبایل‌تان پیامک می‌شود."
                  : `کد ۶ رقمی به ${normalizePhone(phone)} پیامک شد.`}
              </p>
            </div>

            {error ? (
              <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive">{error}</p>
            ) : null}

            {step === "form" ? (
              <>
                <UploadField label="لوگو یا عکس پروفایل" file={logo} onPick={setLogo} square />

                <label className="flex flex-col gap-1.5">
                  <span className={cap}>نام کاربری</span>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Sabzineh"
                    dir="ltr"
                    className={`${box} text-left`}
                    autoComplete="username"
                  />
                  <span className="text-xs text-[#8b917f]">با حرف انگلیسی. هم برای ورود است، هم آدرس فروشگاه.</span>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={cap}>موبایل</span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    className={box}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={cap}>رمز عبور</span>
                  <span className="relative" dir="ltr">
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={`${box} pe-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((open) => !open)}
                      aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                      className="absolute end-3.5 top-1/2 -translate-y-1/2 text-[#8b917f]"
                    >
                      {showPassword ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
                    </button>
                  </span>
                  <span className="text-xs text-[#8b917f]">حداقل ۸ کاراکتر</span>
                </label>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-2" dir="ltr">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(node) => {
                        slots.current[index] = node
                      }}
                      value={digit}
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      aria-label={`رقم ${index + 1}`}
                      className="h-14 w-full rounded-2xl bg-[#f7f8f5] text-center text-xl font-bold shadow-[0_0_0_1px_#e6eadf] outline-none focus:bg-white focus:shadow-[0_0_0_1.5px_#80ad01,0_0_0_4px_rgba(128,173,1,0.14)]"
                      onChange={(event) => {
                        const nextDigit = digits(event.target.value).replace(/\D/g, "").slice(-1)
                        const next = [...code]
                        next[index] = nextDigit
                        setCode(next)
                        if (nextDigit && index < 5) slots.current[index + 1]?.focus()
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Backspace" && !code[index] && index > 0) {
                          const next = [...code]
                          next[index - 1] = ""
                          setCode(next)
                          slots.current[index - 1]?.focus()
                        }
                      }}
                      onPaste={(event) => {
                        const pasted = digits(event.clipboardData.getData("text")).replace(/\D/g, "").slice(0, 6)
                        if (!pasted) return
                        event.preventDefault()
                        const next = ["", "", "", "", "", ""]
                        pasted.split("").forEach((item, itemIndex) => {
                          next[itemIndex] = item
                        })
                        setCode(next)
                        slots.current[Math.min(pasted.length, 5)]?.focus()
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="font-medium text-[#3d4336]"
                    onClick={() => {
                      setStep("form")
                      setError("")
                    }}
                  >
                    ویرایش اطلاعات
                  </button>
                  <button
                    type="button"
                    disabled={wait > 0 || loading}
                    className="font-semibold text-primary disabled:text-[#8b917f]"
                    onClick={() => {
                      void requestCode()
                    }}
                  >
                    {wait > 0 ? `ارسال دوباره تا ${wait.toLocaleString("fa-IR")} ثانیه` : "ارسال دوباره"}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading || (step === "code" && pin.length < 6)} className="h-12 rounded-2xl text-[15px] font-semibold shadow-none">
              {loading ? (step === "form" ? "در حال ارسال کد..." : "در حال ثبت‌نام...") : "ثبت نام"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
