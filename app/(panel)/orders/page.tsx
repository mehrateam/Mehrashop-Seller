import { Suspense } from "react"
import { OrdersScreen } from "@/components/orders/OrdersScreen"

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
          در حال بارگذاری...
        </div>
      }
    >
      <OrdersScreen />
    </Suspense>
  )
}
