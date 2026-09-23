"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { getDisplayName, getUser, logout } from "@/lib/auth"

const links = [
  { href: "https://mehrashop.com/", label: "نمایش سایت", hint: "mehrashop.com", icon: "globe" as const },
  { href: "https://mehrashop.com/blogs", label: "نمایش بلاگ", hint: "mehrashop.com/blogs", icon: "book" as const },
]

const subscribe = () => () => {}

function readName() {
  return getDisplayName(getUser())
}

export function UserProfile() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const name = useSyncExternalStore(subscribe, readName, () => "فروشنده")
  const initial = name.charAt(0) || "ف"

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    addEventListener("keydown", onKey)
    return () => {
      removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open])

  const close = () => setOpen(false)
  const toggle = () => setOpen((v) => !v)

  async function onLogout() {
    await logout()
    router.replace("/login")
  }

  return (
    <div className="user-profile">
      <button
        type="button"
        className="user-profile-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="user-menu"
        onClick={toggle}
      >
        <div className="avatar">{initial}</div>
        <div className="user-info">
          <span className="user-name">{name}</span>
          <span className="user-role">مدیر فروشگاه</span>
        </div>
        <svg
          className="user-profile-chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open
        ? createPortal(
            <div id="user-menu" className="user-menu" onClick={close}>
              <div
                className="user-menu-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-menu-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="user-menu-handle" aria-hidden="true" />
                <button className="user-menu-close" type="button" aria-label="بستن" onClick={close}>
                  ×
                </button>

                <div className="user-menu-head">
                  <div className="avatar user-menu-avatar">{initial}</div>
                  <div className="user-info">
                    <span id="user-menu-title" className="user-name">
                      {name}
                    </span>
                    <span className="user-role">مدیر فروشگاه</span>
                  </div>
                </div>

                <nav className="user-menu-list">
                  {links.map((link) => (
                    <a
                      key={link.href}
                      className="user-menu-item"
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="user-menu-icon">
                        {link.icon === "globe" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H20v13H6.5A2.5 2.5 0 0 1 4 17.5z" />
                          </svg>
                        )}
                      </span>
                      <span className="user-menu-copy">
                        <span>{link.label}</span>
                        <small>{link.hint}</small>
                      </span>
                      <svg
                        className="user-menu-arrow"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M7 17L17 7M7 7h10v10" />
                      </svg>
                    </a>
                  ))}

                  <div className="user-menu-sep" />

                  <button className="user-menu-item user-menu-item--danger" type="button" onClick={onLogout}>
                    <span className="user-menu-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </span>
                    <span className="user-menu-copy">
                      <span>خروج از حساب کاربری</span>
                      <small>پایان نشست فعلی</small>
                    </span>
                  </button>
                </nav>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
