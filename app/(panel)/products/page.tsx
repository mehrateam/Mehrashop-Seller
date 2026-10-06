import { Suspense } from "react"
import { ProductList } from "@/components/products/ProductList"

export const metadata = { title: "محصولات" }

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
          در حال بارگذاری...
        </div>
      }
    >
      <ProductList />
    </Suspense>
  )
}
