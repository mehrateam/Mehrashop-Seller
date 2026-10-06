"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ServerDown } from "@/components/auth/ServerDown"
import { ensureSession, ServerDownError } from "@/lib/auth"

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)
  const [down, setDown] = useState(false)
  const [busy, setBusy] = useState(false)
  const [tryId, setTryId] = useState(0)

  useEffect(() => {
    let alive = true
    setBusy(true)
    ensureSession()
      .then((authed) => {
        if (!alive) return
        if (authed) {
          setDown(false)
          setOk(true)
          return
        }
        router.replace("/auth")
      })
      .catch((err) => {
        if (!alive) return
        if (err instanceof ServerDownError) setDown(true)
        else router.replace("/auth")
      })
      .finally(() => {
        if (alive) setBusy(false)
      })
    return () => {
      alive = false
    }
  }, [router, tryId])

  if (down) return <ServerDown busy={busy} onRetry={() => setTryId((n) => n + 1)} />
  if (!ok) return null
  return children
}
