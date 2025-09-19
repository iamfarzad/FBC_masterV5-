/**
 * Native AI SDK Hook
 * Provides a richer streaming experience with tool invocation metadata while
 * mirroring all state into the unified chat store.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  type UnifiedChatOptions,
  type UnifiedChatReturn,
  type UnifiedContext,
  type UnifiedMessage,
} from '@/src/core/chat/unified-types'
import {
  UNIFIED_CHAT_STORE_ID,
  resetUnifiedChatStore,
  syncUnifiedChatStoreState,
} from '@/src/core/chat/state/unified-chat-store'

export interface NativeAISDKOptions extends UnifiedChatOptions {
  apiEndpoint?: string
}

export interface NativeAISDKReturn extends UnifiedChatReturn {
  append: (message: UnifiedMessage) => Promise<void>
  reload: () => Promise<void>
  toolInvocations: any[]
  annotations: any[]
}

type StreamRunOptions = {
  assistantId?: string
  requestId?: string
}

type NormalisedChunk = {
  message: UnifiedMessage | null
  toolInvocations?: any[]
  annotations?: any[]
  isComplete?: boolean
}

type StreamMessageType = Exclude<UnifiedMessage['type'], 'meta' | undefined>

function isStreamMessageType(value: unknown): value is StreamMessageType {
  return value === 'text' || value === 'tool' || value === 'multimodal'
}

function normaliseMessage(input: Omit<UnifiedMessage, 'id'> & { id?: string }): UnifiedMessage {
  const id = input.id && input.id.length > 0 ? input.id : crypto.randomUUID()

  return {
    id,
    role: input.role,
    content: input.content ?? '',
    timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
    type: input.type ?? 'text',
    metadata: { ...(input.metadata || {}) },
  }
}

function parseStreamChunk(data: unknown, fallbackId?: string | null): NormalisedChunk {
  if (!data || typeof data !== 'object') {
    return { message: null }
  }

  const payload = data as Record<string, any>
  const metadata = typeof payload.metadata === 'object' && payload.metadata
    ? { ...payload.metadata }
    : {}

  if (typeof payload.isComplete === 'boolean' && !metadata.isComplete) {
    metadata.isComplete = payload.isComplete
  }

  const id = typeof payload.id === 'string' && payload.id.length > 0
    ? payload.id
    : fallbackId || crypto.randomUUID()

  const rawType = typeof payload.type === 'string' ? payload.type : undefined

  if (rawType === 'meta') {
    return {
      message: null,
      toolInvocations: Array.isArray(metadata.toolInvocations) ? metadata.toolInvocations : undefined,
      annotations: Array.isArray(metadata.annotations) ? metadata.annotations : undefined,
      isComplete: Boolean(metadata.isComplete),
    }
  }

  const role: UnifiedMessage['role'] = payload.role === 'user' ? 'user' : 'assistant'
  const resolvedType: StreamMessageType = isStreamMessageType(rawType) ? rawType : 'text'

  const message: UnifiedMessage = {
    id,
    role,
    content: typeof payload.content === 'string' ? payload.content : '',
    timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    type: resolvedType,
    metadata,
  }

  return {
    message,
    toolInvocations: Array.isArray(metadata.toolInvocations) ? metadata.toolInvocations : undefined,
    annotations: Array.isArray(metadata.annotations) ? metadata.annotations : undefined,
    isComplete: Boolean(metadata.isComplete),
  }
}

export function useNativeAISDK(options: NativeAISDKOptions): NativeAISDKReturn {
  const {
    sessionId = 'native-ai-sdk',
    mode = 'standard',
    context: initialContext,
    initialMessages = [],
    onMessage,
    onComplete,
    onError,
    apiEndpoint = '/api/chat/unified',
  } = options

  const [messages, setMessages] = useState<UnifiedMessage[]>(() => initialMessages.map(message => normaliseMessage(message)))
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [chatContextState, setChatContextState] = useState<UnifiedContext>(initialContext || {})
  const [toolInvocations, setToolInvocations] = useState<any[]>([])
  const [annotations, setAnnotations] = useState<any[]>([])

  const messagesRef = useRef<UnifiedMessage[]>(messages)
  const contextRef = useRef<UnifiedContext>(chatContextState)
  const abortControllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef<string | null>(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    contextRef.current = chatContextState
  }, [chatContextState])

  useEffect(() => {
    if (initialContext) {
      setChatContextState(prev => ({ ...prev, ...initialContext }))
    }
    // We intentionally run this effect only once on mount so that subsequent
    // context updates flow through the returned updateContext helper instead of
    // rehydrating from the initial options.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const commitMessages = useCallback((next: UnifiedMessage[] | ((prev: UnifiedMessage[]) => UnifiedMessage[])) => {
    setMessages(prev => {
      const computed = typeof next === 'function' ? next(prev) : next
      messagesRef.current = computed
      return computed
    })
  }, [])

  const addMessage = useCallback((message: Omit<UnifiedMessage, 'id'> & { id?: string }): UnifiedMessage => {
    const normalised = normaliseMessage(message)
    commitMessages(prev => [...prev, normalised])
    return normalised
  }, [commitMessages])

  const append = useCallback(async (message: UnifiedMessage) => {
    const normalised = normaliseMessage(message)
    commitMessages(prev => [...prev, normalised])
  }, [commitMessages])

  const setMessagesState = useCallback((nextMessages: UnifiedMessage[]) => {
    commitMessages(nextMessages.map(message => normaliseMessage(message)))
  }, [commitMessages])

  const clearMessages = useCallback(() => {
    commitMessages([])
    setToolInvocations([])
    setAnnotations([])
  }, [commitMessages])

  const updateContext = useCallback((context: Partial<UnifiedContext>) => {
    setChatContextState(prev => ({ ...prev, ...context }))
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const stop = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    setIsStreaming(false)
    setIsLoading(false)
  }, [])

  const runStream = useCallback(async (
    requestMessages: UnifiedMessage[],
    { assistantId, requestId }: StreamRunOptions = {},
  ) => {
    const id = requestId || crypto.randomUUID()
    requestIdRef.current = id

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      setIsLoading(true)
      setIsStreaming(false)
      setError(null)

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
          'x-chat-mode': mode,
          'x-request-id': id,
        },
        body: JSON.stringify({
          messages: requestMessages,
          context: contextRef.current,
          mode,
          stream: true,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      setIsLoading(false)
      setIsStreaming(true)

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let buffer = ''
      let activeAssistantId: string | null = assistantId ?? null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        let boundary = buffer.indexOf('\n\n')
        while (boundary !== -1) {
          const rawEvent = buffer.slice(0, boundary)
          buffer = buffer.slice(boundary + 2)

          const dataLine = rawEvent.split('\n').find(line => line.startsWith('data:'))
          if (dataLine) {
            const payloadText = dataLine.replace(/^data:\s*/, '')
            if (payloadText && payloadText !== '[DONE]') {
              try {
                const parsed = JSON.parse(payloadText)
                const { message, toolInvocations: tools, annotations: anns, isComplete } = parseStreamChunk(parsed, activeAssistantId)

                if (message) {
                  activeAssistantId = message.id

                  commitMessages(prev => {
                    const index = prev.findIndex(item => item.id === message.id)
                    if (index === -1) {
                      return [...prev, message]
                    }

                    const next = [...prev]
                    const existing = next[index]
                    if (!existing) {
                      return next
                    }

                    next[index] = {
                      ...existing,
                      content: message.content,
                      metadata: { ...existing.metadata, ...message.metadata },
                    }
                    return next
                  })

                  onMessage?.(message)
                }

                if (Array.isArray(tools)) {
                  setToolInvocations(tools)
                }

                if (Array.isArray(anns)) {
                  setAnnotations(anns)
                }

                if (isComplete) {
                  setIsStreaming(false)
                  onComplete?.()
                }
              } catch (streamError) {
                console.warn('[NATIVE_AI_SDK] Failed to parse stream chunk', streamError)
              }
            }
          }

          boundary = buffer.indexOf('\n\n')
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }

      const normalisedError = err instanceof Error ? err : new Error(String(err))
      setIsLoading(false)
      setIsStreaming(false)
      setError(normalisedError)
      onError?.(normalisedError)
    } finally {
      abortControllerRef.current = null
    }
  }, [
    apiEndpoint,
    commitMessages,
    mode,
    onComplete,
    onError,
    onMessage,
    sessionId,
  ])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const trimmed = content.trim()
    const userMessage = normaliseMessage({
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
      type: 'text',
      metadata: { mode },
    })

    commitMessages(prev => [...prev, userMessage])
    await runStream([...messagesRef.current], { requestId: crypto.randomUUID() })
  }, [commitMessages, isLoading, mode, runStream])

  const reload = useCallback(async () => {
    const current = messagesRef.current
    const lastUserIndex = [...current].map(message => message.role).lastIndexOf('user')
    if (lastUserIndex === -1) return

    const truncated = current.slice(0, lastUserIndex + 1)
    commitMessages(truncated)

    const lastAssistant = [...current].reverse().find(message => message.role === 'assistant')
    const runOptions: StreamRunOptions = {}
    if (lastAssistant?.id) {
      runOptions.assistantId = lastAssistant.id
    }
    if (requestIdRef.current) {
      runOptions.requestId = requestIdRef.current
    }

    await runStream(truncated, runOptions)
  }, [commitMessages, runStream])

  const resumeStream = useCallback(async () => {
    await reload()
  }, [reload])

  const addToolResult = useCallback(async (
    toolCallId: string,
    result: unknown,
    metadata: Record<string, unknown> = {},
  ) => {
    setToolInvocations(prev => {
      const next = Array.isArray(prev) ? [...prev] : []
      const index = next.findIndex((invocation: any) => invocation?.toolCallId === toolCallId)
      const payload = {
        toolCallId,
        result,
        state: 'output-available',
        ...metadata,
      }

      if (index === -1) {
        next.push(payload)
      } else {
        next[index] = { ...next[index], ...payload }
      }

      return next
    })
  }, [])

  useEffect(() => {
    syncUnifiedChatStoreState({
      id: sessionId,
      messages,
      status: error ? 'error' : isStreaming ? 'streaming' : isLoading ? 'submitted' : 'ready',
      error: error ?? null,
      context: chatContextState,
      sendMessage,
      regenerate: reload,
      stop,
      resumeStream,
      addToolResult,
      setMessages: setMessagesState,
      clearError,
    }, UNIFIED_CHAT_STORE_ID)
  }, [
    addToolResult,
    chatContextState,
    clearError,
    error,
    isLoading,
    isStreaming,
    messages,
    reload,
    resumeStream,
    sendMessage,
    sessionId,
    setMessagesState,
    stop,
  ])

  useEffect(() => () => {
    resetUnifiedChatStore(UNIFIED_CHAT_STORE_ID)
  }, [])

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    context: chatContextState,
    sendMessage,
    addMessage,
    clearMessages,
    updateContext,
    stop,
    regenerate: reload,
    resumeStream,
    addToolResult,
    setMessages: setMessagesState,
    clearError,
    append,
    reload,
    toolInvocations,
    annotations,
  }
}
