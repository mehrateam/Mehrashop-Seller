"use client"

import { useState, useSyncExternalStore } from "react"
import { CheckIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"

const FLAG = "show_welcome_modal"
const subscribe = () => () => {}

function readFlag() {
  return sessionStorage.getItem(FLAG) === "1"
}

export function WelcomeModal({
  title = "خوش آمدید",
  message = "ورود شما با موفقیت انجام شد.",
}: {
  title?: string
  message?: string
}) {
  const flagged = useSyncExternalStore(subscribe, readFlag, () => false)
  const [dismissed, setDismissed] = useState(false)
  const open = flagged && !dismissed

  function close() {
    sessionStorage.removeItem(FLAG)
    setDismissed(true)
  }

  return (
    <Modal open={open} onClose={close} size="sm">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <div className="grid size-11 place-items-center rounded-full bg-primary/12 text-xl font-bold text-[#537000]">
          <CheckIcon weight="bold" className="size-5" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mb-1 text-sm text-muted-foreground">{message}</p>
        <Button type="button" onClick={close} className="mt-1 min-w-[140px] rounded-xl">
          متوجه شدم
        </Button>
      </div>
    </Modal>
  )
}
