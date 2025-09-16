/**
 * AI SDK Tools Migration - Global Chat Store
 * Drop-in replacement for useUnifiedChat with global state management
 */

import React from 'react'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import {
  UnifiedMessage,
  UnifiedChatOptions,
  UnifiedChatReturn,
  ChatMode,
  UnifiedContext,
  UnifiedChatRequest
} from '@/src/core/chat/unified-types'
import { unifiedStreamingService } from '@/src/core/streaming/unified-stream'
import { unifiedErrorHandler } from '@/src/core/chat/unified-error-handler'

// Store State Interface
interface ChatStore {
  // State
  sessions: Map<string, {
    messages: UnifiedMessage[]
    isLoading: boolean
    isStreaming: boolean
    error: Error | null
    context?: UnifiedContext
    mode: ChatMode
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
}

// Create the store with middleware
const useChatStore = create<ChatStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        sessions: new Map(),

        initializeSession: (sessionId: string, options: UnifiedChatOptions) => {
          set((state) => {
            const sessionData: {
              messages: UnifiedMessage[]
              isLoading: boolean
              isStreaming: boolean
              error: Error | null
              context?: UnifiedContext
              mode: ChatMode
              abortController?: AbortController
            } = {
              messages: options.initialMessages || [],
              isLoading: false,
              isStreaming: false,
              error: null,
              mode: options.mode || 'standard'
            }
            
            if (options.context) {
              sessionData.context = options.context
            }
            
            state.sessions.set(sessionId, sessionData)
          })
        },

        sendMessage: async (sessionId: string, content: string) => {
          const session = get().sessions.get(sessionId)
          if (!session || !content.trim() || session.isLoading || session.isStreaming) {
            return
          }

          const reqId = crypto.randomUUID()
          console.log(`[CHAT_STORE][${reqId}] sending message for session ${sessionId}`)

          let timeoutId: NodeJS.Timeout | undefined

          try {
            // Set loading state
            get().setLoading(sessionId, true)
            get().setError(sessionId, null)

            // Abort any existing request
            if (session.abortController) {
              session.abortController.abort()
            }

            const controller = new AbortController()
            set((state) => {
              const currentSession = state.sessions.get(sessionId)
              if (currentSession) {
                currentSession.abortController = controller
              }
            })

            // Timeout guard (30s)
            timeoutId = setTimeout(() => {
              controller.abort()
              console.log(`[CHAT_STORE][${reqId}] timeout after 30s`)
              get().setError(sessionId, new Error('Request timeout after 30 seconds'))
              get().setLoading(sessionId, false)
              get().setStreaming(sessionId, false)
            }, 30000)

            // Add user message
            const userMessage = get().addMessage(sessionId, {
              role: 'user',
              content: content.trim(),
              timestamp: new Date(),
              type: 'text',
              metadata: {
                sessionData: {
                  sessionId,
                  leadContext: session.context?.leadContext,
                  timestamp: new Date().toISOString()
                }
              }
            })

            // Prepare unified request
            const updatedSession = get().sessions.get(sessionId)!
            const request: UnifiedChatRequest = {
              messages: updatedSession.messages,
              context: updatedSession.context || {} as UnifiedContext,
              mode: updatedSession.mode,
              stream: true
            }

            // Make request to unified API
            const response = await fetch('/api/chat/unified', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-request-id': reqId,
                'x-unified-chat': 'true',
                'x-session-id': sessionId,
                'x-chat-mode': request.mode as string
              },
              body: JSON.stringify(request),
              signal: controller.signal,
              cache: 'no-store',
              next: { revalidate: 0 }
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
              throw new Error(errorData.error || `HTTP ${response.status}`)
            }

            if (!response.body) {
              throw new Error('No response body')
            }

            console.log(`[CHAT_STORE][${reqId}] received response`)
            get().setLoading(sessionId, false)
            get().setStreaming(sessionId, true)

            // Parse streaming response
            let assistantMessage: UnifiedMessage | null = null
            let chunkCount = 0

            for await (const message of unifiedStreamingService.parseSSEStream(response)) {
              chunkCount++

              // Skip meta events
              if (message.type === 'meta') continue

              if (message.role === 'assistant') {
                if (!assistantMessage) {
                  // Create new assistant message
                  assistantMessage = get().addMessage(sessionId, {
                    role: 'assistant',
                    content: message.content,
                    timestamp: new Date(),
                    type: message.type || 'text',
                    metadata: message.metadata || {}
                  })
                } else {
                  // Update existing assistant message
                  get().updateMessage(sessionId, assistantMessage.id, {
                    content: message.content,
                    metadata: message.metadata || {}
                  })
                }

                // Check if this is the final message
                if (message.metadata?.isComplete) {
                  get().setStreaming(sessionId, false)
                  break
                }
              }
            }

          } catch (err) {
            get().setLoading(sessionId, false)
            get().setStreaming(sessionId, false)

            const errorArgs = {
              ...(sessionId ? { sessionId } : {}),
              ...(session.mode ? { mode: session.mode } : {}),
              ...(session.context?.adminId ? { userId: session.context.adminId } : {}),
            }

            const chatError = unifiedErrorHandler.handleError(err, errorArgs, 'chat_store')
            const normalizedError = err instanceof Error ? err : new Error(String(err))
            get().setError(sessionId, normalizedError)

            if (normalizedError.name !== 'AbortError') {
              // Add standardized error message to chat
              get().addMessage(sessionId, {
                role: 'assistant',
                content: chatError.message,
                timestamp: new Date(),
                type: 'text',
                metadata: {
                  error: true,
                  errorCode: chatError.code,
                  recoverable: chatError.recoverable
                }
              })
            }
          } finally {
            // Clean up
            set((state) => {
              const currentSession = state.sessions.get(sessionId)
              if (currentSession && currentSession.abortController) {
                delete currentSession.abortController
              }
            })
            if (timeoutId) clearTimeout(timeoutId)
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
              const messageIndex = session.messages.findIndex((msg: UnifiedMessage) => msg.id === id)
              if (messageIndex !== -1 && session.messages[messageIndex]) {
                const message = session.messages[messageIndex]
                Object.keys(updates).forEach(key => {
                  (message as any)[key] = (updates as any)[key]
                })
              }
            }
          })
        },

        clearMessages: (sessionId: string) => {
          set((state) => {
            const session = state.sessions.get(sessionId)
            if (session) {
              session.messages = []
              session.error = null
            }
          })
        },

        updateContext: (sessionId: string, context: Partial<UnifiedContext>) => {
          set((state) => {
            const session = state.sessions.get(sessionId)
            if (session) {
              session.context = { ...session.context, ...context } as UnifiedContext
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
        }
      }))
    ),
    {
      name: 'chat-store',
      partialize: (state: ChatStore) => ({
        // Only persist session metadata, not the full state
        sessionCount: state.sessions.size
      })
    }
  )
)

