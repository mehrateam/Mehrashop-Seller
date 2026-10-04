"use client"

import { useEffect, useState, type FormEvent } from "react"
import { MapPinIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react"
import {
  deleteBranch,
  fetchProvinces,
  latinNumber,
  mapLink,
  saveBranch,
  type ProvinceOption,
  type StoreBranch,
} from "@/lib/store"
import { MapPicker } from "@/components/store/MapPicker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"

const fieldClass = "h-11 rounded-xl border-border bg-muted px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const blank = {
  name: "",
  phone_company: "",
  address: "",
  province: "",
  city: "",
  no: "",
  unit: "",
  postal_code: "",
  x_coordination: "",
  y_coordination: "",
}

type Draft = typeof blank & { id?: number }
type Notice = { ok: boolean; title: string; text: string }

export function StoreAddresses({
  branches,
  onChange,
  onDone,
}: {
  branches: StoreBranch[]
  onChange: (branches: StoreBranch[]) => void
  onDone: (message: Notice) => void
}) {
  const [provinces, setProvinces] = useState<ProvinceOption[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [removeId, setRemoveId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    fetchProvinces()
      .then((data) => {
        if (alive) setProvinces(data)
      })
      .catch((err: unknown) => {
        if (alive) onDone({ ok: false, title: "خطا", text: err instanceof Error ? err.message : "خطا در دریافت استان‌ها" })
      })
    return () => {
      alive = false
    }
  }, [onDone])

  const cities = provinces.find((item) => String(item.id) === draft?.province)?.city ?? []
  const lat = Number(latinNumber(draft?.x_coordination || ""))
  const lng = Number(latinNumber(draft?.y_coordination || ""))

  async function onSave(event: FormEvent) {
    event.preventDefault()
    if (!draft) return
    const postal = latinNumber(draft.postal_code).replace(/\D/g, "")
    const no = Number(latinNumber(draft.no))
    const unit = Number(latinNumber(draft.unit))
    const problem = !draft.name.trim()
      ? "عنوان شعبه را وارد کنید"
      : !draft.phone_company.trim()
        ? "شماره تماس شعبه را وارد کنید"
        : !draft.address.trim()
          ? "نشانی پستی را وارد کنید"
          : !draft.province || !draft.city
            ? "استان و شهر را انتخاب کنید"
            : !no || !unit
              ? "پلاک و واحد را وارد کنید"
              : !/^\d{10}$/.test(postal)
                ? "کد پستی باید ۱۰ رقم و بدون خط تیره باشد"
                : !lat || !lng
                  ? "عرض و طول جغرافیایی را وارد کنید"
                  : ""
    if (problem) {
      onDone({ ok: false, title: "آدرس ناقص است", text: problem })
      return
    }
    setBusy(true)
    try {
      const saved = await saveBranch(
        {
          name: draft.name.trim(),
          address: draft.address.trim(),
          phone_company: draft.phone_company.trim(),
          postal_code: postal,
          no,
          unit,
          province: Number(draft.province),
          city: Number(draft.city),
          x_coordination: lat,
          y_coordination: lng,
        },
        draft.id
      )
      onChange(draft.id ? branches.map((item) => (item.id === saved.id ? saved : item)) : [...branches, saved])
      setDraft(null)
      onDone({ ok: true, title: draft.id ? "آدرس ویرایش شد" : "آدرس ثبت شد", text: saved.name || "شعبه فروشگاه" })
    } catch (err: unknown) {
      onDone({ ok: false, title: "ثبت آدرس انجام نشد", text: err instanceof Error ? err.message : "ثبت آدرس انجام نشد" })
    } finally {
      setBusy(false)
    }
  }

  async function onDelete() {
    if (!removeId) return
    setBusy(true)
    try {
      await deleteBranch(removeId)
      onChange(branches.filter((item) => item.id !== removeId))
      setRemoveId(null)
      onDone({ ok: true, title: "آدرس حذف شد", text: "این شعبه دیگر نمایش داده نمی‌شود" })
    } catch (err: unknown) {
      onDone({ ok: false, title: "حذف انجام نشد", text: err instanceof Error ? err.message : "حذف آدرس انجام نشد" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Card className="rounded-2xl ring-foreground/5">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>آدرس‌های فروشگاه</CardTitle>
            <CardDescription>اگر فروش حضوری فعال باشد، این آدرس‌ها به خریدار نشان داده می‌شود.</CardDescription>
          </div>
          <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => setDraft({ ...blank })}>
            <PlusIcon data-icon="inline-start" />
            آدرس جدید
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {branches.length === 0 ? (
            <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              هنوز آدرسی ثبت نشده
            </div>
          ) : (
            branches.map((branch) => {
              const province = provinces.find((item) => item.id === branch.province)
              const city = province?.city.find((item) => item.id === branch.city)
              const place = [province?.name, city?.name].filter(Boolean).join("، ")
              return (
                <article key={branch.id} className="flex items-start gap-3 rounded-xl border p-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <MapPinIcon className="size-5" weight="fill" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{branch.name || "شعبه"}</p>
                        {place ? <p className="mt-0.5 text-xs text-muted-foreground">{place}</p> : null}
                      </div>
                      <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="ویرایش آدرس"
                      onClick={() =>
                        setDraft({
                          id: branch.id,
                          name: branch.name || "",
                          phone_company: branch.phone_company || "",
                          address: branch.address || "",
                          province: branch.province ? String(branch.province) : "",
                          city: branch.city ? String(branch.city) : "",
                          no: branch.no ? String(branch.no) : "",
                          unit: branch.unit ? String(branch.unit) : "",
                          postal_code: branch.postal_code || "",
                          x_coordination: branch.x_coordination ? String(branch.x_coordination) : "",
                          y_coordination: branch.y_coordination ? String(branch.y_coordination) : "",
                        })
                      }
                    >
                      <PencilSimpleIcon />
                    </Button>
                    <Button type="button" variant="destructive" size="icon" aria-label="حذف آدرس" onClick={() => setRemoveId(branch.id)}>
                      <TrashIcon />
                    </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-7">{branch.address || "نشانی ثبت نشده"}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>تماس: {branch.phone_company || "—"}</span>
                      {branch.postal_code ? <span>کد پستی: {branch.postal_code}</span> : null}
                      {branch.x_coordination || branch.y_coordination ? (
                        <a
                          href={mapLink(branch.x_coordination, branch.y_coordination)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-primary"
                        >
                          مشاهده نقشه
                        </a>
                      ) : null}
                    </p>
                  </div>
                </article>
              )
            })
          )}
        </CardContent>
      </Card>

      <Modal open={draft !== null} onClose={() => setDraft(null)} size="lg">
        <form onSubmit={onSave} className="flex flex-col gap-4">
          <div className="ps-11">
            <h2 className="text-lg font-bold leading-8">{draft?.id ? "ویرایش آدرس" : "آدرس جدید"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">نشانی شعبه و موقعیت آن روی نقشه</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="branch-name" className="text-[13px] font-semibold text-muted-foreground">عنوان شعبه</Label>
              <Input id="branch-name" value={draft?.name || ""} onChange={(event) => setDraft((prev) => prev && { ...prev, name: event.target.value })} className={fieldClass} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="branch-phone" className="text-[13px] font-semibold text-muted-foreground">شماره تماس</Label>
              <Input id="branch-phone" value={draft?.phone_company || ""} onChange={(event) => setDraft((prev) => prev && { ...prev, phone_company: event.target.value })} className={fieldClass} />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="branch-address" className="text-[13px] font-semibold text-muted-foreground">نشانی پستی</Label>
              <textarea
                id="branch-address"
                value={draft?.address || ""}
                onChange={(event) => setDraft((prev) => prev && { ...prev, address: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-border bg-muted px-3.5 py-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <select
              aria-label="استان"
              value={draft?.province || ""}
              onChange={(event) => setDraft((prev) => prev && { ...prev, province: event.target.value, city: "" })}
              className={fieldClass}
            >
              <option value="">استان</option>
              {provinces.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <select
              aria-label="شهر"
              value={draft?.city || ""}
              onChange={(event) => setDraft((prev) => prev && { ...prev, city: event.target.value })}
              className={fieldClass}
            >
              <option value="">شهر</option>
              {cities.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            {[
              ["no", "پلاک"],
              ["unit", "واحد"],
              ["postal_code", "کد پستی"],
            ].map(([key, label]) => (
              <div key={key} className="flex flex-col gap-2">
                <Label htmlFor={`branch-${key}`} className="text-[13px] font-semibold text-muted-foreground">{label}</Label>
                <Input
                  id={`branch-${key}`}
                  inputMode="numeric"
                  value={draft?.[key as "no" | "unit" | "postal_code"] || ""}
                  onChange={(event) => setDraft((prev) => prev && { ...prev, [key]: event.target.value })}
                  className={fieldClass}
                />
              </div>
            ))}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label className="text-[13px] font-semibold text-muted-foreground">موقعیت روی نقشه</Label>
              <p className="text-xs text-muted-foreground">روی نقشه کلیک کنید. برای جابه‌جایی بکشید و با چرخ ماوس بزرگ‌نمایی کنید.</p>
              <MapPicker
                lat={lat}
                lng={lng}
                onPick={(nextLat, nextLng) =>
                  setDraft((prev) =>
                    prev && {
                      ...prev,
                      x_coordination: String(nextLat),
                      y_coordination: String(nextLng),
                    }
                  )
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="branch-lat" className="text-[13px] font-semibold text-muted-foreground">عرض جغرافیایی</Label>
              <Input id="branch-lat" inputMode="decimal" value={draft?.x_coordination || ""} onChange={(event) => setDraft((prev) => prev && { ...prev, x_coordination: event.target.value })} className={fieldClass} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="branch-lng" className="text-[13px] font-semibold text-muted-foreground">طول جغرافیایی</Label>
              <Input id="branch-lng" inputMode="decimal" value={draft?.y_coordination || ""} onChange={(event) => setDraft((prev) => prev && { ...prev, y_coordination: event.target.value })} className={fieldClass} />
            </div>
          </div>
          <div className="sticky bottom-0 z-10 -mx-6 -mb-6 flex justify-end gap-2 border-t bg-card px-6 py-3">
            <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => setDraft(null)}>انصراف</Button>
            <Button type="submit" disabled={busy} className="h-10 rounded-xl px-4">{busy ? "در حال ذخیره..." : "ذخیره آدرس"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={removeId !== null} onClose={() => setRemoveId(null)} size="sm">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
            <TrashIcon weight="bold" className="size-5" />
          </div>
          <h2 className="text-xl font-bold">حذف آدرس</h2>
          <p className="text-sm text-muted-foreground">این شعبه از فروشگاه حذف شود؟</p>
          <div className="flex w-full justify-center gap-2">
            <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => setRemoveId(null)}>انصراف</Button>
            <Button type="button" variant="destructive" className="h-10 rounded-xl" disabled={busy} onClick={onDelete}>
              {busy ? "در حال حذف..." : "حذف"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
