import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { WelcomeModal } from "@/components/auth/WelcomeModal"

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="mx-auto flex min-h-svh max-w-[1720px] gap-6 p-3 sm:p-5">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <Header />
          {children}
        </main>
      </div>
      <WelcomeModal />
    </AuthGuard>
  )
}
