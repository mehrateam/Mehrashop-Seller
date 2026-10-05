"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getDisplayName, getUser, logout } from "@/lib/auth"

export function UserProfile() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [user] = useState(() => getUser())
  const name = getDisplayName(user)
  const profileImage = user?.profile_image || ""
  const storeUsername = user?.store_username || ""
  const initial = name.charAt(0) || "ف"
  const storeUrl = storeUsername ? `https://mehrashop.com/seller/${storeUsername}` : ""

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    addEventListener("keydown", onKey)
    return () => {
      removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <div className="user-profile">
      <button
        type="button"
        className="user-profile-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="user-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="avatar">
          {profileImage ? (
            <Image src={profileImage} alt={name} width={42} height={42} />
          ) : (
            initial
          )}
        </div>
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
            <div id="user-menu" className="user-menu" onClick={() => setOpen(false)}>
              <div
                className="user-menu-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-menu-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="user-menu-handle" aria-hidden="true" />
                <button
                  className="user-menu-close"
                  type="button"
                  aria-label="بستن"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>

                <div className="user-menu-head">
                  <div className="avatar user-menu-avatar">
                    {profileImage ? (
                      <Image src={profileImage} alt={name} width={42} height={42} />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="user-info">
                    <span id="user-menu-title" className="user-name">
                      {name}
                    </span>
                    <span className="user-role">مدیر فروشگاه</span>
                  </div>
                </div>

                <nav className="user-menu-list">
                  <a
                    className="user-menu-item"
                    href="https://mehrashop.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="user-menu-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
                      </svg>
                    </span>
                    <span className="user-menu-copy">
                      <span>نمایش سایت</span>
                      <small>mehrashop.com</small>
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

                  {storeUrl ? (
                    <a
                      className="user-menu-item"
                      href={storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="user-menu-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </span>
                      <span className="user-menu-copy">
                        <span>نمایش فروشنده سایت</span>
                        <small>mehrashop.com/seller/{storeUsername}</small>
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
                  ) : null}

                  <Link href="/store" className="user-menu-item" onClick={() => setOpen(false)}>
                    <span className="user-menu-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <circle cx="9" cy="10" r="2" />
                        <path d="M15 9h4M15 13h4M7 16h4" />
                      </svg>
                    </span>
                    <span className="user-menu-copy">
                      <span>پروفایل فروشگاه</span>
                      <small>اطلاعات، تصاویر و محصولات</small>
                    </span>
                  </Link>

                  <Link href="/store/edit" className="user-menu-item" onClick={() => setOpen(false)}>
                    <span className="user-menu-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
                      </svg>
                    </span>
                    <span className="user-menu-copy">
                      <span>تنظیمات فروشگاه</span>
                      <small>ویرایش اطلاعات فروشگاه</small>
                    </span>
                  </Link>

                  <div className="user-menu-sep" />

                  <button
                    className="user-menu-item user-menu-item--danger"
                    type="button"
                    onClick={async () => {
                      await logout()
                      router.replace("/auth")
                    }}
                  >
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
