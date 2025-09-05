/**
 * Unified Chat Hook
 * Single hook that handles all chat modes and streaming
 * Replaces useChat and useRealtimeChat
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
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
import { asString } from '@/src/core/utils/safe'

// helper
function toError(e: unknown): Error {
  if (e instanceof Error) return e;
  if (typeof e === 'string') return new Error(e);
  try { return new Error(JSON.stringify(e)); } catch { return new Error('Unknown error'); }
}

export function useUnifiedChat(options: UnifiedChatOptions): UnifiedChatReturn {
  // Build options object without undefined properties
  const opts = {
    sessionId: options.sessionId,
    mode: options.mode,
    userId: options.context?.adminId
  };

  // Filter out undefined values
  const cleanOpts: { sessionId?: string; mode?: string; userId?: string } = {};
  if (opts.sessionId) cleanOpts.sessionId = opts.sessionId;
  if (opts.mode) cleanOpts.mode = opts.mode;
  if (opts.userId) cleanOpts.userId = opts.userId;
  const [messages, setMessages] = useState<UnifiedMessage[]>(options.initialMessages || [])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [lastError, setLastError] = useState<Error | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const sessionRef = useRef(options.sessionId)

  // Initialize session management based on mode
  useEffect(() => {
    // Session management logic would go here
  }, [options.sessionId, options.mode, options.context?.adminId])

  // Update session reference when options change
  useEffect(() => {
    sessionRef.current = options.sessionId
  }, [options.sessionId])

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

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || isLoading || isStreaming) return

    try {
      setIsLoading(true)
      setLastError(null)

      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      // Add user message with session data for personality model
      const userMessage = addMessage({
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        type: 'text',
        metadata: {
          sessionData: {
            sessionId: sessionRef.current,
            leadContext: options.context?.leadContext,
            timestamp: new Date().toISOString()
          }
        }
      })

      // Prepare unified request
      const request: UnifiedChatRequest =
        options.context
          ? { messages: [...messages, userMessage], context: options.context, mode: options.mode || 'standard', stream: true }
          : { messages: [...messages, userMessage], context: {} as UnifiedContext, mode: options.mode || 'standard', stream: true }

      // Make request to unified API
      const response = await fetch('/api/chat/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-unified-chat': 'true',
          'x-session-id': sessionRef.current || 'anonymous',
          'x-chat-mode': request.mode as string
        },
        body: JSON.stringify(request),
        signal: controller.signal
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      setIsLoading(false)
      setIsStreaming(true)

      // Parse streaming response
      let assistantMessage: UnifiedMessage | null = null
      for await (const message of unifiedStreamingService.parseSSEStream(response)) {
        if (message.role === 'assistant') {
          if (!assistantMessage) {
            // Create new assistant message
            assistantMessage = addMessage({
              role: 'assistant',
              content: message.content,
              timestamp: new Date(),
              type: message.type || 'text',
              metadata: message.metadata || {}
            })
          } else {
            // Update existing assistant message
            updateMessage(assistantMessage.id, {
              content: message.content,
              metadata: message.metadata || {}
            })
          }

          // Call message callback if provided
          options.onMessage?.(message)

          // Check if this is the final message
          if (message.metadata?.isComplete) {
            setIsStreaming(false)
            options.onComplete?.()
            break
          }
        }
      }

    } catch (err) {
      setIsLoading(false)
      setIsStreaming(false)

      const errorArgs: { sessionId?: string; mode?: string; userId?: string } = {
        ...(options.sessionId ? { sessionId: options.sessionId } : {}),
        ...(options.mode ? { mode: options.mode } : {}),
        ...(options.context?.adminId ? { userId: options.context.adminId } : {}),
      };

      const chatError = unifiedErrorHandler.handleError(err, errorArgs, 'unified_chat_hook')
      const normalizedError = toError(err)
      setLastError(normalizedError)

      // Call onError callback if provided
      options.onError?.(normalizedError)

      if (err instanceof Error && err.name !== 'AbortError') {
        // Add standardized error message to chat
        addMessage({
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
      abortControllerRef.current = null
    }
  }, [messages, isLoading, isStreaming, options, addMessage, updateMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
    setLastError(null)
  }, [])

  const updateContext = useCallback((context: Partial<UnifiedContext>) => {
    // Update context in options (this would typically trigger a re-render)
    // In a real implementation, you might want to use a ref or state for this
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // final return (ensure names match your declared type)
  return {
    sendMessage,           // <- ensure this name exists in the type
    addMessage,
    messages,
    isStreaming,
    isLoading,
    error: lastError,
    clearMessages,
    updateContext,
  };
}

/**
 * Legacy compatibility hooks - DEPRECATED
 * These will be removed in Phase 6 cleanup
 * DO NOT USE in new code - use useUnifiedChat instead
 */

export function useChat(options: Omit<UnifiedChatOptions, 'mode'>) {
  console.warn('⚠️ useChat is DEPRECATED. Use useUnifiedChat instead.')
  return useUnifiedChat({ ...options, mode: 'standard' })
}

export function useRealtimeChat(options: Omit<UnifiedChatOptions, 'mode'>) {
  console.warn('⚠️ useRealtimeChat is DEPRECATED. Use useUnifiedChat instead.')
  return useUnifiedChat({ ...options, mode: 'realtime' })
}