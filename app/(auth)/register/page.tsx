import { Suspense } from "react"
import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/RegisterForm"

export const metadata: Metadata = {
  title: "ثبت‌نام",
}

export default function RegisterPage() {
  return (
    <main className="min-h-svh">
      <Suspense
        fallback={
          <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
            در حال بارگذاری...
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </main>
  )
}
