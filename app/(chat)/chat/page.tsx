"use client"

import { useEffect } from "react"

export default function ChatPage() {
  // Redirect to V2 - Your AI SDK Tools implementation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🚀 Redirecting to Chat V2 (AI SDK Tools implementation)')
      window.location.href = '/chat/v2'
    }
  }, [])

  // Show loading while redirecting
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 mx-auto animate-spin rounded-full border-2 border-brand border-t-transparent"></div>
        <p className="text-text-muted">Redirecting to Chat V2...</p>
      </div>
    </div>
  )
}