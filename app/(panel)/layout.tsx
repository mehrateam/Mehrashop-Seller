import { AuthGuard } from "@/components/auth/AuthGuard"
import { SellLock } from "@/components/access/SellLock"
import { PanelFrame } from "@/components/layout/PanelFrame"
import { WelcomeModal } from "@/components/auth/WelcomeModal"

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <PanelFrame>
        <SellLock>{children}</SellLock>
      </PanelFrame>
      <WelcomeModal />
    </AuthGuard>
  )
}
