"use client"

import { useEffect, useSyncExternalStore, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

const subscribe = () => () => {}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const ok = useSyncExternalStore(subscribe, isAuthenticated, () => false)

  useEffect(() => {
    if (!ok) router.replace("/login")
  }, [ok, router])

  if (!ok) return null
  return children
}
