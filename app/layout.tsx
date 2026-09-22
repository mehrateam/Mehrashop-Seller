import type { Metadata } from "next"
import "./fonts.css"
import "./globals.css"

import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"

export const metadata: Metadata = {
  title: "مهراشاپ — پنل فروشنده",
  description: "پنل مدیریت فروشنده مهراشاپ",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="h-full font-sans antialiased">
      <body className="min-h-full bg-background text-foreground">
        <div className="mx-auto flex min-h-svh max-w-[1720px] gap-6 p-3 sm:p-5">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col gap-6">
            <Header />
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
