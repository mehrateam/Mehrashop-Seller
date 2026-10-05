"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ensureSession } from "@/lib/auth"

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    let alive = true
    ensureSession().then((authed) => {
      if (!alive) return
      if (authed) setOk(true)
      else router.replace("/auth")
    })
    return () => {
      alive = false
    }
  }, [router])

  if (!ok) return null
  return children
}
