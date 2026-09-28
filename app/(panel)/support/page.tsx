import { Suspense } from "react"
import { SupportScreen } from "@/components/support/SupportScreen"

export default function SupportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
          در حال بارگذاری...
        </div>
      }
    >
      <SupportScreen />
    </Suspense>
  )
}
