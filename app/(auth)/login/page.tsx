import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "ورود — مهراشاپ فروشنده",
}

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-5">
      <LoginForm />
    </main>
  )
}
