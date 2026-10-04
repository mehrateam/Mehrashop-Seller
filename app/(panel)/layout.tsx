import { AuthGuard } from "@/components/auth/AuthGuard"
import { PanelFrame } from "@/components/layout/PanelFrame"
import { WelcomeModal } from "@/components/auth/WelcomeModal"

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <PanelFrame>{children}</PanelFrame>
      <WelcomeModal />
    </AuthGuard>
  )
}
