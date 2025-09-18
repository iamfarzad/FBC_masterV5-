/**
 * AI SDK Tools Migration - Global Chat Store
 * Drop-in replacement for useUnifiedChat with global state management
 */

import React from 'react'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import { enableMapSet } from 'immer'

// Enable MapSet plugin for Immer
enableMapSet()

import {
  UnifiedMessage,
  UnifiedChatOptions,
  UnifiedChatReturn,
  UnifiedContext,
  UnifiedChatRequest
} from '@/src/core/chat/unified-types'

// Store State Interface
interface ChatStore {
  // State
  sessions: Map<string, {
    messages: UnifiedMessage[]
    isLoading: boolean
    isStreaming: boolean
    error: Error | null
    context?: UnifiedContext
    mode: 'standard' | 'realtime' | 'admin' | 'multimodal' | 'automation'
    abortController?: AbortController
  }>
  
  // Actions
  initializeSession: (sessionId: string, options: UnifiedChatOptions) => void
  sendMessage: (sessionId: string, content: string) => Promise<void>
  addMessage: (sessionId: string, message: Omit<UnifiedMessage, 'id'>) => UnifiedMessage
  updateMessage: (sessionId: string, id: string, updates: Partial<UnifiedMessage>) => void
  clearMessages: (sessionId: string) => void
  updateContext: (sessionId: string, context: Partial<UnifiedContext>) => void
  setLoading: (sessionId: string, loading: boolean) => void
  setStreaming: (sessionId: string, streaming: boolean) => void
  setError: (sessionId: string, error: Error | null) => void
  stop: (sessionId: string) => Promise<void>
  regenerate: (sessionId: string) => Promise<void>
  resumeStream: (sessionId: string) => Promise<void>
  addToolResult: (sessionId: string, ...args: any[]) => Promise<void>
  setMessages: (sessionId: string, messages: UnifiedMessage[]) => void
  clearError: (sessionId: string) => void
}

// Create the store with middleware
export const useChatStore = create<ChatStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        sessions: new Map(),

        initializeSession: (sessionId: string, options: UnifiedChatOptions) => {
          set((state) => {
            if (!state.sessions.has(sessionId)) {
              state.sessions.set(sessionId, {
                messages: options.initialMessages || [],
                isLoading: false,
                isStreaming: false,
                error: null,
                context: options.context,
                mode: options.mode || 'standard',
                abortController: undefined,
              })
            }
          })
        },

        sendMessage: async (sessionId: string, content: string) => {
          const session = get().sessions.get(sessionId)
          if (!session || session.isLoading || session.isStreaming) return

          // Add user message
          const userMessage = get().addMessage(sessionId, {
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
            type: 'text'
          })

          // Set loading state
          get().setLoading(sessionId, true)
          get().setError(sessionId, null)

          try {
            // Prepare request
            const request: UnifiedChatRequest = {
              messages: [...session.messages, userMessage],
              context: session.context || {},
              mode: session.mode,
              stream: true
            }

            // Create abort controller
            const controller = new AbortController()
            set((state) => {
              const session = state.sessions.get(sessionId)
              if (session) {
                session.abortController = controller
              }
            })

            // Call unified API
            const response = await fetch('/api/chat/unified', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-request-id': crypto.randomUUID(),
                'x-session-id': sessionId
              },
              body: JSON.stringify(request),
              signal: controller.signal
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
              throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            get().setLoading(sessionId, false)
            get().setStreaming(sessionId, true)

            // Parse SSE stream
            const reader = response.body?.getReader()
            if (!reader) throw new Error('No response body')

            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    
                    if (data.type === 'text') {
                      // Update or create assistant message
                      const existingMessage = session.messages.find(m => m.role === 'assistant' && !m.metadata?.isComplete)
                      
                      if (existingMessage) {
                        get().updateMessage(sessionId, existingMessage.id, {
                          content: data.content,
                          metadata: { ...existingMessage.metadata, isComplete: data.done }
                        })
                      } else {
                        get().addMessage(sessionId, {
                          role: 'assistant',
                          content: data.content,
                          timestamp: new Date(),
                          type: 'text',
                          metadata: { isComplete: data.done }
                        })
                      }
                    }
                  } catch (e) {
                    console.warn('Failed to parse SSE data:', e)
                  }
                }
              }
            }

            get().setStreaming(sessionId, false)
          } catch (error) {
            get().setError(sessionId, error instanceof Error ? error : new Error('Unknown error'))
            get().setLoading(sessionId, false)
            get().setStreaming(sessionId, false)
          }
        },

        addMessage: (sessionId: string, message: Omit<UnifiedMessage, 'id'>) => {
          const newMessage: UnifiedMessage = {
            ...message,
            id: crypto.randomUUID(),
            timestamp: message.timestamp || new Date(),
            type: message.type || 'text',
            metadata: message.metadata || {}
          }

          set((state) => {
            const session = state.sessions.get(sessionId)
            if (session) {
              session.messages.push(newMessage)
            }
          })

          return newMessage
        },

        updateMessage: (sessionId: string, id: string, updates: Partial<UnifiedMessage>) => {
          set((state) => {
            const session = state.sessions.get(sessionId)
            if (session) {
              const message = session.messages.find(m => m.id === id)
              if (message) {
                Object.assign(message, updates)
              }
            }
          })
        },

        clearMessages: (sessionId: string) => {
          set((state) => {
            const session = state.sessions.get(sessionId)
            if (session) {
              session.messages = []
            }
          })
        },

        updateContext: (sessionId: string, context: Partial<UnifiedContext>) => {
          set((state) => {
            const session = state.sessions.get(sessionId)
            if (session) {
              session.context = { ...session.context, ...context }
            }
          })
        },

        setLoading: (sessionId: string, loading: boolean) => {
          set((state) => {
            const session = state.sessions.get(sessionId)
            if (session) {
              session.isLoading = loading
            }
          })
        },

        setStreaming: (sessionId: string, streaming: boolean) => {
          set((state) => {
            const session = state.sessions.get(sessionId)
            if (session) {
              session.isStreaming = streaming
            }
          })
        },

        setError: (sessionId: string, error: Error | null) => {
          set((state) => {
            const session = state.sessions.get(sessionId)
            if (session) {
              session.error = error
            }
          })
        },

        stop: async (sessionId: string) => {
          const session = get().sessions.get(sessionId)
          if (session?.abortController) {
            session.abortController.abort()
          }
          get().setLoading(sessionId, false)
          get().setStreaming(sessionId, false)
        },

        regenerate: async (sessionId: string) => {
          console.warn('Regenerate not implemented for AI SDK Tools store yet.')
        },

        resumeStream: async (sessionId: string) => {
          console.warn('resumeStream not implemented for AI SDK Tools store yet.')
        },

        addToolResult: async (sessionId: string, ...args: any[]) => {
          console.warn('addToolResult not implemented for AI SDK Tools store yet.')
        },

        setMessages: (sessionId: string, messages: UnifiedMessage[]) => {
          set((state) => {
            const session = state.sessions.get(sessionId)
            if (session) {
              session.messages = messages
            }
          })
        },

        clearError: (sessionId: string) => {
          get().setError(sessionId, null)
        },
      })),
      {
        name: 'ai-sdk-tools-chat-store',
      }
    )
  )
)

