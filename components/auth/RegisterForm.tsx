"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircleIcon, EyeIcon, EyeSlashIcon, WarningCircleIcon } from "@phosphor-icons/react"
import { UploadField } from "@/components/access/UploadField"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { login } from "@/lib/auth"
import {
  checkSellerOtp,
  classifyAccount,
  digits,
  normalizePhone,
  sendSellerOtp,
  signupError,
  submitSignup,
} from "@/lib/register"

const cap = "text-[13px] font-medium text-[#3d4336]"
const box =
  "h-12 w-full rounded-2xl bg-[#f7f8f5] px-4 text-[15px] text-foreground shadow-[0_0_0_1px_#e6eadf] outline-none transition-shadow placeholder:text-[#a8ae9f] focus:bg-white focus:shadow-[0_0_0_1.5px_#80ad01,0_0_0_4px_rgba(128,173,1,0.14)]"
const star = <span className="text-destructive">★</span>

const perks = [
  "موارد ستاره‌دار اجباری‌اند؛ بقیه اختیاری",
  "بعد از تایید پیامک وارد پنل می‌شوید",
  "سطح برنز با ثبت‌نام؛ نقره با اولین محصول؛ طلا با ۱۰ محصول",
]

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
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [gender, setGender] = useState("")
  const [nationalCode, setNationalCode] = useState("")
  const [email, setEmail] = useState("")
  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [nameFa, setNameFa] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [storePhone, setStorePhone] = useState("")
  const [address, setAddress] = useState("")
  const [postal, setPostal] = useState("")
  const [website, setWebsite] = useState("")
  const [instagram, setInstagram] = useState("")
  const [telegram, setTelegram] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [about, setAbout] = useState("")
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

  const draft = {
    phone,
    password,
    firstName,
    lastName,
    gender,
    nationalCode,
    email,
    front,
    back,
    nameFa,
    nameEn,
    username,
    storePhone,
    address,
    postal,
    website,
    instagram,
    telegram,
    whatsapp,
    about,
    sellerId,
    storeId,
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
    const message = signupError(draft)
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
    const result = await submitSignup(draft)
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
      sessionStorage.setItem("welcome_modal_kind", "registered")
      router.replace("/")
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
              مشخصات فروشنده و فروشگاه را یک‌جا پر کنید. بدون مرحلهٔ اجباری اضافه؛ بعد از پیامک وارد پنل می‌شوید.
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

      <section className="flex min-w-0 flex-1 justify-center px-5 py-6 sm:px-8 lg:items-start lg:py-10">
        <div className="flex w-full max-w-[520px] flex-col gap-5">
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
              <h2 className="text-[1.65rem] font-bold tracking-tight">{step === "form" ? "ثبت‌نام فروشنده" : "کد پیامک"}</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {step === "form"
                  ? "مواردی که با ★ مشخص شدن اجباری‌اند. بقیه اختیاری‌ان."
                  : `کد ۶ رقمی به ${normalizePhone(phone)} پیامک شد.`}
              </p>
            </div>

            {step === "form" ? (
              <>
                <section className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold">اطلاعات فروشنده</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className={cap}>{star} نام</span>
                      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={box} autoComplete="given-name" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={cap}>{star} نام خانوادگی</span>
                      <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={box} autoComplete="family-name" />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className={cap}>{star} جنسیت</span>
                      <select value={gender} onChange={(e) => setGender(e.target.value)} className={box}>
                        <option value="">انتخاب</option>
                        <option value="male">مرد</option>
                        <option value="female">زن</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={cap}>{star} کد ملی</span>
                      <input value={nationalCode} onChange={(e) => setNationalCode(e.target.value)} inputMode="numeric" className={box} />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <UploadField label="★ روی کارت ملی" file={front} onPick={setFront} contain />
                    <UploadField label="★ پشت کارت ملی" file={back} onPick={setBack} contain />
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>ایمیل</span>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" dir="ltr" className={`${box} text-left`} autoComplete="email" />
                  </label>
                </section>

                <section className="flex flex-col gap-3 border-t border-[#e6eadf] pt-5">
                  <h3 className="text-sm font-bold">اطلاعات فروشگاه</h3>
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>{star} نام فارسی فروشگاه</span>
                    <input value={nameFa} onChange={(e) => setNameFa(e.target.value)} className={box} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>نام انگلیسی فروشگاه</span>
                    <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} dir="ltr" className={`${box} text-left`} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>{star} آدرس اینترنتی دلخواه صفحهٔ فروشگاه</span>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Sabzineh"
                      dir="ltr"
                      className={`${box} text-left`}
                      autoComplete="username"
                    />
                    <span className="text-xs text-[#8b917f]">با حرف انگلیسی. برای ورود و آدرس فروشگاه استفاده می‌شود.</span>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>تلفن فروشگاه</span>
                    <input value={storePhone} onChange={(e) => setStorePhone(e.target.value)} inputMode="tel" className={box} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>{star} نشانی کامل فروشگاه</span>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className={`${box} h-auto py-3`} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>{star} کد پستی</span>
                    <input value={postal} onChange={(e) => setPostal(e.target.value)} inputMode="numeric" className={box} />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className={cap}>وب‌سایت</span>
                      <input value={website} onChange={(e) => setWebsite(e.target.value)} dir="ltr" className={`${box} text-left`} />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={cap}>اینستاگرام</span>
                      <input value={instagram} onChange={(e) => setInstagram(e.target.value)} dir="ltr" className={`${box} text-left`} />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={cap}>تلگرام</span>
                      <input value={telegram} onChange={(e) => setTelegram(e.target.value)} dir="ltr" className={`${box} text-left`} />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={cap}>شماره واتساپ</span>
                      <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" className={box} />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>توضیح کوتاه دربارهٔ فروشگاه</span>
                    <textarea value={about} onChange={(e) => setAbout(e.target.value)} maxLength={500} rows={3} className={`${box} h-auto py-3`} />
                  </label>
                </section>

                <section className="flex flex-col gap-3 border-t border-[#e6eadf] pt-5">
                  <h3 className="text-sm font-bold">ورود به حساب</h3>
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>{star} موبایل</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" className={box} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>{star} رمز عبور</span>
                    <span className="relative" dir="ltr">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                </section>
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

      <Modal open={Boolean(error)} onClose={() => setError("")} size="sm">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
            <WarningCircleIcon weight="bold" className="size-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">ثبت‌نام کامل نیست</h2>
          <p className="mb-1 text-sm leading-7 text-muted-foreground">{error}</p>
          <Button type="button" onClick={() => setError("")} className="mt-1 min-w-[140px] rounded-xl">
            متوجه شدم
          </Button>
        </div>
      </Modal>
    </div>
  )
}
