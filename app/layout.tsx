import type { Metadata } from "next"
import "./fonts.css"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "پنل مدیریت فروشنده مهراشاپ",
    template: "%s | پنل مدیریت فروشنده مهراشاپ",
  },
  description: "پنل مدیریت فروشنده مهراشاپ",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="h-full font-sans antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  )
}
