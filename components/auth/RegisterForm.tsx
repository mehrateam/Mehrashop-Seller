"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BuildingsIcon,
  CaretDownIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  COMPANY_TYPES,
  CONTRACT,
  classifyAccount,
  loadProvinces,
  submitRegistration,
  validateDraft,
  type ProvinceOption,
  type RegisterDraft,
  type SellerKind,
} from "@/lib/register"

const cap = "text-[13px] font-medium text-[#3d4336]"
const box =
  "h-12 w-full rounded-2xl bg-white px-4 text-[15px] text-foreground shadow-[0_1px_2px_rgba(23,26,20,0.04),0_0_0_1px_#e6eadf] outline-none transition-shadow placeholder:text-[#a8ae9f] focus:shadow-[0_0_0_1.5px_#80ad01,0_0_0_4px_rgba(128,173,1,0.14)]"

export function RegisterForm() {
  const router = useRouter()
  const errorRef = useRef<HTMLParagraphElement>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const [kind, setKind] = useState<SellerKind>("genuine")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [nationalCode, setNationalCode] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyType, setCompanyType] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [ceoFirstName, setCeoFirstName] = useState("")
  const [ceoLastName, setCeoLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [emailOpen, setEmailOpen] = useState(false)
  const [sellerUsername, setSellerUsername] = useState("")
  const [showLoginName, setShowLoginName] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [storeName, setStoreName] = useState("")
  const [storeUsername, setStoreUsername] = useState("")
  const [provinceId, setProvinceId] = useState("")
  const [cityId, setCityId] = useState("")
  const [address, setAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [accepted, setAccepted] = useState(false)
  const [contractOpen, setContractOpen] = useState(false)
  const [provinces, setProvinces] = useState<ProvinceOption[]>([])
  const [sellerId, setSellerId] = useState<number | null>(null)
  const [storeId, setStoreId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const found = classifyAccount(new URLSearchParams(window.location.search).get("account") ?? "")
    // Static export cannot read the query on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (found.phone) setPhone(found.phone)
    if (found.email) {
      setEmail(found.email)
      setEmailOpen(true)
    }
    if (found.username) {
      setSellerUsername(found.username)
      setShowLoginName(true)
      if (/^[A-Za-z][A-Za-z0-9_]{2,31}$/.test(found.username)) setStoreUsername(found.username)
    }
  }, [])

  useEffect(() => {
    if (!error) return
    errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [error])

  useEffect(() => {
    let alive = true
    loadProvinces().then((list) => {
      if (alive) setProvinces(list)
    })
    return () => {
      alive = false
    }
  }, [])

  const cities = provinces.find((item) => String(item.id) === provinceId)?.city ?? []
  const passwordReady =
    password.length >= 6 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)

  const draft: RegisterDraft = {
    kind,
    firstName,
    lastName,
    nationalCode,
    companyName,
    companyType,
    registrationNumber,
    nationalId,
    ceoFirstName,
    ceoLastName,
    phone,
    email,
    sellerUsername,
    password,
    storeName,
    storeUsername,
    provinceId,
    cityId,
    address,
    postalCode,
    accepted,
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (step === 1) {
      const message = validateDraft(draft, "identity")
      if (message) {
        setError(message)
        return
      }
      setError("")
      setStep(2)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    const message = validateDraft(draft)
    if (message) {
      setError(message)
      return
    }
    setError("")
    setLoading(true)
    const result = await submitRegistration(draft, { sellerId, storeId })
    setSellerId(result.sellerId)
    setStoreId(result.storeId)
    setLoading(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setDone(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="flex min-h-svh bg-[#f7f8f5]">
      <aside className="sticky top-0 hidden h-svh w-[42%] flex-col justify-between overflow-hidden bg-[#f3f6ec] px-12 py-12 lg:flex xl:w-[46%] xl:px-16">
        <div className="flex max-w-sm flex-col gap-8">
          <img src="/brand/logo.svg" alt="مهراشاپ" className="h-12 w-fit" />
          <div className="flex flex-col gap-3">
            <h1 className="text-[1.85rem] leading-snug font-bold tracking-tight">فروشگاه‌تان را باز کنید</h1>
            <p className="text-sm leading-7 text-muted-foreground">دو قدم کوتاه. عکس مدارک لازم نیست.</p>
          </div>
          <ul className="flex flex-col gap-3.5 text-sm leading-6">
            <li className="flex items-center gap-2.5">
              <CheckCircleIcon className="size-5 shrink-0 text-primary" weight="duotone" />
              نتیجه بررسی با پیامک می‌آید
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircleIcon className="size-5 shrink-0 text-primary" weight="duotone" />
              شبا و لوگو را بعد از تأیید می‌گذارید
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircleIcon className="size-5 shrink-0 text-primary" weight="duotone" />
              فقط کالای گیاهی، طبیعی و وگان
            </li>
          </ul>
        </div>
        <img src="/brand/login-art.svg" alt="" className="mt-8 max-h-[46%] w-full max-w-sm object-contain" />
      </aside>

      <section className="flex min-w-0 flex-1 justify-center px-5 py-6 sm:px-8 lg:items-center">
        <div className="flex w-full max-w-[440px] flex-col gap-5">
          <header className="flex items-center justify-between">
            <img src="/brand/logo.svg" alt="مهراشاپ" className="h-11 w-auto lg:hidden" />
            <Link
              href="/auth"
              className="ms-auto rounded-full bg-white px-4 py-2 text-sm font-medium text-[#3d4336] shadow-[0_0_0_1px_#e6eadf]"
            >
              ورود
            </Link>
          </header>

          {done ? (
            <div className="flex flex-col gap-5 pt-6">
              <CheckCircleIcon className="size-14 text-primary" weight="duotone" />
              <div className="flex flex-col gap-2">
                <h2 className="text-[1.7rem] font-bold tracking-tight">ثبت شد</h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  درخواست‌تان در صف بررسی است. نتیجه با پیامک می‌آید و بعد از آن می‌توانید وارد پنل شوید.
                </p>
              </div>
              <Button
                type="button"
                className="h-12 rounded-2xl text-[15px] font-semibold shadow-none"
                onClick={() => router.push("/auth")}
              >
                بازگشت به ورود
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-[13px]">
                  <span className={step === 1 ? "font-bold text-primary" : "font-medium text-[#8b917f]"}>
                    ۱ مشخصات
                  </span>
                  <span className="h-px flex-1 bg-[#e1e6d8]" />
                  <span className={step === 2 ? "font-bold text-primary" : "font-medium text-[#8b917f]"}>
                    ۲ فروشگاه
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-[1.7rem] font-bold tracking-tight">
                    {step === 1 ? "مشخصات شما" : "فروشگاه"}
                  </h2>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {step === 1
                      ? "حقیقی یا حقوقی، به‌همراه موبایل و یک رمز."
                      : "خریدار فروشگاه را با همین نام می‌بیند."}
                  </p>
                </div>
              </div>

              {error ? (
                <p
                  ref={errorRef}
                  className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"
                >
                  {error}
                </p>
              ) : null}

              {step === 1 ? (
                <div className="flex flex-col gap-3.5">
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#eef1e8] p-1">
                    <button
                      type="button"
                      aria-pressed={kind === "genuine"}
                      onClick={() => {
                        setKind("genuine")
                        setError("")
                      }}
                      className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${
                        kind === "genuine" ? "bg-white text-foreground shadow-sm" : "text-[#6f7568]"
                      }`}
                    >
                      <UserIcon className="size-4" />
                      حقیقی
                    </button>
                    <button
                      type="button"
                      aria-pressed={kind === "legal"}
                      onClick={() => {
                        setKind("legal")
                        setError("")
                      }}
                      className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${
                        kind === "legal" ? "bg-white text-foreground shadow-sm" : "text-[#6f7568]"
                      }`}
                    >
                      <BuildingsIcon className="size-4" />
                      حقوقی
                    </button>
                  </div>
                  <p className="px-1 text-[13px] leading-6 text-muted-foreground">
                    {kind === "genuine" ? "برای شخص، کارگاه خانگی و برند شخصی." : "برای شرکت، مؤسسه و تعاونی."}
                  </p>

                  {kind === "genuine" ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                          <span className={cap}>نام</span>
                          <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            autoComplete="given-name"
                            className={box}
                          />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={cap}>نام خانوادگی</span>
                          <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            autoComplete="family-name"
                            className={box}
                          />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1.5">
                        <span className={cap}>کد ملی</span>
                        <input
                          value={nationalCode}
                          onChange={(e) => setNationalCode(e.target.value)}
                          inputMode="numeric"
                          className={box}
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      <label className="flex flex-col gap-1.5">
                        <span className={cap}>نام شرکت</span>
                        <input
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className={box}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className={cap}>نوع شرکت</span>
                        <span className="relative">
                          <select
                            value={companyType}
                            onChange={(e) => setCompanyType(e.target.value)}
                            className={`${box} appearance-none pe-10 ${companyType ? "" : "text-[#a8ae9f]"}`}
                          >
                            <option value="">انتخاب</option>
                            {COMPANY_TYPES.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <CaretDownIcon className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8b917f]" />
                        </span>
                      </label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                          <span className={cap}>شماره ثبت</span>
                          <input
                            value={registrationNumber}
                            onChange={(e) => setRegistrationNumber(e.target.value)}
                            className={box}
                          />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={cap}>شناسه ملی</span>
                          <input
                            value={nationalId}
                            onChange={(e) => setNationalId(e.target.value)}
                            inputMode="numeric"
                            className={box}
                          />
                        </label>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                          <span className={cap}>نام مدیرعامل</span>
                          <input
                            value={ceoFirstName}
                            onChange={(e) => setCeoFirstName(e.target.value)}
                            className={box}
                          />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className={cap}>نام خانوادگی</span>
                          <input
                            value={ceoLastName}
                            onChange={(e) => setCeoLastName(e.target.value)}
                            className={box}
                          />
                        </label>
                      </div>
                    </>
                  )}

                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>موبایل</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      inputMode="tel"
                      autoComplete="tel"
                      className={box}
                    />
                  </label>
                  {emailOpen ? (
                    <label className="flex flex-col gap-1.5">
                      <span className={cap}>ایمیل، اختیاری</span>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        dir="ltr"
                        className={`${box} text-left`}
                      />
                    </label>
                  ) : (
                    <button
                      type="button"
                      className="self-start text-sm font-medium text-primary"
                      onClick={() => setEmailOpen(true)}
                    >
                      افزودن ایمیل
                    </button>
                  )}
                  {showLoginName ? (
                    <label className="flex flex-col gap-1.5">
                      <span className={cap}>نام کاربری ورود</span>
                      <input
                        value={sellerUsername}
                        onChange={(e) => setSellerUsername(e.target.value)}
                        dir="ltr"
                        className={`${box} text-left`}
                      />
                    </label>
                  ) : null}
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>رمز عبور</span>
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
                    <span className={`text-xs ${passwordReady ? "text-primary" : "text-[#8b917f]"}`}>
                      ۶ کاراکتر، با حرف بزرگ، کوچک و عدد
                    </span>
                  </label>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>نام فروشگاه</span>
                    <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className={box} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>آدرس صفحه</span>
                    <span
                      className="flex h-12 items-center overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(23,26,20,0.04),0_0_0_1px_#e6eadf] focus-within:shadow-[0_0_0_1.5px_#80ad01,0_0_0_4px_rgba(128,173,1,0.14)]"
                      dir="ltr"
                    >
                      <span className="ps-4 text-sm text-[#8b917f]">seller/</span>
                      <input
                        value={storeUsername}
                        onChange={(e) => setStoreUsername(e.target.value)}
                        placeholder="Sabzineh"
                        className="h-full min-w-0 flex-1 bg-transparent pe-4 text-[15px] outline-none placeholder:text-[#a8ae9f]"
                      />
                    </span>
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className={cap}>استان</span>
                      <span className="relative">
                        <select
                          value={provinceId}
                          onChange={(e) => {
                            setProvinceId(e.target.value)
                            setCityId("")
                          }}
                          className={`${box} appearance-none pe-10 ${provinceId ? "" : "text-[#a8ae9f]"}`}
                        >
                          <option value="">انتخاب</option>
                          {provinces.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                        <CaretDownIcon className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8b917f]" />
                      </span>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={cap}>شهر</span>
                      <span className="relative">
                        <select
                          value={cityId}
                          onChange={(e) => setCityId(e.target.value)}
                          className={`${box} appearance-none pe-10 ${cityId ? "" : "text-[#a8ae9f]"}`}
                        >
                          <option value="">انتخاب</option>
                          {cities.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                        <CaretDownIcon className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8b917f]" />
                      </span>
                    </label>
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>آدرس</span>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      placeholder="خیابان، کوچه، پلاک"
                      className="min-h-20 resize-none rounded-2xl bg-white px-4 py-2.5 text-[15px] leading-7 shadow-[0_1px_2px_rgba(23,26,20,0.04),0_0_0_1px_#e6eadf] outline-none transition-shadow placeholder:text-[#a8ae9f] focus:shadow-[0_0_0_1.5px_#80ad01,0_0_0_4px_rgba(128,173,1,0.14)]"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={cap}>کد پستی</span>
                    <input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      inputMode="numeric"
                      className={box}
                    />
                  </label>
                  <div className="rounded-2xl bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(23,26,20,0.04),0_0_0_1px_#e6eadf]">
                    <label className="flex items-start gap-3 text-sm leading-6">
                      <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-1 size-4 accent-primary"
                      />
                      <span className="font-medium">شرایط همکاری مهراشاپ را می‌پذیرم</span>
                    </label>
                    <button
                      type="button"
                      className="mt-1 ms-7 text-[13px] font-medium text-primary"
                      onClick={() => setContractOpen((open) => !open)}
                    >
                      {contractOpen ? "بستن متن" : "خواندن متن"}
                    </button>
                    {contractOpen ? (
                      <p className="mt-3 max-h-40 overflow-y-auto text-[13px] leading-7 whitespace-pre-line text-muted-foreground">
                        {CONTRACT}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="pt-1">
                {step === 1 ? (
                  <Button type="submit" className="h-12 w-full rounded-2xl text-[15px] font-semibold shadow-none">
                    ادامه
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 rounded-2xl bg-white px-5 text-[15px] shadow-none"
                      onClick={() => {
                        setError("")
                        setStep(1)
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                    >
                      بازگشت
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-12 flex-1 rounded-2xl text-[15px] font-semibold shadow-none"
                    >
                      {loading ? "در حال ثبت..." : "ثبت فروشگاه"}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
