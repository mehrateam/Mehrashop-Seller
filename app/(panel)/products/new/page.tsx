import { Suspense } from "react"
import { NewProduct } from "@/components/products/NewProduct"

export const metadata = { title: "افزودن محصول" }

export default function NewProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
          در حال بارگذاری...
        </div>
      }
    >
      <NewProduct />
    </Suspense>
  )
}
