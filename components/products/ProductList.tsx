"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { EyeIcon, MagnifyingGlassIcon, PackageIcon, PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { toman } from "@/lib/orders"
import {
  SALE_CLASS,
  SALE_LABEL,
  SORTS,
  STATUS_TABS,
  editLabel,
  editLink,
  fetchDraftLimit,
  fetchProducts,
  productImage,
  productLink,
  productPrice,
  saleState,
  setProductActive,
  type SellerProduct,
} from "@/lib/products"
import { cn } from "@/lib/utils"

export function ProductList() {
  const router = useRouter()
  const params = useSearchParams()
  const tab = params.get("tab") || "all"
  const sort = params.get("sort") || "newest"
  const q = params.get("q") || ""
  const queryKey = `${tab}:${sort}:${q}`
  const [draft, setDraft] = useState(q)
  const [draftQuery, setDraftQuery] = useState(q)
  if (q !== draftQuery) {
    setDraftQuery(q)
    setDraft(q)
  }
  const [data, setData] = useState<{
    key: string
    products: SellerProduct[]
    counts: Record<string, number>
    page: number
    pages: number
  } | null>(null)
  const [error, setError] = useState("")
  const [blocked, setBlocked] = useState("")
  const [more, setMore] = useState(false)
  const [menu, setMenu] = useState(0)
  const [busy, setBusy] = useState(0)
  const endRef = useRef<HTMLDivElement>(null)
  const ready = data?.key === queryKey
  const products = ready ? data.products : null
  const chosen = products?.find((item) => item.id === menu) ?? null
  const chosenState = chosen ? saleState(chosen) : "draft"
  const counts = ready ? data.counts : {}
  const page = ready ? data.page : 0
  const pages = ready ? data.pages : 0

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    let alive = true
    fetchProducts(tab, sort, q)
      .then((res) => {
        if (!alive) return
        setData({ key: queryKey, products: res.products, counts: res.counts, page: res.page, pages: res.pages })
        setError("")
      })
      .catch((err: unknown) => {
        if (!alive) return
        setData({ key: queryKey, products: [], counts: {}, page: 1, pages: 1 })
        setError(err instanceof Error ? err.message : "خطا در دریافت محصولات")
      })
    return () => {
      alive = false
    }
  }, [tab, sort, q, queryKey])

  useEffect(() => {
    const node = endRef.current
    if (!node || !ready || page >= pages) return
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer.disconnect()
      setMore(true)
      fetchProducts(tab, sort, q, page + 1)
        .then((res) => {
          setData((prev) => {
            if (!prev || prev.key !== queryKey) return prev
            const seen = new Set(prev.products.map((item) => item.id))
            return {
              ...prev,
              products: [...prev.products, ...res.products.filter((item) => !seen.has(item.id))],
              counts: res.counts,
              page: res.page,
              pages: res.pages,
            }
          })
          setError("")
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "خطا در دریافت محصولات")
        })
        .finally(() => setMore(false))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [ready, page, pages, tab, sort, q, queryKey])

  function setQuery(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    router.replace(`/products?${next}`)
  }

  function onSearch(e: FormEvent) {
    e.preventDefault()
    setQuery("q", draft.trim())
  }

  function applyStatus(id: number, active: boolean) {
    if (busy) return
    setBusy(id)
    setProductActive(id, active)
      .then((next) => {
        setData((prev) =>
          prev ? { ...prev, products: prev.products.map((item) => (item.id === id ? { ...item, active: next } : item)) } : prev
        )
        setMenu(0)
        setError("")
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "تغییر وضعیت انجام نشد"))
      .finally(() => setBusy(0))
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">محصولات</h1>
          <p className="mt-1 text-sm text-muted-foreground">لیست کالاهای فروشگاه</p>
        </div>
        <Button
          size="lg"
          className="h-10 rounded-xl px-4"
          disabled={Boolean(blocked)}
          onClick={() => {
            if (!blocked) router.push("/products/new")
          }}
        >
          <PlusIcon weight="bold" />
          افزودن محصول جدید
        </Button>
      </div>
      {params.get("notice") ? (
        <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">{params.get("notice")}</p>
      ) : null}
      {blocked ? (
        <p className="rounded-2xl border border-[#DD794F]/30 bg-[#DD794F]/10 px-4 py-3 text-sm leading-7 text-[#9a4e2c]">
          {blocked}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={onSearch} className="flex h-10 min-w-52 flex-1 items-center gap-2 rounded-xl border bg-card px-3 text-sm shadow-sm">
            <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="جستجو با نام یا کد محصول"
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </form>
          <label className="flex h-10 items-center gap-2 rounded-xl border bg-card px-3 text-sm shadow-sm">
            <span className="text-muted-foreground">مرتب‌سازی</span>
            <select
              value={sort}
              onChange={(e) => setQuery("sort", e.target.value === "newest" ? "" : e.target.value)}
              className="bg-transparent font-medium outline-none"
            >
              {SORTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-1 shadow-sm">
          {STATUS_TABS.map((item) => {
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setQuery("tab", item.id === "all" ? "" : item.id)}
                className={
                  active
                    ? "shrink-0 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
                    : "shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                }
              >
                {item.label}
                {counts[item.id] != null ? (
                  <span className="ms-1.5 opacity-80">{counts[item.id].toLocaleString("fa-IR")}</span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="hidden border-b bg-muted/50 px-4 py-2.5 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[4rem_minmax(0,1fr)_8rem_5.5rem_8.5rem_8.5rem] md:gap-3">
          <span />
          <span>محصول</span>
          <span>قیمت</span>
          <span>موجودی</span>
          <span>وضعیت</span>
          <span>عملیات</span>
        </div>
        {products === null ? (
          <div className="flex h-36 items-center justify-center text-sm text-muted-foreground">در حال بارگذاری...</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <PackageIcon className="size-8 text-muted-foreground/50" />
            <p className="font-medium">محصولی یافت نشد</p>
            <p className="text-sm text-muted-foreground">با این فیلتر محصولی وجود ندارد</p>
          </div>
        ) : (
          products.map((product) => {
            const image = productImage(product.image)
            const discount = Number(product.discount)
            const state = saleState(product)
            const locked = state === "waiting" || state === "blocked"
            const notes = [
              product.active ? "" : product.admin_deactivated ? "غیرفعال توسط مدیریت" : "غیرفعال",
              product.is_original === false ? "غیر اصل" : "",
              product.product_type === "stock" ? "استوک" : "",
            ].filter(Boolean)
            return (
              <article
                key={product.id}
                className="flex items-center gap-3 border-b p-3 last:border-0 hover:bg-muted/40 md:grid md:grid-cols-[4rem_minmax(0,1fr)_8rem_5.5rem_8.5rem_8.5rem] md:gap-3 md:px-4"
              >
                <div className="relative size-16 shrink-0">
                  {image ? (
                    <Image src={image} alt="" width={64} height={64} className="size-16 rounded-xl object-cover" />
                  ) : (
                    <div className="flex size-16 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <PackageIcon className="size-5" />
                    </div>
                  )}
                  {discount > 0 ? (
                    <span className="absolute -top-1.5 -start-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {discount.toLocaleString("fa-IR")}%
                    </span>
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2 md:contents">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">{product.title || "بدون نام"}</h2>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {product.category || "بدون دسته‌بندی"} · #{product.id}
                      {notes.length ? ` · ${notes.join(" · ")}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 md:contents">
                    <div>
                      <p className="text-sm font-bold text-primary">{productPrice(product)}</p>
                      {discount > 0 ? (
                        <p className="text-xs text-muted-foreground line-through">{toman(product.price)}</p>
                      ) : null}
                    </div>
                    <p className={product.stock ? "text-sm font-medium" : "text-sm font-semibold text-destructive"}>
                      {product.stock ? `${product.stock.toLocaleString("fa-IR")} عدد` : "ناموجود"}
                    </p>
                    <button
                      type="button"
                      disabled={locked || busy === product.id}
                      className={cn("w-fit rounded-lg px-2.5 py-1 text-xs font-semibold", SALE_CLASS[state], locked ? "cursor-default" : "cursor-pointer")}
                      onClick={() => setMenu(product.id)}
                    >
                      {busy === product.id ? "..." : SALE_LABEL[state]}
                    </button>
                    <div className="flex flex-wrap gap-1.5">
                      {product.status === "awaiting_category" ? null : (
                        <a
                          href={productLink(product.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-xs font-semibold text-primary-foreground"
                        >
                          <EyeIcon className="size-3.5" weight="bold" />
                          مشاهده
                        </a>
                      )}
                      <button
                        type="button"
                        className={cn(
                          "inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold",
                          product.needs_review ? "bg-primary text-primary-foreground" : "border border-primary text-primary"
                        )}
                        onClick={() => router.push(editLink(product.id))}
                      >
                        <PencilSimpleIcon className="size-3.5" weight="bold" />
                        {editLabel(product)}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })
        )}
        {products && page < pages ? (
          <div ref={endRef} className="flex h-14 items-center justify-center border-t text-sm text-muted-foreground">
            {more ? "در حال بارگذاری..." : ""}
          </div>
        ) : null}
      </div>

      <Modal open={chosen !== null} onClose={() => { if (!busy) setMenu(0) }} size="sm">
        {chosen ? (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="flex h-8 items-center ps-10 text-base font-semibold">وضعیت کالا</h2>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{chosen.title || "بدون نام"}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  [true, "فعال"],
                  [false, "غیرفعال"],
                ] as const
              ).map(([active, label]) => {
                const current = active ? chosenState === "active" : chosenState === "inactive"
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={Boolean(busy) || current}
                    className={cn(
                      "h-11 rounded-xl text-sm font-semibold disabled:cursor-default",
                      current && active && "bg-primary text-primary-foreground",
                      current && !active && "bg-[#DD794F] text-white",
                      !current && "border bg-background hover:bg-muted"
                    )}
                    onClick={() => applyStatus(chosen.id, active)}
                  >
                    {busy === chosen.id && !current ? "..." : label}
                  </button>
                )
              })}
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
