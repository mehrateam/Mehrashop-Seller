"use client"

import { useCallback, useState, type ReactNode } from "react"
import Header from "@/components/layout/Header"
import { MobileNav } from "@/components/layout/MobileNav"
import Sidebar from "@/components/layout/Sidebar"

export function PanelFrame({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <div className="mx-auto flex min-h-svh max-w-[1720px] gap-3 p-3 sm:gap-6 sm:p-5">
      <Sidebar />
      <MobileNav open={menuOpen} onClose={closeMenu} />
      <main className="flex min-w-0 flex-1 flex-col gap-6">
        <Header onOpenMenu={openMenu} />
        {children}
      </main>
    </div>
  )
}
