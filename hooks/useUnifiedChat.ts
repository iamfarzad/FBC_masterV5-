import { useState, useEffect, useCallback, useRef } from 'react'
import { useChat as useAIChat } from '@ai-sdk/react'

export type ChatMode = 'standard' | 'realtime' | 'admin' | 'multimodal'

export interface UnifiedChatOptions {
  mode?: ChatMode
  conversationId?: string
  systemPrompt?: string
  onError?: (error: Error) => void
}

export interface UnifiedMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export function useUnifiedChat(options: UnifiedChatOptions = {}) {
  const { mode = 'standard', conversationId, systemPrompt, onError } = options
  
  // Use AI SDK chat hook for standard mode
  const aiChat = useAIChat({
    api: '/api/chat',
    onError,
    initialMessages: systemPrompt ? [
      { id: 'system', role: 'system', content: systemPrompt }
    ] : undefined
  })

  const [realtimeMessages, setRealtimeMessages] = useState<UnifiedMessage[]>([])
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket connection for realtime mode
  useEffect(() => {
    if (mode === 'realtime') {
      const ws = new WebSocket(`ws://localhost:3001`)
      
      ws.onopen = () => {
        setIsRealtimeConnected(true)
        if (conversationId) {
          ws.send(JSON.stringify({ type: 'join', conversationId }))
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'message') {
            const message: UnifiedMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: data.content,
              timestamp: new Date(data.timestamp),
              metadata: data.metadata
            }
            setRealtimeMessages(prev => [...prev, message])
          }
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsRealtimeConnected(false)
        onError?.(new Error('WebSocket connection failed'))
      }

      ws.onclose = () => {
        setIsRealtimeConnected(false)
      }

      wsRef.current = ws

      return () => {
        ws.close()
      }
    }
  }, [mode, conversationId, onError])

  // Send message based on mode
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMessage: UnifiedMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    switch (mode) {
      case 'realtime':
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          setRealtimeMessages(prev => [...prev, userMessage])
          wsRef.current.send(JSON.stringify({
            type: 'message',
            content,
            conversationId
          }))
        }
        break

      case 'admin':
        // Admin mode would have special handling
        try {
          const response = await fetch('/api/admin/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: content, conversationId })
          })
          
          if (!response.ok) throw new Error('Admin chat failed')
          
          const data = await response.json()
          // Handle admin response
        } catch (error) {
          onError?.(error as Error)
        }
        break

      case 'multimodal':
        // Multimodal would handle different input types
        try {
          const response = await fetch('/api/multimodal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              content, 
              type: 'text',
              conversationId 
            })
          })
          
          if (!response.ok) throw new Error('Multimodal chat failed')
          
          const data = await response.json()
          // Handle multimodal response
        } catch (error) {
          onError?.(error as Error)
        }
        break

      default:
        // Standard mode uses AI SDK
        aiChat.handleSubmit(new Event('submit') as any)
    }
  }, [mode, conversationId, aiChat, onError])

  // Unified interface
  return {
    messages: mode === 'standard' ? aiChat.messages : realtimeMessages,
    input: mode === 'standard' ? aiChat.input : '',
    handleInputChange: mode === 'standard' ? aiChat.handleInputChange : () => {},
    handleSubmit: (e: React.FormEvent) => {
      e.preventDefault()
      if (mode === 'standard') {
        aiChat.handleSubmit(e)
      } else {
        const input = (e.target as any).elements.message?.value
        sendMessage(input)
      }
    },
    isLoading: mode === 'standard' ? aiChat.isLoading : false,
    error: mode === 'standard' ? aiChat.error : null,
    sendMessage,
    isConnected: mode === 'realtime' ? isRealtimeConnected : true,
    mode,
    clear: () => {
      if (mode === 'standard') {
        aiChat.setMessages([])
      } else {
        setRealtimeMessages([])
      }
    }
  }
}