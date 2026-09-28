"use client"

import { useSearchParams } from "next/navigation"
import { TicketList } from "@/components/support/TicketList"
import { TicketView } from "@/components/support/TicketView"

export function SupportScreen() {
  const id = useSearchParams().get("ticket")
  return id ? <TicketView id={id} /> : <TicketList />
}