// Hook factory for session-specific chat functionality
export function useUnifiedChatStore(options: UnifiedChatOptions): UnifiedChatReturn {
  const sessionId = options.sessionId || 'default'
  
  // Initialize session if it doesn't exist
  const initializeSession = useChatStore(state => state.initializeSession)
  const sendMessage = useChatStore(state => state.sendMessage)
  const addMessage = useChatStore(state => state.addMessage)
  const clearMessages = useChatStore(state => state.clearMessages)
  const updateContext = useChatStore(state => state.updateContext)

  // Session-specific selectors for optimal re-renders
  const messages = useChatStore(state => state.sessions.get(sessionId)?.messages || [])
  const isLoading = useChatStore(state => state.sessions.get(sessionId)?.isLoading || false)
  const isStreaming = useChatStore(state => state.sessions.get(sessionId)?.isStreaming || false)
  const error = useChatStore(state => state.sessions.get(sessionId)?.error || null)

  // Initialize session on first render
  React.useEffect(() => {
    const session = useChatStore.getState().sessions.get(sessionId)
    if (!session) {
      initializeSession(sessionId, options)
    }
  }, [sessionId, initializeSession])

  // Update context when options change
  React.useEffect(() => {
    if (options.context) {
      updateContext(sessionId, options.context)
    }
  }, [sessionId, options.context, updateContext])

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage: React.useCallback((content: string) => sendMessage(sessionId, content), [sessionId, sendMessage]),
    addMessage: React.useCallback((message: Omit<UnifiedMessage, 'id'>) => addMessage(sessionId, message), [sessionId, addMessage]),
    clearMessages: React.useCallback(() => clearMessages(sessionId), [sessionId, clearMessages]),
    updateContext: React.useCallback((context: Partial<UnifiedContext>) => updateContext(sessionId, context), [sessionId, updateContext])
  }
}

// Export store for direct access (for debugging, devtools, etc.)
export { useChatStore }

// Export selectors for advanced usage
export const chatSelectors = {
  getSession: (sessionId: string) => (state: ChatStore) => state.sessions.get(sessionId),
  getMessages: (sessionId: string) => (state: ChatStore) => state.sessions.get(sessionId)?.messages || [],
  getIsLoading: (sessionId: string) => (state: ChatStore) => state.sessions.get(sessionId)?.isLoading || false,
  getIsStreaming: (sessionId: string) => (state: ChatStore) => state.sessions.get(sessionId)?.isStreaming || false,
  getError: (sessionId: string) => (state: ChatStore) => state.sessions.get(sessionId)?.error || null,
  getAllSessions: (state: ChatStore) => Array.from(state.sessions.keys())
}