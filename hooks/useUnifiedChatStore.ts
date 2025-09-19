/**
 * Unified Chat Store Hook
 * Provides global session tracking for all AI SDK chat implementations
 */

import { useEffect, useMemo, useRef } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'

import {
  type UnifiedChatOptions,
  type UnifiedChatReturn,
  type UnifiedContext,
  type UnifiedMessage,
} from '@/src/core/chat/unified-types'
import { type ChatStatus } from '@/src/core/chat/state/unified-chat-store'
import {
  useUnifiedChatWithFlags,
  type UnifiedChatWithFlagsReturn,
} from './useUnifiedChatWithFlags'

// Enable Immer support for Map/Set collections
enableMapSet()

type ChatImplementation = 'legacy' | 'native' | 'simple' | 'unknown'

interface SessionActions {
  sendMessage: UnifiedChatReturn['sendMessage']
  addMessage: UnifiedChatReturn['addMessage']
  clearMessages: UnifiedChatReturn['clearMessages']
  updateContext: UnifiedChatReturn['updateContext']
  stop: UnifiedChatReturn['stop']
  regenerate: UnifiedChatReturn['regenerate']
  resumeStream: UnifiedChatReturn['resumeStream']
  addToolResult: UnifiedChatReturn['addToolResult']
  setMessages: UnifiedChatReturn['setMessages']
  clearError: UnifiedChatReturn['clearError']
}

interface SessionMetadata {
  mode?: UnifiedChatOptions['mode']
  implementation: ChatImplementation
  requestCount: number
  createdAt: number
  updatedAt: number
  lastMessageAt?: number | undefined
  toolInvocationCount?: number | undefined
  annotationCount?: number | undefined
}

interface SessionSnapshot {
  id: string
  messages: UnifiedMessage[]
  context: UnifiedContext
  error: Error | null
  isLoading: boolean
  isStreaming: boolean
  status: ChatStatus
  metadata: SessionMetadata
  migrationStatus?: UnifiedChatWithFlagsReturn['migrationStatus']
  toolInvocations: any[]
  annotations: any[]
  actions: SessionActions
}

interface ChatStoreState {
  sessions: Map<string, SessionSnapshot>
  updateSession: (sessionId: string, snapshot: SessionSnapshot) => void
  removeSession: (sessionId: string) => void
  clearMessages: (sessionId: string) => void
}

export const useChatStore = create<ChatStoreState>()(
  devtools(
    immer((set, get) => ({
      sessions: new Map(),

      updateSession: (sessionId, snapshot) => {
        set(state => {
          const existing = state.sessions.get(sessionId)
          const createdAt = existing?.metadata.createdAt ?? snapshot.metadata.createdAt
          const updatedAt = Date.now()

          if (existing) {
            existing.messages = snapshot.messages
            existing.context = snapshot.context
            existing.error = snapshot.error
            existing.isLoading = snapshot.isLoading
            existing.isStreaming = snapshot.isStreaming
            existing.status = snapshot.status
            existing.metadata = {
              ...existing.metadata,
              ...snapshot.metadata,
              createdAt,
              updatedAt,
            }
            if (typeof snapshot.migrationStatus === 'undefined') {
              delete existing.migrationStatus
            } else {
              existing.migrationStatus = snapshot.migrationStatus
            }
            existing.toolInvocations = snapshot.toolInvocations
            existing.annotations = snapshot.annotations
            existing.actions = snapshot.actions
            return
          }

          state.sessions.set(sessionId, {
            ...snapshot,
            metadata: {
              ...snapshot.metadata,
              createdAt,
              updatedAt,
            },
          })
        })
      },

      removeSession: (sessionId) => {
        const session = get().sessions.get(sessionId)
        if (session?.actions.stop) {
          void session.actions.stop()
        }

        set(state => {
          state.sessions.delete(sessionId)
        })
      },

      clearMessages: (sessionId) => {
        const session = get().sessions.get(sessionId)
        if (!session) return

        session.actions.clearMessages()
        session.actions.clearError()

        set(state => {
          const target = state.sessions.get(sessionId)
          if (!target) return

          target.messages = []
          target.error = null
          target.status = 'ready'
          delete target.metadata.lastMessageAt
          target.metadata.updatedAt = Date.now()
        })
      },
    })),
    { name: 'ai-sdk-chat-store' },
  ),
);

