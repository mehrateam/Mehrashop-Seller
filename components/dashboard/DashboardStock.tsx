import Image from "next/image"
import Link from "next/link"
import { PackageIcon } from "@phosphor-icons/react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { storeFile, type StoreProduct } from "@/lib/store"

export function DashboardStock({ ready, products }: { ready: boolean; products: StoreProduct[] }) {
  const ranked = products.slice().sort((a, b) => a.count - b.count)
  const lowCount = ranked.filter((item) => item.count <= 3).length
  const rows = (lowCount ? ranked.filter((item) => item.count <= 3) : ranked).slice(0, 4)

  return (
    <Card className="h-full rounded-2xl ring-foreground/5">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>{lowCount ? "موجودی رو به اتمام" : "محصولات فروشگاه"}</CardTitle>
          <CardDescription>
            {!ready ? "در حال بارگذاری" : lowCount ? `${lowCount.toLocaleString("fa-IR")} کالا با موجودی کم` : "موجودی‌ها مناسب است"}
          </CardDescription>
        </div>
        <CardAction>
          <Link href="/store" className={buttonVariants({ variant: "outline", size: "sm" })}>
            فروشگاه
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        {!ready ? (
          <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
        ) : rows.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PackageIcon className="size-4" />
            </div>
            <p className="text-sm text-muted-foreground">هنوز محصولی در فروشگاه نیست.</p>
          </div>
        ) : (
          rows.map((product) => {
            const image = storeFile(product.image_cover)
            const empty = product.count <= 0
            const warn = product.count > 0 && product.count <= 3
            return (
              <div key={product.id} className="flex items-center gap-3 rounded-xl px-1 py-1.5">
                {image ? (
                  <Image src={image} alt="" width={40} height={40} className="size-10 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <PackageIcon className="size-4" />
                  </div>
                )}
                <p className="min-w-0 flex-1 truncate text-sm font-semibold">{product.fa_name}</p>
                <span
                  className={`shrink-0 text-xs font-semibold ${empty ? "text-destructive" : warn ? "text-amber-800" : "text-muted-foreground"}`}
                >
                  {empty ? "ناموجود" : `${product.count.toLocaleString("fa-IR")} عدد`}
                </span>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
