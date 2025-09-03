import { useState, useEffect, useCallback, useRef } from 'react'

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
  
  // Custom chat implementation
  const [messages, setMessages] = useState<UnifiedMessage[]>(
    systemPrompt ? [{
      id: 'system',
      role: 'system',
      content: systemPrompt,
      timestamp: new Date()
    }] : []
  )
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // WebSocket connection for realtime mode
  useEffect(() => {
    if (mode === 'realtime') {
      const ws = new WebSocket(`ws://localhost:3001`)
      
      ws.onopen = () => {
        setIsConnected(true)
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
            setMessages(prev => [...prev, message])
          }
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
        onError?.(new Error('WebSocket connection failed'))
      }

      ws.onclose = () => {
        setIsConnected(false)
      }

      wsRef.current = ws

      return () => {
        ws.close()
      }
    }
  }, [mode, conversationId, onError])

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  // Send message via standard API
  const sendStandardMessage = useCallback(async (content: string) => {
    const userMessage: UnifiedMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      const assistantMessage: UnifiedMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message || data.content || 'No response',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const errorObj = err as Error
      setError(errorObj)
      onError?.(errorObj)
    } finally {
      setIsLoading(false)
      setInput('')
    }
  }, [messages, onError])

  // Send message based on mode
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    switch (mode) {
      case 'realtime':
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const userMessage: UnifiedMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, userMessage])
          wsRef.current.send(JSON.stringify({
            type: 'message',
            content,
            conversationId
          }))
          setInput('')
        }
        break

      case 'admin':
        // Admin mode
        try {
          setIsLoading(true)
          const response = await fetch('/api/admin/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: content, conversationId })
          })
          
          if (!response.ok) throw new Error('Admin chat failed')
          
          const data = await response.json()
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.message,
            timestamp: new Date()
          }])
          setInput('')
        } catch (err) {
          setError(err as Error)
          onError?.(err as Error)
        } finally {
          setIsLoading(false)
        }
        break

      case 'multimodal':
        // Multimodal mode
        try {
          setIsLoading(true)
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
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.message,
            timestamp: new Date()
          }])
          setInput('')
        } catch (err) {
          setError(err as Error)
          onError?.(err as Error)
        } finally {
          setIsLoading(false)
        }
        break

      default:
        // Standard mode
        await sendStandardMessage(content)
    }
  }, [mode, conversationId, sendStandardMessage, onError])

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
    }
  }, [input, sendMessage])

  // Clear messages
  const clear = useCallback(() => {
    setMessages([])
    setInput('')
    setError(null)
  }, [])

  // Unified interface
  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    sendMessage,
    isConnected,
    mode,
    clear,
    setInput
  }
}