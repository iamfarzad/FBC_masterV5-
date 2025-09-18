/**
 * Unified Chat Hook - AI SDK Backend
 * Compatibility layer that connects to AI SDK
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  UnifiedMessage,
  UnifiedChatOptions,
  UnifiedChatReturn,
  UnifiedChatRequest,
  UnifiedContext
} from '@/src/core/chat/unified-types'
import {
  UNIFIED_CHAT_STORE_ID,
  syncUnifiedChatStoreState,
  resetUnifiedChatStore,
} from '@/src/core/chat/state/unified-chat-store'

export function useUnifiedChat(options: UnifiedChatOptions): UnifiedChatReturn {
  const [messages, setMessages] = useState<UnifiedMessage[]>(options.initialMessages || [])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [chatContextState, setChatContextState] = useState<UnifiedContext>(options.context || {})

  const abortControllerRef = useRef<AbortController | null>(null)

  const addMessage = useCallback((message: Omit<UnifiedMessage, 'id'>): UnifiedMessage => {
    const newMessage: UnifiedMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: message.timestamp || new Date(),
      type: message.type || 'text',
      metadata: message.metadata || {}
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])

  const updateMessage = useCallback((id: string, updates: Partial<UnifiedMessage>) => {
    setMessages(prev =>
      prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg)
    )
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const replaceMessages = useCallback((nextMessages: UnifiedMessage[]) => {
    setMessages(nextMessages)
  }, [])

  const stop = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsStreaming(false)
    setIsLoading(false)
  }, [])

  const regenerate = useCallback(async () => {
    console.warn('Regenerate not implemented for unified chat yet.')
  }, [])

  const resumeStream = useCallback(async () => {
    console.warn('resumeStream not implemented for unified chat yet.')
  }, [])

  const addToolResult = useCallback(async () => {
    console.warn('addToolResult not implemented for unified chat yet.')
  }, [])

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || isLoading || isStreaming) return

    const reqId = crypto.randomUUID()
    console.log('[UNIFIED_AI_SDK] Sending:', reqId)

    try {
      setIsLoading(true)
      setError(null)

      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      // Add user message
      const userMessage = addMessage({
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        type: 'text'
      })

      // Prepare request for unified API (AI SDK backend)
      const request: UnifiedChatRequest = {
        messages: [...messages, userMessage],
        context: chatContextState,
        mode: options.mode || 'standard',
        stream: true
      }

      // Call unified API with AI SDK backend
      const response = await fetch('/api/chat/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': reqId,
          'x-session-id': options.sessionId || 'anonymous'
        },
        body: JSON.stringify(request),
        signal: controller.signal
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      setIsLoading(false)
      setIsStreaming(true)

      // Parse SSE stream from AI SDK backend
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      let assistantMessage: UnifiedMessage | null = null
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.role === 'assistant') {
                if (!assistantMessage) {
                  assistantMessage = addMessage({
                    role: 'assistant',
                    content: data.content,
                    timestamp: new Date(),
                    type: 'text',
                    metadata: data.metadata || {}
                  })
                } else {
                  updateMessage(assistantMessage.id, {
                    content: data.content,
                    metadata: data.metadata || {}
                  })
                }

                options.onMessage?.(data)

                if (data.metadata?.isComplete) {
                  setIsStreaming(false)
                  options.onComplete?.()
                  break
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

    } catch (err) {
      setIsLoading(false)
      setIsStreaming(false)

      const normalizedError = err instanceof Error ? err : new Error(String(err))
      setError(normalizedError)
      options.onError?.(normalizedError)

      if (normalizedError.name !== 'AbortError') {
        addMessage({
          role: 'assistant',
          content: `I apologize, but I encountered an error: ${normalizedError.message}. Please try again.`,
          timestamp: new Date(),
          type: 'text',
          metadata: { error: true }
        })
      }
    } finally {
      abortControllerRef.current = null
    }
  }, [messages, isLoading, isStreaming, options, chatContextState, addMessage, updateMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const updateContext = useCallback((context: Partial<UnifiedContext>) => {
    setChatContextState(prev => ({ ...prev, ...context }))
  }, [])

  const chatStatus = useMemo(() => {
    if (error) return 'error' as const
    if (isStreaming) return 'streaming' as const
    if (isLoading) return 'submitted' as const
    return 'ready' as const
  }, [error, isStreaming, isLoading])

  useEffect(() => {
    if (options.context) {
      setChatContextState(prev => ({ ...prev, ...options.context }))
    }
  }, [options.context])

  useEffect(() => {
    syncUnifiedChatStoreState({
      id: options.sessionId || 'unified-session',
      messages,
      error: error ?? undefined,
      status: chatStatus,
      context: chatContextState,
      sendMessage,
      regenerate,
      stop,
      resumeStream,
      addToolResult,
      setMessages: replaceMessages,
      clearError,
    }, UNIFIED_CHAT_STORE_ID)
  }, [
    messages,
    error,
    chatStatus,
    chatContextState,
    sendMessage,
    regenerate,
    stop,
    resumeStream,
    addToolResult,
    replaceMessages,
    clearError,
    options.sessionId,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      resetUnifiedChatStore(UNIFIED_CHAT_STORE_ID)
    }
  }, [])

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    addMessage,
    clearMessages,
    updateContext
  }
}
