/**
 * Unified Chat Hook
 * Single hook that handles all chat modes and streaming
 * Replaces useChat and useRealtimeChat
 */

import { useState, useCallback, useRef, useEffect } from 'react'
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

export function useUnifiedChat(options: UnifiedChatOptions): UnifiedChatReturn {
  const [messages, setMessages] = useState<UnifiedMessage[]>(options.initialMessages || [])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const sessionRef = useRef(options.sessionId)

  // Initialize session management based on mode
  useEffect(() => {
    if (options.mode === 'admin' && options.context?.adminId) {
      unifiedChatProvider.initializeAdminSession(options.sessionId, options.context.adminId)
    } else if (options.mode === 'realtime') {
      unifiedChatProvider.initializeRealtimeSession(options.sessionId)
    }

    return () => {
      if (options.mode === 'admin') {
        unifiedChatProvider.disconnectAdminSession(options.sessionId)
      } else if (options.mode === 'realtime') {
        unifiedChatProvider.disconnectRealtimeSession(options.sessionId)
      }
    }
  }, [options.sessionId, options.mode, options.context?.adminId])

  // Enhanced real-time session state management
  const realtimeStatus = options.mode === 'realtime'
    ? unifiedChatProvider.getRealtimeSessionStatus(options.sessionId)
    : null

  const realtimeIsConnected = realtimeStatus?.isConnected || false
  const realtimeIsConnecting = realtimeStatus?.isConnecting || false
  const realtimeIsStreaming = realtimeStatus?.isStreaming || false
  const realtimeLastActivity = realtimeStatus?.lastActivity || null
  const realtimeCorrelationId = realtimeStatus?.correlationId

  // Update session reference when options change
  useEffect(() => {
    sessionRef.current = options.sessionId
  }, [options.sessionId])

  const addMessage = useCallback((message: Omit<UnifiedMessage, 'id'>) => {
    const newMessage: UnifiedMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: message.timestamp || new Date(),
      type: message.type || 'text',
      metadata: message.metadata
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])

  const updateMessage = useCallback((id: string, updates: Partial<UnifiedMessage>) => {
    setMessages(prev =>
      prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg)
    )
  }, [])

  const sendMessage = useCallback(async (content: string, overrideContext?: any): Promise<void> => {
    if (!content.trim() || isLoading || isStreaming) return

    try {
      setIsLoading(true)
      setError(null)

      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      // Add user message with session data for AI context
      const userMessage = addMessage({
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        type: 'text',
        metadata: {
          sessionData: overrideContext || options.context // Include current context in metadata
        }
      })

      // Prepare unified request with updated context
      const request: UnifiedChatRequest = {
        messages: [...messages, userMessage],
        context: overrideContext || options.context,
        mode: options.mode || 'standard',
        stream: true
      }

      // Make request to unified API
      const response = await fetch('/api/chat/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-unified-chat': 'true',
          'x-session-id': sessionRef.current || 'anonymous',
          'x-chat-mode': request.mode
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
              metadata: message.metadata
            })
          } else {
            // Update existing assistant message
            updateMessage(assistantMessage.id, {
              content: message.content,
              metadata: message.metadata
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

      // Update real-time session state on error
      if (options.mode === 'realtime') {
        unifiedChatProvider.setRealtimeConnecting(options.sessionId, false)
        unifiedChatProvider.setRealtimeStreaming(options.sessionId, false)
      }

      const chatError = unifiedErrorHandler.handleError(err, {
        sessionId: options.sessionId,
        mode: options.mode,
        userId: options.context?.adminId
      }, 'unified_chat_hook')

      setError(chatError)

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

        options.onError?.(chatError)
      }
    } finally {
      abortControllerRef.current = null
    }
  }, [messages, isLoading, isStreaming, options, addMessage, updateMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
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

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
    updateContext,
    addMessage,
    // Real-time compatibility fields
    isConnected: realtimeIsConnected,
    isConnecting: realtimeIsConnecting,
    isStreaming: realtimeIsStreaming,
    lastActivity: realtimeLastActivity,
    correlationId: realtimeCorrelationId
  }
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
