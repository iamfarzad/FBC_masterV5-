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
  const messagesRef = useRef<UnifiedMessage[]>(options.initialMessages || [])
  const chatContextRef = useRef<UnifiedContext>(options.context || {})

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    chatContextRef.current = chatContextState
  }, [chatContextState])

  const commitMessages = useCallback((
    next: UnifiedMessage[] | ((prev: UnifiedMessage[]) => UnifiedMessage[]),
  ) => {
    setMessages(prev => {
      const computed = typeof next === 'function' ? next(prev) : next
      messagesRef.current = computed
      return computed
    })
  }, [])

  const addMessage = useCallback((message: Omit<UnifiedMessage, 'id'> & { id?: string }): UnifiedMessage => {
    const { id, ...rest } = message
    const newMessage: UnifiedMessage = {
      ...rest,
      id: id || crypto.randomUUID(),
      timestamp: rest.timestamp || new Date(),
      type: rest.type || 'text',
      metadata: rest.metadata || {},
    }

    commitMessages(prev => [...prev, newMessage])
    return newMessage
  }, [commitMessages])

  const replaceMessages = useCallback((nextMessages: UnifiedMessage[]) => {
    commitMessages(nextMessages)
  }, [commitMessages])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearMessages = useCallback(() => {
    commitMessages([])
    setError(null)
  }, [commitMessages])

  const updateContext = useCallback((context: Partial<UnifiedContext>) => {
    setChatContextState(prev => ({ ...prev, ...context }))
  }, [])

  const runRequest = useCallback(async (requestMessages: UnifiedMessage[]) => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      setIsLoading(true)
      setError(null)

      const response = await fetch(SIMPLE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': options.sessionId || 'anonymous',
        },
        body: JSON.stringify({
          messages: requestMessages,
          context: chatContextRef.current,
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
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }

      const normalizedError = err instanceof Error ? err : new Error(String(err))
      setError(normalizedError)
      addMessage({
        role: 'assistant',
        content: `I encountered an error: ${normalizedError.message}`,
        timestamp: new Date(),
        type: 'text',
        metadata: { error: true },
      })
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [addMessage, options.mode, options.sessionId])

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || isLoading) return

    const trimmed = content.trim()
    const userMessage: UnifiedMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
      type: 'text',
      metadata: {},
    }

    commitMessages(prev => [...prev, userMessage])
    await runRequest([...messagesRef.current])
  }, [commitMessages, runRequest, isLoading])

  const stop = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    setIsLoading(false)
  }, [])

  const regenerate = useCallback(async () => {
    const current = messagesRef.current
    const lastUserIndex = [...current].map(message => message.role).lastIndexOf('user')
    if (lastUserIndex === -1) return

    const truncated = current.slice(0, lastUserIndex + 1)
    commitMessages(truncated)

    await runRequest(truncated)
  }, [commitMessages, runRequest])

  const resumeStream = useCallback(async () => {
    await regenerate()
  }, [regenerate])

  const addToolResult = useCallback(async (
    toolCallId: string,
    result: unknown,
    metadata: Record<string, unknown> = {},
  ) => {
    commitMessages(prev => prev.map(message => {
      if (message.role !== 'assistant') return message

      const existingInvocations = Array.isArray(message.metadata?.toolInvocations)
        ? [...message.metadata!.toolInvocations]
        : []

      const index = existingInvocations.findIndex((inv: any) => inv?.toolCallId === toolCallId)
      const nextInvocation = {
        toolCallId,
        result,
        state: 'output-available',
        ...metadata,
      }

      if (index === -1) {
        existingInvocations.push(nextInvocation)
      } else {
        existingInvocations[index] = { ...existingInvocations[index], ...nextInvocation }
      }

      return {
        ...message,
        metadata: {
          ...message.metadata,
          toolInvocations: existingInvocations,
        },
      }
    }))
  }, [commitMessages])

  const chatStatus = useMemo<'ready' | 'submitted' | 'error'>(() => {
    if (error) return 'error'
    if (isLoading) return 'submitted'
    return 'ready'
  }, [error, isLoading])

  useEffect(() => {
    if (options.context) {
      setChatContextState(prev => ({ ...prev, ...options.context! }))
    }
  }, [options.context])

  useEffect(() => {
    syncUnifiedChatStoreState({
      id: options.sessionId || 'simple-session',
      messages,
      status: chatStatus,
      error: error ?? null,
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
    chatStatus,
    error,
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

  useEffect(() => () => {
    resetUnifiedChatStore(UNIFIED_CHAT_STORE_ID)
  }, [])

  return {
    messages,
    isLoading,
    isStreaming: false,
    error,
    context: chatContextState,
    sendMessage,
    addMessage,
    clearMessages,
    updateContext,
    stop,
    regenerate,
    resumeStream,
    addToolResult,
    setMessages: replaceMessages,
    clearError,
  }
}
