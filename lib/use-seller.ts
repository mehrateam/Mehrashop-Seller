"use client"

import { useSyncExternalStore } from "react"
import { getUser, subscribeUser } from "@/lib/auth"

export function useSeller() {
  return useSyncExternalStore(subscribeUser, getUser, () => null)
}
