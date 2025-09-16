/**
 * AI SDK Chat Hook
 * Clean implementation using AI SDK's useChat with global state
 */

import { useChat } from 'ai/react'
import { useCallback } from 'react'
import type { Message } from 'ai'

interface AISDKChatOptions {
  sessionId?: string
  mode?: 'standard' | 'realtime' | 'admin' | 'multimodal'
  context?: {
    sessionId?: string
    leadContext?: {
      name?: string
      email?: string
      company?: string
      role?: string
    }
    intelligenceContext?: any
    conversationIds?: string[]
    adminId?: string
    multimodalData?: any
  }
  initialMessages?: Message[]
  onMessage?: (message: Message) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

export function useAISDKChat(options: AISDKChatOptions) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
    append,
    setMessages,
    setInput
  } = useChat({
    api: '/api/chat',
    initialMessages: options.initialMessages,
    body: {
      sessionId: options.sessionId,
      mode: options.mode || 'standard',
      context: options.context
    },
    onResponse: (response: Response) => {
      console.log('[AI_SDK_CHAT] Response received:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      })
    },
    onFinish: (message: Message) => {
      console.log('[AI_SDK_CHAT] Finished:', message.content.slice(0, 100) + '...')
      options.onComplete?.()
      options.onMessage?.(message)
    },
    onError: (error: Error) => {
      console.error('[AI_SDK_CHAT] Error:', error)
      options.onError?.(error)
    }
  })

  // Convert AI SDK Message to our UnifiedMessage format for compatibility
  const unifiedMessages = messages.map((msg: Message) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.createdAt || new Date(),
    type: 'text' as const,
    metadata: {}
  }))

  // Compatibility methods
  const sendMessage = useCallback(async (content: string) => {
    await append({
      role: 'user',
      content
    })
  }, [append])

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }
    setMessages([...messages, newMessage])
    return {
      ...newMessage,
      timestamp: newMessage.createdAt || new Date(),
      type: 'text' as const,
      metadata: {}
    }
  }, [messages, setMessages])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [setMessages])

  const updateContext = useCallback((newContext: Partial<typeof options.context>) => {
    // Context updates would be handled through re-initialization
    // or by triggering a new request with updated context
    console.log('[AI_SDK_CHAT] Context update requested:', newContext)
  }, [])

  return {
    // AI SDK native properties
    messages: unifiedMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isStreaming: isLoading, // AI SDK doesn't separate loading vs streaming
    error,
    reload,
    stop,
    setInput,

    // Compatibility methods for existing code
    sendMessage,
    addMessage,
    clearMessages,
    updateContext
  }
}

// Legacy compatibility exports
export function useUnifiedChatSDK(options: AISDKChatOptions) {
  console.warn('⚠️ useUnifiedChatSDK is deprecated. Use useAISDKChat instead.')
  return useAISDKChat(options)
}

export function useChatSDK(options: Omit<AISDKChatOptions, 'mode'>) {
  console.warn('⚠️ useChatSDK is deprecated. Use useAISDKChat instead.')
  return useAISDKChat({ ...options, mode: 'standard' })
}

export function useRealtimeChatSDK(options: Omit<AISDKChatOptions, 'mode'>) {
  console.warn('⚠️ useRealtimeChatSDK is deprecated. Use useAISDKChat instead.')
  return useAISDKChat({ ...options, mode: 'realtime' })
}