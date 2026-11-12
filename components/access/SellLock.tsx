"use client"

import type { ReactNode } from "react"

/** Selling is open after signup; kept as a pass-through for layouts. */
export function SellLock({ children }: { children: ReactNode }) {
  return children
}
