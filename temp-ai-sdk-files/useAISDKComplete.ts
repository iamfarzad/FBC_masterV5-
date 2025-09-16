/**
 * Complete AI SDK Hook - Source of Truth
 * Handles all chat modes: standard, admin, realtime, multimodal
 */

import { useState, useCallback, useEffect } from 'react'

interface CompleteMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  type: 'text' | 'tool' | 'multimodal'
  metadata?: {
    toolCalls?: number
    intelligence?: any
    multimodal?: {
      type: 'image' | 'video' | 'audio' | 'screen'
      analysis?: string
    }
    error?: boolean
    usage?: any
  }
}

interface AISDKCompleteOptions {
  sessionId: string
  mode: 'standard' | 'admin' | 'realtime' | 'multimodal'
  enableIntelligence?: boolean
  enableTools?: boolean
  enableMultimodal?: boolean
  context?: {
    adminId?: string
    leadContext?: any
    multimodalData?: any
  }
  onIntelligenceUpdate?: (context: any) => void
  onToolCall?: (toolName: string, args: any, result: any) => void
  onError?: (error: Error) => void
}

export function useAISDKComplete(options: AISDKCompleteOptions) {
  const [messages, setMessages] = useState<CompleteMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [intelligenceContext, setIntelligenceContext] = useState<any>(null)
  const [suggestedActions, setSuggestedActions] = useState<any[]>([])
  const [contextLoading, setContextLoading] = useState(false)

  // Get appropriate API endpoint based on mode
  const getApiEndpoint = useCallback(() => {
    switch (options.mode) {
      case 'admin':
        return '/api/chat/admin'
      case 'realtime':
        return '/api/chat/realtime'
      case 'multimodal':
        return '/api/chat/multimodal'
      case 'standard':
      default:
        return '/api/chat/intelligent'
    }
  }, [options.mode])

  // Send message to appropriate AI SDK endpoint
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: CompleteMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setIsStreaming(true)
    setError(null)

    try {
      const endpoint = getApiEndpoint()
      console.log(`[AI_SDK_COMPLETE] Sending to ${endpoint}:`, {
        sessionId: options.sessionId,
        mode: options.mode,
        messageLength: content.length
      })

      const requestBody = {
        messages: [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content
        })),
        sessionId: options.sessionId,
        mode: options.mode,
        enableIntelligence: options.enableIntelligence,
        enableTools: options.enableTools,
        context: options.context
      }

      // Handle different response types based on mode
      if (options.mode === 'realtime') {
        // Real-time streaming
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            sessionId: options.sessionId,
            context: {
              isVoice: false,
              ...options.context?.multimodalData
            }
          })
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response stream')

        let assistantContent = ''
        const assistantMessage: CompleteMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          type: 'text'
        }

        setMessages(prev => [...prev, assistantMessage])

        // Stream response
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = new TextDecoder().decode(value)
          assistantContent += chunk
          
          setMessages(prev => prev.map(m => 
            m.id === assistantMessage.id 
              ? { ...m, content: assistantContent }
              : m
          ))
        }

      } else {
        // Standard/Admin/Multimodal with AI SDK streaming
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        if (options.mode === 'multimodal') {
          // Multimodal returns JSON analysis
          const result = await response.json()
          
          const assistantMessage: CompleteMessage = {
            id: result.id || crypto.randomUUID(),
            role: 'assistant',
            content: result.analysis || 'Analysis completed',
            timestamp: new Date(result.timestamp || Date.now()),
            type: 'multimodal',
            metadata: {
              multimodal: {
                type: result.type,
                analysis: result.analysis
              },
              usage: result.metadata
            }
          }

          setMessages(prev => [...prev, assistantMessage])

        } else {
          // Standard/Admin streaming response
          const reader = response.body?.getReader()
          if (!reader) throw new Error('No response stream')

          let assistantContent = ''
          const assistantMessage: CompleteMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            type: 'text'
          }

          setMessages(prev => [...prev, assistantMessage])

          // Parse AI SDK stream
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            
            // Handle AI SDK data stream format
            const lines = chunk.split('\n')
            for (const line of lines) {
              if (line.startsWith('0:')) {
                // Text chunk
                const text = line.slice(2).replace(/^"/, '').replace(/"$/, '')
                assistantContent += text
                
                setMessages(prev => prev.map(m => 
                  m.id === assistantMessage.id 
                    ? { ...m, content: assistantContent }
                    : m
                ))
              }
              // Handle tool calls, etc. in future iterations
            }
          }
        }
      }

      // Fetch updated intelligence context
      if (options.enableIntelligence) {
        setTimeout(() => fetchIntelligenceContext(), 500)
      }

    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      options.onError?.(errorObj)

      // Add error message
      const errorMessage: CompleteMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${errorObj.message}. Please try again.`,
        timestamp: new Date(),
        type: 'text',
        metadata: { error: true }
      }

      setMessages(prev => [...prev, errorMessage])

    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }, [messages, isLoading, options, getApiEndpoint])

  // Fetch intelligence context
  const fetchIntelligenceContext = useCallback(async () => {
    if (!options.enableIntelligence) return

    setContextLoading(true)
    try {
      const response = await fetch(`/api/chat/intelligent?sessionId=${options.sessionId}`)
      
      if (response.ok) {
        const data = await response.json()
        setIntelligenceContext(data.context)
        setSuggestedActions(data.suggestedActions || [])
        options.onIntelligenceUpdate?.(data.context)
      }
    } catch (error) {
      console.error('[AI_SDK_COMPLETE] Intelligence fetch failed:', error)
    } finally {
      setContextLoading(false)
    }
  }, [options.sessionId, options.enableIntelligence, options.onIntelligenceUpdate])

  // Initialize intelligence context
  useEffect(() => {
    if (options.enableIntelligence) {
      fetchIntelligenceContext()
    }
  }, [fetchIntelligenceContext])

  // Other methods
  const addMessage = useCallback((message: Omit<CompleteMessage, 'id'>) => {
    const newMessage: CompleteMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: message.timestamp || new Date()
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    setIntelligenceContext(null)
    setSuggestedActions([])
  }, [])

  const updateContext = useCallback((newContext: any) => {
    console.log('[AI_SDK_COMPLETE] Context update:', newContext)
    // Context updates handled through intelligence system
  }, [])

  // Execute suggested action
  const executeSuggestedAction = useCallback(async (action: any) => {
    console.log('[AI_SDK_COMPLETE] Executing action:', action)
    await sendMessage(action.action)
  }, [sendMessage])

  // Get intelligence insights
  const getIntelligenceInsights = useCallback(() => {
    if (!intelligenceContext) return null
    
    return {
      confidence: {
        lead: intelligenceContext.lead?.confidence || 0,
        company: intelligenceContext.company?.confidence || 0,
        intent: intelligenceContext.intent?.confidence || 0
      },
      completeness: {
        hasLead: !!intelligenceContext.lead,
        hasCompany: !!intelligenceContext.company,
        hasIntent: !!intelligenceContext.intent,
        hasCapabilities: (intelligenceContext.capabilities?.length || 0) > 0
      },
      stage: intelligenceContext.conversationStage || 'discovery',
      nextActions: suggestedActions.filter(a => a.priority === 'high').length
    }
  }, [intelligenceContext, suggestedActions])

  return {
    // Core chat
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    addMessage,
    clearMessages,
    updateContext,

    // Intelligence features
    intelligenceContext,
    suggestedActions,
    contextLoading,
    executeSuggestedAction,
    getIntelligenceInsights,
    refreshIntelligence: fetchIntelligenceContext,

    // AI SDK specific
    toolCalls: messages.filter(m => m.metadata?.toolCalls).length,
    mode: options.mode,
    capabilities: {
      intelligence: options.enableIntelligence,
      tools: options.enableTools,
      multimodal: options.enableMultimodal
    }
  }
}