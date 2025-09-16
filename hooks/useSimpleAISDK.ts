/**
 * Simple AI SDK Hook
 * Demonstrates AI SDK integration without complex features
 */

import { useState, useCallback } from 'react'

interface SimpleMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface SimpleAISDKOptions {
  sessionId?: string
  mode?: 'standard' | 'admin'
}

export function useSimpleAISDK(options: SimpleAISDKOptions = {}) {
  const [messages, setMessages] = useState<SimpleMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: SimpleMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId: options.sessionId || 'simple-session',
          mode: options.mode || 'standard'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      const assistantMessage: SimpleMessage = {
        id: result.id,
        role: 'assistant',
        content: result.content,
        timestamp: new Date(result.timestamp)
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      
      // Add error message to chat
      const errorMessage: SimpleMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, options.sessionId, options.mode])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const addMessage = useCallback((message: Omit<SimpleMessage, 'id'>) => {
    const newMessage: SimpleMessage = {
      ...message,
      id: crypto.randomUUID()
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])

  return {
    messages,
    isLoading,
    isStreaming: isLoading, // Simple implementation
    error,
    sendMessage,
    clearMessages,
    addMessage,
    // Compatibility methods
    updateContext: () => console.log('updateContext not implemented in simple SDK')
  }
}