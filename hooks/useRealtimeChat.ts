// Realtime Chat Hook for F.B/c AI
// Provides real-time messaging capabilities with AI integration
// Supports streaming responses and session management

import { useState, useCallback, useRef, useEffect } from 'react'

export interface RealtimeChatMessage {
  type: 'text' | 'error' | 'status'
  data?: string
  timestamp?: Date
  sessionId?: string
  isComplete?: boolean
}

export interface RealtimeChatOptions {
  sessionId: string
  context: {
    mode: string
    userType: string
    intelligenceEnabled: boolean
  }
  onMessage?: (message: RealtimeChatMessage) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

export interface RealtimeChatReturn {
  isConnected: boolean
  isConnecting: boolean
  isStreaming: boolean
  sendMessage: (message: string) => Promise<void>
  disconnect: () => void
  lastActivity: Date | null
}

export function useRealtimeChat(options: RealtimeChatOptions): RealtimeChatReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [lastActivity, setLastActivity] = useState<Date | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const sessionRef = useRef(options.sessionId)

  // Update session reference when options change
  useEffect(() => {
    sessionRef.current = options.sessionId
  }, [options.sessionId])

  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!message.trim()) return

    try {
      setIsConnecting(true)
      setLastActivity(new Date())

      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-intelligence-session-id': sessionRef.current,
          'x-correlation-id': `realtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
          context: options.context,
          stream: true
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      setIsConnected(true)
      setIsConnecting(false)
      setIsStreaming(true)

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')

            // Keep the last potentially incomplete line
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()

                if (data === '[DONE]') {
                  setIsStreaming(false)
                  options.onComplete?.()
                  break
                }

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.content) {
                    options.onMessage?.({
                      type: 'text',
                      data: parsed.content,
                      timestamp: new Date(),
                      sessionId: sessionRef.current,
                      isComplete: parsed.done || false
                    })
                  }
                } catch (parseError) {
                  // Ignore parsing errors for individual chunks
                  console.warn('Failed to parse streaming chunk:', parseError)
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
          setIsStreaming(false)
        }
      }

    } catch (error) {
      setIsConnecting(false)
      setIsStreaming(false)

      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Real-time chat error:', error)
        options.onError?.(error)

        options.onMessage?.({
          type: 'error',
          data: `Connection error: ${error.message}`,
          timestamp: new Date(),
          sessionId: sessionRef.current
        })
      }
    }
  }, [options])

  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
    setIsStreaming(false)
    setLastActivity(null)

    console.log('Real-time chat disconnected')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    isConnecting,
    isStreaming,
    sendMessage,
    disconnect,
    lastActivity
  }
}
