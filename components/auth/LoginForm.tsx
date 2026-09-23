"use client"

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { StorefrontIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isAuthenticated, login } from "@/lib/auth"

const subscribe = () => () => {}

export function LoginForm() {
  const router = useRouter()
  const authed = useSyncExternalStore(subscribe, isAuthenticated, () => false)
  const [phoneEmail, setPhoneEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authed) router.replace("/")
  }, [authed, router])

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

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-[420px] rounded-[20px] border border-border bg-card px-8 py-9 shadow-[0_8px_30px_rgba(20,30,10,0.04)]"
    >
      <div className="mb-7 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
          <StorefrontIcon weight="bold" className="size-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">مهراشاپ</span>
      </div>

      <div className="mb-7">
        <h1 className="text-[22px] leading-tight font-bold tracking-tight">ورود به پنل فروشنده</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          شماره موبایل یا ایمیل و رمز عبور خود را وارد کنید.
        </p>
      </div>

      {error ? (
        <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="phoneEmail" className="text-[13px] font-semibold text-muted-foreground">
            شماره موبایل یا ایمیل
          </Label>
          <Input
            id="phoneEmail"
            name="phoneEmail"
            type="text"
            value={phoneEmail}
            onChange={(e) => setPhoneEmail(e.target.value)}
            placeholder="09xx… یا you@email.com"
            autoComplete="username"
            required
            className="h-12 rounded-xl border-border bg-muted px-3.5 text-sm font-medium placeholder:font-normal focus-visible:border-primary focus-visible:bg-card focus-visible:ring-primary/15"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-[13px] font-semibold text-muted-foreground">
            رمز عبور
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="h-12 rounded-xl border-border bg-muted px-3.5 text-sm font-medium placeholder:font-normal focus-visible:border-primary focus-visible:bg-card focus-visible:ring-primary/15"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-1 h-12 w-full rounded-xl text-sm font-semibold shadow-none"
        >
          {loading ? "در حال ورود..." : "ورود"}
        </Button>
      </div>
    </form>
  )
}
