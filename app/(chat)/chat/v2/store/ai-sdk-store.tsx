'use client'

import React from 'react'
import { useChat } from 'ai/react'

// AI SDK Tools Store Setup - Connected to your unified API
export function AISDKStoreProvider({ children }: { children: React.ReactNode }) {
  // Initialize AI SDK with your unified endpoint (now AI SDK backend)
  const chat = useChat({
    api: '/api/chat/unified', // Your existing API with AI SDK backend
    body: {
      // Pass through your original context and features
      enableIntelligence: true,
      enableMultimodal: true,
      enableVoice: true,
      enableAdmin: true
    }
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