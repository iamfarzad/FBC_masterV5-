// Ultra-Fast Real-Time Chat Hook for AI Consulting Demos
import { useState, useCallback, useRef } from 'react'

interface RealtimeMessage {
  id: string
  type: 'text' | 'done' | 'error'
  data: string | null
}

interface RealtimeChatOptions {
  sessionId?: string
  context?: Record<string, any>
  onMessage?: (message: RealtimeMessage) => void
  onComplete?: () => void
  onError?: (error: string) => void
}

export function useRealtimeChat(options: RealtimeChatOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsLoading(true)
    setCurrentResponse('')
    setError(null)

    try {
      const response = await fetch('/api/realtime-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message.trim(),
          sessionId: options.sessionId || `demo-${Date.now()}`,
          context: options.context || {}
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response stream available')
      }

      const decoder = new TextDecoder()
      let accumulatedResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: RealtimeMessage = JSON.parse(line.slice(6))

              if (data.type === 'text' && data.data) {
                accumulatedResponse += data.data
                setCurrentResponse(accumulatedResponse)
                options.onMessage?.(data)
              } else if (data.type === 'done') {
                options.onComplete?.()
                break
              } else if (data.type === 'error') {
                throw new Error(data.data || 'Streaming error')
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError)
            }
          }
        }
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, this is expected
        return
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      options.onError?.(errorMessage)
      console.error('Real-time chat error:', err)
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [options])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
    setCurrentResponse('')
    setError(null)
  }, [])

  const clear = useCallback(() => {
    setCurrentResponse('')
    setError(null)
  }, [])

  return {
    sendMessage,
    cancel,
    clear,
    isLoading,
    currentResponse,
    error,
    isActive: isLoading || !!currentResponse
  }
}

// Demo-optimized version for client presentations
export function useDemoChat() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>>([])

  const realtimeChat = useRealtimeChat({
    sessionId: 'demo-session',
    context: {
      mode: 'demo',
      userType: 'potential_client',
      demoFocus: 'ai_capabilities'
    },
    onMessage: (message) => {
      if (message.type === 'text' && message.data) {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            // Update existing assistant message
            return prev.map((msg, index) =>
              index === prev.length - 1
                ? { ...msg, content: lastMessage.content + message.data }
                : msg
            )
          } else {
            // Add new assistant message
            return [...prev, {
              role: 'assistant',
              content: message.data,
              timestamp: new Date()
            }]
          }
        })
      }
    },
    onComplete: () => {
      console.log('Demo chat completed successfully')
    },
    onError: (error) => {
      console.error('Demo chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error}. This demonstrates error handling in AI systems.`,
        timestamp: new Date()
      }])
    }
  })

  const sendDemoMessage = useCallback((message: string) => {
    // Add user message to history
    setMessages(prev => [...prev, {
      role: 'user',
      content: message,
      timestamp: new Date()
    }])

    // Send to AI
    realtimeChat.sendMessage(message)
  }, [realtimeChat])

  return {
    ...realtimeChat,
    messages,
    sendDemoMessage
  }
}
