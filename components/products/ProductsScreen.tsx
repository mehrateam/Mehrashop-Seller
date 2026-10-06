"use client"

import { useEffect, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { LockSimpleIcon, PackageIcon } from "@phosphor-icons/react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiFetch } from "@/lib/auth"
import { canSell } from "@/lib/tier"
import { useSeller } from "@/lib/use-seller"
import { fetchStore, storeFile, storePrice, type StoreProduct } from "@/lib/store"
import { cn } from "@/lib/utils"

export function ProductsScreen() {
  const user = useSeller()
  const open = canSell(user)
  const finishShop = user?.tier === "gold" && !user.gold_done
  const [products, setProducts] = useState<StoreProduct[] | null>(null)
  const [name, setName] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    let alive = true
    fetchStore()
      .then((store) => {
        if (alive) setProducts(store.products ?? [])
      })
      .catch(() => {
        if (alive) setProducts([])
      })
    return () => {
      alive = false
    }
  }, [open])

  if (!open) {
    return (
      <Card className="mx-auto max-w-xl rounded-2xl ring-foreground/5">
        <CardContent className="flex flex-col items-start gap-3 pt-(--card-spacing)">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#f6efe2] text-[#a67c52]">
            <LockSimpleIcon className="size-6" weight="duotone" />
          </span>
          <h1 className="text-xl font-bold">{finishShop ? "اول فروشگاه را کامل کنید" : "بعد از تایید مدیر"}</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            {finishShop
              ? "پروفایل و آدرس را ذخیره کنید تا این بخش باز شود. بنر اختیاری است."
              : "تا تایید مدارک، این بخش بسته است. سطح آخر طلاست."}
          </p>
          <Link href={finishShop ? "/access#shop" : "/access"} className={cn(buttonVariants(), "h-11 rounded-xl px-4")}>
            {finishShop ? "تکمیل فروشگاه" : "رفتن به سطح حساب"}
          </Link>
        </CardContent>
      </Card>
    )
  }

  async function onAdd(event: FormEvent) {
    event.preventDefault()
    const title = name.trim()
    if (title.length < 2) {
      setNote("نام محصول را بنویسید")
      return
    }
    setSaving(true)
    setNote("")
    try {
      const store = await fetchStore()
      const res = await apiFetch("/api/oo/product/seller-store/step1/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fa_name: title, creator: store.id, product_type: "new", is_original: true }),
      })
      const data = (await res.json().catch(() => null)) as { id?: number; detail?: string; fa_name?: string[] } | null
      if (!res.ok || !data?.id) {
        setNote(data?.detail || data?.fa_name?.[0] || "ثبت محصول انجام نشد")
        return
      }
      setName("")
      setNote("پیش‌نویس محصول ثبت شد. جزئیات را بعداً کامل می‌کنید.")
      setProducts((list) => [
        {
          id: data.id as number,
          fa_name: title,
          image_cover: "",
          price: 0,
          discounted_price: 0,
          discounted_percentage: 0,
          avg_score: null,
          count: 0,
        },
        ...(list ?? []),
      ])
    } catch (err) {
      setNote(err instanceof Error ? err.message : "ثبت محصول انجام نشد")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">محصولات</h1>
        <p className="mt-1 text-sm text-muted-foreground">از همین‌جا می‌توانید کالا بگذارید.</p>
      </div>
      <form onSubmit={onAdd} className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/5 sm:flex-row sm:items-center">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="نام محصول"
          className="h-11 flex-1 rounded-xl border border-border bg-muted px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button type="submit" disabled={saving} className="h-11 rounded-xl px-4">
          {saving ? "در حال ثبت..." : "گذاشتن محصول"}
        </Button>
      </form>
      {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
      {!products ? (
        <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
      ) : products.length === 0 ? (
        <Card className="rounded-2xl ring-foreground/5">
          <CardContent className="flex flex-col items-start gap-2 pt-(--card-spacing)">
            <PackageIcon className="size-8 text-primary" weight="duotone" />
            <p className="text-sm leading-7 text-muted-foreground">هنوز محصولی ثبت نشده.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {products.map((product) => (
            <li key={product.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-foreground/5">
              {storeFile(product.image_cover) ? (
                <Image src={storeFile(product.image_cover)} alt="" width={64} height={64} className="size-16 rounded-xl object-cover" />
              ) : (
                <span className="grid size-16 place-items-center rounded-xl bg-muted text-muted-foreground">
                  <PackageIcon className="size-5" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{product.fa_name}</p>
                <p className="text-xs text-muted-foreground">{product.price ? storePrice(product) : "پیش‌نویس"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
