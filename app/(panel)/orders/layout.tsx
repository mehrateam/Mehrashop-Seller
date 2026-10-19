import type { ReactNode } from "react"
import { SellLock } from "@/components/access/SellLock"

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return <SellLock>{children}</SellLock>
}
