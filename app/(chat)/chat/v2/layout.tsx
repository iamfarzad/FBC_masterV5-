/**
 * Chat V2 Layout - Source of Truth
 * Enhanced layout for AI SDK implementation
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'F.B/c AI Chat V2 - Source of Truth',
  description: 'Complete AI SDK implementation with intelligence, tools, and real-time capabilities',
  keywords: ['AI chat', 'business automation', 'AI SDK', 'intelligence', 'tools'],
}

export default function ChatV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      {children}
    </div>
  )
}