function resolveImplementation(
  chat: UnifiedChatWithFlagsReturn,
  apiEndpoint?: string,
): ChatImplementation {
  if (apiEndpoint?.includes('/simple')) {
    return 'simple'
  }

  if (chat.toolInvocations && chat.toolInvocations.length > 0) {
    return 'native'
  }

  const phase = chat.migrationStatus?.phase
  if (phase === 'native') return 'native'
  if (phase === 'legacy') return 'legacy'

  return 'legacy'
}

function getStatus(chat: UnifiedChatReturn): ChatStatus {
  if (chat.error) return 'error'
  if (chat.isStreaming) return 'streaming'
  if (chat.isLoading) return 'submitted'
  return 'ready'
}

function getLastMessageTimestamp(messages: UnifiedMessage[]): number | undefined {
  if (!messages.length) return undefined
  const last = messages[messages.length - 1]
  if (!last) return undefined

  try {
    return last.timestamp instanceof Date
      ? last.timestamp.getTime()
      : new Date(last.timestamp).getTime()
  } catch {
    return Date.now()
  }
}

export function useUnifiedChatStore(options: UnifiedChatOptions): UnifiedChatReturn {
  const {
    sessionId = 'unified-session',
    ...chatOptions
  } = options

  const chat = useUnifiedChatWithFlags({
    ...chatOptions,
    sessionId,
  })

  const updateSession = useChatStore(state => state.updateSession)
  const removeSession = useChatStore(state => state.removeSession)

  const createdAtRef = useRef(Date.now())
  const requestCountRef = useRef(0)
  const wasLoadingRef = useRef(chat.isLoading)

  useEffect(() => {
    if (chat.isLoading && !wasLoadingRef.current) {
      requestCountRef.current += 1
    }
    wasLoadingRef.current = chat.isLoading
  }, [chat.isLoading])

  const status = getStatus(chat)

  const apiEndpoint = (options as { apiEndpoint?: string }).apiEndpoint
  const implementation = resolveImplementation(chat, apiEndpoint)

  const actions = useMemo<SessionActions>(() => ({
    sendMessage: chat.sendMessage,
    addMessage: chat.addMessage,
    clearMessages: chat.clearMessages,
    updateContext: chat.updateContext,
    stop: chat.stop,
    regenerate: chat.regenerate,
    resumeStream: chat.resumeStream,
    addToolResult: chat.addToolResult,
    setMessages: chat.setMessages,
    clearError: chat.clearError,
  }), [
    chat.addMessage,
    chat.addToolResult,
    chat.clearError,
    chat.clearMessages,
    chat.regenerate,
    chat.resumeStream,
    chat.sendMessage,
    chat.setMessages,
    chat.stop,
    chat.updateContext,
  ])

  useEffect(() => {
    const snapshot: SessionSnapshot = {
      id: sessionId,
      messages: chat.messages,
      context: chat.context,
      error: chat.error,
      isLoading: chat.isLoading,
      isStreaming: chat.isStreaming,
      status,
      metadata: {
        mode: options.mode,
        implementation,
        requestCount: requestCountRef.current,
        createdAt: createdAtRef.current,
        updatedAt: Date.now(),
        lastMessageAt: getLastMessageTimestamp(chat.messages),
        toolInvocationCount: chat.toolInvocations?.length ?? 0,
        annotationCount: chat.annotations?.length ?? 0,
      },
      migrationStatus: chat.migrationStatus,
      toolInvocations: chat.toolInvocations ?? [],
      annotations: chat.annotations ?? [],
      actions,
    }

    updateSession(sessionId, snapshot)
  }, [
    actions,
    chat.annotations,
    chat.context,
    chat.error,
    chat.isLoading,
    chat.isStreaming,
    chat.messages,
    chat.migrationStatus,
    chat.toolInvocations,
    implementation,
    options.mode,
    sessionId,
    status,
    updateSession,
  ])

  useEffect(() => () => {
    removeSession(sessionId)
  }, [removeSession, sessionId])

  return chat
}
