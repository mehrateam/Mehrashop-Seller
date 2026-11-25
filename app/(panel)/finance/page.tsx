import { Suspense } from "react"
import { FinanceScreen } from "@/components/finance/FinanceScreen"

export default function FinancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
          در حال بارگذاری...
        </div>
      }
    >
      <FinanceScreen />
    </Suspense>
  )
}
