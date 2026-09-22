import { BellIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="flex h-[76px] items-center justify-between rounded-2xl border bg-card px-4 shadow-sm sm:px-7">
      <button
        type="button"
        className="flex w-full max-w-80 items-center gap-3 rounded-xl border bg-muted/60 px-4 py-2.5 text-start text-sm text-muted-foreground transition-colors hover:bg-background"
      >
        <MagnifyingGlassIcon className="size-4 shrink-0" />
        <span className="flex-1">جستجو...</span>
        <kbd className="hidden rounded-md border bg-card px-1.5 py-0.5 text-[11px] font-semibold sm:inline">
          ⌘ K
        </kbd>
      </button>

      <div className="ms-4 flex items-center gap-3">
        <Button variant="outline" size="icon" className="relative size-11 rounded-xl">
          <BellIcon className="size-4.5" />
          <span className="absolute top-2.5 end-2.5 size-1.5 rounded-full border-2 border-card bg-primary" />
        </Button>

        <div className="hidden items-center gap-3 border-s ps-3 sm:flex">
          <div className="flex size-10 items-center justify-center rounded-xl bg-foreground text-sm font-semibold text-background">
            ف
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">فروشنده</p>
            <p className="text-xs text-muted-foreground">مدیر فروشگاه</p>
          </div>
        </div>
      </div>
    </header>
  )
}
