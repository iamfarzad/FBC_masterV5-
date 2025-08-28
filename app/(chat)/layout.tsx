import type { Metadata } from "next"
import { StageProvider } from "@/contexts/stage-context"

export const metadata: Metadata = {
  title: "AI Chat - F.B/c",
  description: "Intelligent AI assistant for business analysis and automation strategies",
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StageProvider>
      <div className="relative min-h-screen overflow-hidden">
        {children}
      </div>
    </StageProvider>
  )
}
