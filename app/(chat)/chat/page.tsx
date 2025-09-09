"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { UnifiedChatInterface } from '@/components/chat/UnifiedChatInterface'
import { UnifiedChatLayout } from '@/components/chat/UnifiedChatLayout'
import { MessageData } from '@/components/chat/UnifiedMessage'
import '@/styles/figma-design.css'

interface ConversationState {
  stage: string
  name?: string
  email?: string
  companyInfo?: {
    name: string
    domain: string
    industry: string
    insights: string[]
    challenges: string[]
  }
  discoveredChallenges?: string[]
  preferredSolution?: 'training' | 'consulting' | 'both'
  leadScore?: number
}

interface StreamingState {
  isConnected: boolean
  isListening: boolean
  isSpeaking: boolean
  audioLevel: number
}

export default function ChatPage() {
  const [messages, setMessages] = useState<MessageData[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [activeInputMode, setActiveInputMode] = useState<'text' | 'voice' | 'video' | 'screen'>('text')
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    audioLevel: 0
  })
  const [conversationState, setConversationState] = useState<ConversationState>({
    stage: 'greeting'
  })
  const [partialTranscript, setPartialTranscript] = useState('')
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Generate session ID on mount
  useEffect(() => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    setSessionId(id)
  }, [])

  // Send message to backend
  const handleSendMessage = useCallback(async (content?: string) => {
    const messageContent = content || input
    if (!messageContent.trim() && activeInputMode === 'text') return
    
    const newMessage: MessageData = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      // Check if we should use streaming
      const useStreaming = activeInputMode !== 'text'
      
      if (useStreaming) {
        // Use SSE for streaming responses
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
        }
        
        const params = new URLSearchParams({
          messages: JSON.stringify([...messages, newMessage]),
          sessionId,
          stream: 'true'
        })
        
        const eventSource = new EventSource(`/api/chat/stream?${params}`)
        eventSourceRef.current = eventSource
        
        let accumulatedText = ''
        const aiMessageId = Date.now().toString()
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data)
          if (data.type === 'text') {
            accumulatedText += data.data
            setMessages(prev => {
              const updated = [...prev]
              const lastIndex = updated.length - 1
              if (lastIndex >= 0 && updated[lastIndex].id === aiMessageId) {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: accumulatedText
                }
              } else {
                updated.push({
                  id: aiMessageId,
                  role: 'assistant',
                  content: accumulatedText,
                  timestamp: new Date()
                })
              }
              return updated
            })
          } else if (data.type === 'done') {
            setIsLoading(false)
            eventSource.close()
          }
        }
        
        eventSource.onerror = () => {
          setIsLoading(false)
          eventSource.close()
        }
      } else {
        // Use regular POST for non-streaming
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, newMessage],
            sessionId,
            stream: false,
            context: {
              multimodal: {
                voice: activeInputMode === 'voice',
                webcam: activeInputMode === 'video',
                screen: activeInputMode === 'screen'
              }
            }
          })
        })
        
        const data = await response.json()
        
        const aiMessage: MessageData = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message || data.error || 'No response',
          timestamp: new Date(),
          metadata: data.metadata
        }
        
        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      const errorMessage: MessageData = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, messages, sessionId, activeInputMode])

  // Handle WebSocket connection for real-time features
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close()
      setStreamingState(prev => ({ ...prev, isConnected: false }))
      return
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws/chat?sessionId=${sessionId}`)
    wsRef.current = ws
    
    ws.onopen = () => {
      setStreamingState(prev => ({ ...prev, isConnected: true }))
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'audio_level') {
        setStreamingState(prev => ({ ...prev, audioLevel: data.level }))
      } else if (data.type === 'transcript') {
        setPartialTranscript(data.text)
      }
    }
    
    ws.onclose = () => {
      setStreamingState(prev => ({ ...prev, isConnected: false }))
    }
  }, [sessionId])

  // Handle mode change
  const handleModeChange = useCallback((mode: 'text' | 'voice' | 'video' | 'screen') => {
    setActiveInputMode(mode)
    
    // Connect WebSocket for real-time modes
    if (mode !== 'text' && !wsRef.current) {
      connectWebSocket()
    } else if (mode === 'text' && wsRef.current) {
      wsRef.current.close()
    }
  }, [connectWebSocket])

  // Handle suggestion clicks
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion)
    handleSendMessage(suggestion)
  }, [handleSendMessage])

  // Handle message actions
  const handleMessageAction = useCallback((action: string, messageId: string) => {
    console.log('Message action:', action, messageId)
    // Implement specific actions based on your needs
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Handle file upload logic here
      console.log('File uploaded:', file.name)
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return (
    <UnifiedChatLayout
      header={
        <div className="glass-card border-b backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← Back
              </a>
              <h1 className="text-lg font-semibold">AI Chat Assistant</h1>
            </div>
            <div className="text-xs text-muted-foreground">
              Session: {sessionId.slice(0, 8)}...
            </div>
          </div>
        </div>
      }
    >
      <UnifiedChatInterface
        messages={messages}
        conversationState={conversationState}
        completedBooking={null}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        activeInputMode={activeInputMode}
        streamingState={streamingState}
        partialTranscript={partialTranscript}
        permissionError={permissionError}
        onSendMessage={handleSendMessage}
        onSuggestionClick={handleSuggestionClick}
        onMessageAction={handleMessageAction}
        onModeChange={handleModeChange}
        onFileUpload={handleFileUpload}
        onDismissError={() => setPermissionError(null)}
      />
    </UnifiedChatLayout>
  )
}