// Hook to use the store
export function useUnifiedChatStore(options: UnifiedChatOptions): UnifiedChatReturn {
  const sessionId = options.sessionId || 'default'
  
  // Memoize options to prevent infinite re-renders
  const stableOptions = React.useMemo(() => options, [
    options.mode,
    options.apiEndpoint,
    options.headers,
    options.sessionId,
    options.initialMessages,
    options.initialContext
  ])
  
  // Initialize session if it doesn't exist
  React.useEffect(() => {
    useChatStore.getState().initializeSession(sessionId, stableOptions)
  }, [sessionId, stableOptions])

  const session = useChatStore((state) => state.sessions.get(sessionId))
  
  if (!session) {
    return {
      messages: [],
      isLoading: false,
      isStreaming: false,
      error: null,
      sendMessage: async () => {},
      addMessage: () => ({ id: '', role: 'user', content: '', timestamp: new Date(), type: 'text', metadata: {} }),
      updateMessage: () => {},
      clearMessages: () => {},
      updateContext: () => {},
      stop: async () => {},
      regenerate: async () => {},
      resumeStream: async () => {},
      addToolResult: async () => {},
      setMessages: () => {},
      clearError: () => {},
    }
  }

  return {
    messages: session.messages,
    isLoading: session.isLoading,
    isStreaming: session.isStreaming,
    error: session.error,
    sendMessage: (content: string) => useChatStore.getState().sendMessage(sessionId, content),
    addMessage: (message: Omit<UnifiedMessage, 'id'>) => useChatStore.getState().addMessage(sessionId, message),
    updateMessage: (id: string, updates: Partial<UnifiedMessage>) => useChatStore.getState().updateMessage(sessionId, id, updates),
    clearMessages: () => useChatStore.getState().clearMessages(sessionId),
    updateContext: (context: Partial<UnifiedContext>) => useChatStore.getState().updateContext(sessionId, context),
    stop: () => useChatStore.getState().stop(sessionId),
    regenerate: () => useChatStore.getState().regenerate(sessionId),
    resumeStream: () => useChatStore.getState().resumeStream(sessionId),
    addToolResult: (...args: any[]) => useChatStore.getState().addToolResult(sessionId, ...args),
    setMessages: (messages: UnifiedMessage[]) => useChatStore.getState().setMessages(sessionId, messages),
    clearError: () => useChatStore.getState().clearError(sessionId),
  }
}
