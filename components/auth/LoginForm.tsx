"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ensureSession, login } from "@/lib/auth"

export function LoginForm() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [phoneEmail, setPhoneEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let alive = true
    ensureSession().then((authed) => {
      if (!alive) return
      if (authed) router.replace("/")
      else setReady(true)
    })
    return () => {
      alive = false
    }
  }, [router])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(phoneEmail.trim(), password)
      sessionStorage.setItem("show_welcome_modal", "1")
      router.replace("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی رخ داد")
    } finally {
      setLoading(false)
    }
  }

  if (!ready) return null

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      <div className="border-t border-border">
        <span className="-mt-px inline-block border-t-2 border-primary py-3 text-sm font-semibold text-primary">
          ورود
        </span>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="phoneEmail" className="sr-only">
          نام کاربری، موبایل یا ایمیل
        </Label>
        <Input
          id="phoneEmail"
          name="phoneEmail"
          type="text"
          value={phoneEmail}
          onChange={(e) => setPhoneEmail(e.target.value)}
          placeholder="نام کاربری، شماره موبایل یا ایمیل"
          autoComplete="username"
          required
          className="h-12 rounded-xl border-border bg-card px-3.5 text-sm focus-visible:border-primary focus-visible:ring-primary/15"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="sr-only">
          رمز عبور
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="رمز عبور"
            autoComplete="current-password"
            required
            className="h-12 rounded-xl border-border bg-card px-3.5 pe-12 text-sm focus-visible:border-primary focus-visible:ring-primary/15"
          />
          <button
            type="button"
            onClick={() => setShowPassword((open) => !open)}
            aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-xl text-sm font-semibold shadow-none"
      >
        {loading ? "در حال ورود..." : "ورود"}
      </Button>
    </form>
  )
}
