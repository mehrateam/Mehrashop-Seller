import type { Metadata } from "next"
import "./fonts.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "مهراشاپ — پنل فروشنده",
  description: "پنل مدیریت فروشنده مهراشاپ",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="h-full font-sans antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  )
}
