"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { cloneProduct, editLink, type SellerProduct } from "@/lib/products"

export function ProductClone({
  product,
  open,
  onClose,
}: {
  product: SellerProduct | null
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<"with" | "without" | "">("")
  const [error, setError] = useState("")

  function close() {
    if (busy) return
    setBusy("")
    setError("")
    onClose()
  }

  function copy(copyMedia: boolean) {
    if (!product || busy) return
    setBusy(copyMedia ? "with" : "without")
    setError("")
    cloneProduct(product.id, copyMedia)
      .then((data) => router.push(editLink(data.id)))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "کپی محصول انجام نشد")
        setBusy("")
      })
  }

  return (
    <Modal open={open && product !== null} onClose={close} closeOnBackdrop={!busy} size="sm">
      {product ? (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="flex h-8 items-center ps-10 text-base font-semibold">کپی محصول</h2>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{product.title || "بدون نام"}</p>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">
            عکس و فیلم هم به پیش‌نویس جدید برود؟ اگر نه، کالا بدون کاور، گالری و ویدیو ساخته می‌شود.
          </p>
          <div className="grid gap-2">
            <Button className="h-11 rounded-xl" disabled={Boolean(busy)} onClick={() => copy(true)}>
              {busy === "with" ? "در حال کپی..." : "با عکس و فیلم"}
            </Button>
            <button
              type="button"
              disabled={Boolean(busy)}
              className="h-11 rounded-xl border bg-background text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => copy(false)}
            >
              {busy === "without" ? "در حال کپی..." : "بدون عکس و فیلم"}
            </button>
            <button
              type="button"
              disabled={Boolean(busy)}
              className="h-10 text-sm text-muted-foreground hover:text-foreground disabled:opacity-60"
              onClick={close}
            >
              انصراف
            </button>
          </div>
          {error ? <p className="text-sm leading-6 text-destructive">{error}</p> : null}
        </div>
      ) : null}
    </Modal>
  )
}
