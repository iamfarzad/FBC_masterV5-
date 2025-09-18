/**
 * Simple AI SDK Hook
 * Non-streaming fallback that still mirrors state into the unified chat store.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

import {
  type UnifiedMessage,
  type UnifiedChatOptions,
  type UnifiedChatReturn,
  type UnifiedContext,
} from '@/src/core/chat/unified-types'
import {
  UNIFIED_CHAT_STORE_ID,
  syncUnifiedChatStoreState,
  resetUnifiedChatStore,
} from '@/src/core/chat/state/unified-chat-store'

const SIMPLE_ENDPOINT = '/api/chat/simple'

type SimpleResponse = {
  id: string
  role: 'assistant' | 'user'
  content: string
  metadata?: Record<string, unknown>
}

export function useSimpleAISDK(options: UnifiedChatOptions): UnifiedChatReturn {
  const [messages, setMessages] = useState<UnifiedMessage[]>(options.initialMessages || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [chatContextState, setChatContextState] = useState<UnifiedContext>(options.context || {})

  const abortControllerRef = useRef<AbortController | null>(null)

  const addMessage = useCallback((message: Omit<UnifiedMessage, 'id'>): UnifiedMessage => {
    const newMessage: UnifiedMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: message.timestamp || new Date(),
      type: message.type || 'text',
      metadata: message.metadata || {},
    }
    setMessages((prev) => [...prev, newMessage])
    return newMessage
  }, [])

  const updateMessage = useCallback((id: string, updates: Partial<UnifiedMessage>) => {
    setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, ...updates } : message)))
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const replaceMessages = useCallback((nextMessages: UnifiedMessage[]) => {
    setMessages(nextMessages)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const updateContext = useCallback((context: Partial<UnifiedContext>) => {
    setChatContextState((prev) => ({ ...prev, ...context }))
  }, [])

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || isLoading) return

    try {
      setIsLoading(true)
      setError(null)

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      const userMessage = addMessage({
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        type: 'text',
      })

      const response = await fetch(SIMPLE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': options.sessionId || 'anonymous',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: chatContextState,
          mode: options.mode || 'standard',
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      const data: SimpleResponse = await response.json()

      addMessage({
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        type: 'text',
        metadata: {
          mode: options.mode || 'standard',
          isComplete: true,
          ...(data.metadata || {}),
        },
      })
    } catch (err) {
      const normalizedError = err instanceof Error ? err : new Error(String(err))
      setError(normalizedError)
      if (normalizedError.name !== 'AbortError') {
        addMessage({
          role: 'assistant',
          content: `I encountered an error: ${normalizedError.message}`,
          timestamp: new Date(),
          type: 'text',
          metadata: { error: true },
        })
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [
    addMessage,
    chatContextState,
    isLoading,
    messages,
    options.mode,
    options.sessionId,
  ])

  const chatStatus = useMemo<"ready" | "submitted" | "error">(() => {
    if (error) return 'error'
    if (isLoading) return 'submitted'
    return 'ready'
  }, [error, isLoading])

  useEffect(() => {
    if (options.context) {
      setChatContextState((prev) => ({ ...prev, ...options.context! }))
    }
  }, [options.context])

  useEffect(() => {
    syncUnifiedChatStoreState({
      id: options.sessionId || 'simple-session',
      messages,
      status: chatStatus,
      error: error ?? undefined,
      context: chatContextState,
      sendMessage,
      regenerate: undefined,
      stop: async () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
      },
      resumeStream: undefined,
      addToolResult: undefined,
      setMessages: replaceMessages,
      clearError,
    }, UNIFIED_CHAT_STORE_ID)
  }, [
    messages,
    chatStatus,
    error,
    chatContextState,
    sendMessage,
    replaceMessages,
    clearError,
    options.sessionId,
  ])

  useEffect(() => {
    return () => {
      resetUnifiedChatStore(UNIFIED_CHAT_STORE_ID)
    }
  }, [])

  return {
    messages,
    isLoading,
    isStreaming: false,
    error,
    sendMessage,
    addMessage,
    clearMessages,
    updateContext,
  }
}
