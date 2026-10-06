"use client"

import { useCallback, useState, useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"
import { CheckIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"

const FLAG = "show_welcome_modal"
const KIND = "welcome_modal_kind"

export function WelcomeModal({
  title = "خوش آمدید",
  message = "ورود شما با موفقیت انجام شد.",
}: {
  title?: string
  message?: string
}) {
  const pathname = usePathname()
  const [revision, setRevision] = useState(0)
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("storage", onChange)
    return () => window.removeEventListener("storage", onChange)
  }, [])
  const kind = useSyncExternalStore(
    subscribe,
    () => {
      void pathname
      void revision
      if (sessionStorage.getItem(FLAG) !== "1") return ""
      return sessionStorage.getItem(KIND) === "registered" ? "registered" : "login"
    },
    () => ""
  )

  function close() {
    sessionStorage.removeItem(FLAG)
    sessionStorage.removeItem(KIND)
    setRevision((value) => value + 1)
  }

  const heading = kind === "registered" ? "ثبت‌نام کامل شد" : title
  const text = kind === "registered" ? "پروفایل، بنر و آدرس فروشگاه ثبت شد." : message

  return (
    <Modal open={kind !== ""} onClose={close} size="sm">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <div className="grid size-11 place-items-center rounded-full bg-primary/12 text-xl font-bold text-[#537000]">
          <CheckIcon weight="bold" className="size-5" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
        <p className="mb-1 text-sm text-muted-foreground">{text}</p>
        <Button type="button" onClick={close} className="mt-1 min-w-[140px] rounded-xl">
          متوجه شدم
        </Button>
      </div>
    </Modal>
  )
}
