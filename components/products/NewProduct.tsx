"use client"

import { useEffect, useState } from "react"
import { fetchDraftLimit } from "@/lib/products"

export function NewProduct() {
  const [blocked, setBlocked] = useState("")

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

  if (!blocked) return null

  return <p className="text-sm leading-7 text-[#DD794F]">{blocked}</p>
}
