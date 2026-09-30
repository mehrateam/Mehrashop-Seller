"use client"

import { useSearchParams } from "next/navigation"
import { OrderList } from "@/components/orders/OrderList"
import { OrderView } from "@/components/orders/OrderView"

export function OrdersScreen() {
  const id = useSearchParams().get("order")
  return id ? <OrderView id={id} /> : <OrderList />
}
