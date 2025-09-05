import { useState, useCallback, useRef, useEffect } from 'react'
import { useUnifiedChat } from './useUnifiedChat'
import type { UnifiedMessage, UnifiedChatOptions } from '../src/core/chat/unified-types'

// Re-export for compatibility
export interface AdminMessage extends UnifiedMessage {}

export interface UseAdminChatProps extends Omit<UnifiedChatOptions, 'mode'> {
  initialMessages?: AdminMessage[]
  onFinish?: (message: AdminMessage) => void
  onError?: (error: Error) => void
  adminId?: string
  conversationIds?: string[]
}

export interface UseAdminChatReturn {
  messages: AdminMessage[]
  input: string
  setInput: (input: string) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  isLoading: boolean
  error: Error | null
  append: (message: Omit<AdminMessage, 'id' | 'timestamp'>) => AdminMessage
  clearMessages: () => void
  deleteMessage: (id: string) => void
  stop: () => void
  sendMessage: (content: string) => Promise<void>
}

export function useAdminChat({
  initialMessages = [],
  onFinish,
  onError,
  adminId,
  conversationIds,
  sessionId = 'admin-session',
  ...unifiedOptions
}: UseAdminChatProps = {}): UseAdminChatReturn {
  const [input, setInput] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastCallTimeRef = useRef<number>(0)
  const DEBOUNCE_DELAY = 1000 // 1 second debounce

  // Use the unified chat system with admin mode
  const unifiedChat = useUnifiedChat({
    ...unifiedOptions,
    sessionId,
    mode: 'admin',
    initialMessages: initialMessages as UnifiedMessage[],
    context: {
      adminId: adminId ?? '',
      conversationIds: conversationIds ?? [],
      sessionId
    }
  })

  const addMessage = useCallback((message: Omit<AdminMessage, 'id' | 'timestamp'>) => {
    const newMessage: AdminMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: message.type || 'text',
      metadata: message.metadata || {}
    }

    // The unified hook returns addMessage/updateMessage APIs, not append()
    unifiedChat.addMessage({
      role: newMessage.role,
      content: newMessage.content,
      timestamp: newMessage.timestamp,
      type: 'text',
      metadata: newMessage.metadata ?? {}
    })
    return newMessage
  }, [unifiedChat])

  const updateMessage = useCallback((id: string, updates: Partial<AdminMessage>) => {
    unifiedChat.messages.forEach((msg, index) => {
      if (msg.id === id) {
        // Note: This is a simplified update - in real implementation you'd want to update the unified chat state
        console.log('Updating message:', id, updates)
      }
    })
  }, [unifiedChat.messages])

  const append = useCallback((message: Omit<AdminMessage, 'id' | 'timestamp'>) => {
    return addMessage(message)
  }, [addMessage])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // 🚫 RATE LIMITING: Prevent rapid successive calls
    const now = Date.now()
    if (now - lastCallTimeRef.current < DEBOUNCE_DELAY) {
      console.log('🚫 Rate limited: Skipping rapid admin chat call', {
        timeSinceLastCall: now - lastCallTimeRef.current,
        content: content.substring(0, 50)
      })
      return
    }
    lastCallTimeRef.current = now

    // Add user message
    const userMessage = addMessage({
      role: 'user',
      content: content.trim(),
    })

    setInput('')

    try {
      // Use the unified chat system to send the message
      await unifiedChat.sendMessage(content.trim())

      // Call onFinish if provided
      if (onFinish && unifiedChat.messages.length > 0) {
        const lastMessage = unifiedChat.messages[unifiedChat.messages.length - 1]
        onFinish(lastMessage as AdminMessage)
      }

      console.log('✅ Admin chat message completed:', {
        responseLength: unifiedChat.messages.length,
        timestamp: new Date().toISOString()
      })

    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error('Failed to send admin chat message')
      console.error('❌ Admin chat message error:', {
        error: errorObj.message,
        timestamp: new Date().toISOString()
      })

      if (onError) {
        onError(errorObj)
      }
    }
  }, [addMessage, unifiedChat, onFinish, onError])

  // Return unified chat state and methods
  return {
    messages: unifiedChat.messages as AdminMessage[],
    input,
    setInput,
    handleInputChange: useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value)
    }, []),
    handleSubmit: useCallback(async (e: React.FormEvent) => {
      e.preventDefault()
      await sendMessage(input)
    }, [input, sendMessage]),
    isLoading: unifiedChat.isLoading,
    error: unifiedChat.error,
    append,
    clearMessages: unifiedChat.clearMessages,
    deleteMessage: useCallback((id: string) => {
      // Simplified delete - in real implementation you'd want to update the unified chat state
      console.log('Deleting message:', id)
    }, []),
    stop: useCallback(() => {
      // Stop any ongoing unified chat operations
      console.log('Stopping admin chat')
    }, []),
    sendMessage
  }
}
