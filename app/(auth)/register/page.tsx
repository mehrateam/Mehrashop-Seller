import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/RegisterForm"

export const metadata: Metadata = {
  title: "ثبت‌نام",
}

export default function RegisterPage() {
  return (
    <main className="min-h-svh">
      <RegisterForm />
    </main>
  )
}
