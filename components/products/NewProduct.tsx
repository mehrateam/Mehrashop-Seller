"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { MagnifyingGlassIcon, PackageIcon } from "@phosphor-icons/react"
import { ProductStepOne } from "@/components/products/ProductStepOne"
import { Button } from "@/components/ui/button"
import {
  chooseProduct,
  fetchDraftLimit,
  productImage,
  searchCatalog,
  type CatalogProduct,
} from "@/lib/products"

export function NewProduct() {
  const router = useRouter()
  const params = useSearchParams()
  const productId = Number(params.get("product") || 0)
  const [blocked, setBlocked] = useState("")
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<CatalogProduct[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [picking, setPicking] = useState(0)
  const onForm = params.get("step") === "1"

  useEffect(() => {
    if (onForm) return
    let alive = true
    fetchDraftLimit()
      .then((res) => {
        if (alive) setBlocked(res.can_create ? "" : res.message)
      })
      .catch(() => {
        if (alive) setBlocked("")
      })
    return () => {
      alive = false
    }
  }, [onForm])

  useEffect(() => {
    if (onForm) return
    const q = query.trim()
    if (!q) {
      setProducts(null)
      setLoading(false)
      return
    }
    let alive = true
    const timer = setTimeout(() => {
      setLoading(true)
      searchCatalog(q)
        .then((rows) => {
          if (!alive) return
          setProducts(rows)
          setError("")
        })
        .catch((err: unknown) => {
          if (!alive) return
          setProducts([])
          setError(err instanceof Error ? err.message : "خطا در جستجو")
        })
        .finally(() => {
          if (alive) setLoading(false)
        })
    }, 400)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [onForm, query])

  if (onForm) return <ProductStepOne productId={Number.isFinite(productId) ? productId : 0} />

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold tracking-tight">جست و جوی کالا</h1>
        <p className="mt-1 text-sm text-muted-foreground">قبل از ثبت کالای جدید، محصول‌های مشابه را ببینید</p>
      </div>

      {blocked ? (
        <p className="rounded-2xl border border-[#DD794F]/30 bg-[#DD794F]/10 px-4 py-3 text-sm leading-7 text-[#9a4e2c]">
          {blocked}
        </p>
      ) : null}

      <section className="flex flex-col gap-6 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
        <p className="rounded-xl bg-[#ffe8cc] px-4 py-3 text-sm leading-7 text-[#6b4a2a]">
          چنانچه فروشنده این محصول هستید گزینه انتخاب را بزنید.
        </p>

        <label className="flex h-11 items-center gap-2 rounded-xl border bg-background px-3 text-sm shadow-sm">
          <MagnifyingGlassIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="عنوان کالا را وارد کنید"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-[#E37444]">محصول های مشابه:</p>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">در حال جستجو...</p>
          ) : products === null ? null : products.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">محصول مشابهی پیدا نشد</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {products.map((product) => {
                const image = productImage(product.image)
                return (
                  <article
                    key={product.id}
                    className="flex w-56 shrink-0 flex-col gap-3 rounded-2xl border bg-background p-3"
                  >
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-muted">
                      {image ? (
                        <Image src={image} alt="" width={224} height={224} className="size-full object-contain" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <PackageIcon className="size-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex min-h-16 flex-col gap-1">
                      <h2 className="line-clamp-2 text-sm font-semibold">{product.title || "بدون نام"}</h2>
                      {product.en_name ? (
                        <p className="truncate text-xs text-muted-foreground" dir="ltr">
                          {product.en_name}
                        </p>
                      ) : null}
                      {product.categories.length ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground">{product.categories.join("، ")}</p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      size="lg"
                      className="h-9 rounded-xl"
                      disabled={picking === product.id}
                      onClick={() => {
                        setPicking(product.id)
                        setError("")
                        const id = product.id
                        chooseProduct(id)
                          .then(() => router.push(`/products/new?step=1&product=${id}`))
                          .catch((err: unknown) => {
                            setError(err instanceof Error ? err.message : "انتخاب محصول انجام نشد")
                          })
                          .finally(() => setPicking((current) => (current === id ? 0 : current)))
                      }}
                    >
                      {picking === product.id ? "..." : "انتخاب"}
                    </Button>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {error ? <p className="text-sm leading-7 text-destructive">{error}</p> : null}

        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={Boolean(blocked)}
            className="h-10 rounded-xl border-[#80AD01] bg-background px-5 text-[#80AD01] hover:bg-[#80AD01]/10 disabled:border-muted-foreground/40 disabled:text-muted-foreground"
            onClick={() => {
              if (!blocked) router.push("/products/new?step=1")
            }}
          >
            تایید و ادامه
          </Button>
        </div>
      </section>
    </div>
  )
}
