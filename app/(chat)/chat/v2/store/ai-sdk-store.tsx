'use client'

import React from 'react'
import { useChat } from 'ai/react'

// AI SDK Tools Store Setup - Connected to your unified API
export function AISDKStoreProvider({ children }: { children: React.ReactNode }) {
  // Initialize AI SDK with your unified endpoint
  const chat = useChat({
    api: '/api/chat/unified'
  })

  return <>{children}</>
}

// Official hooks for accessing chat state (per actual exports)
export { 
  useChatMessages, 
  useChatActions, 
  useChatStatus,
  useChatError,
  useChatStoreState 
} from '@ai-sdk-tools/store'

// Export devtools for development
export { AIDevtools } from '@ai-sdk-tools/devtools'