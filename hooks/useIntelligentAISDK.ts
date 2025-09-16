/**
 * AI SDK Intelligent Chat Hook
 * Complete intelligence-enabled chat with AI SDK
 */

import { useChat } from 'ai/react'
import { useState, useEffect, useCallback } from 'react'
import type { Message } from 'ai'

interface IntelligentChatOptions {
  sessionId: string
  mode?: 'standard' | 'admin' | 'realtime' | 'multimodal'
  enableIntelligence?: boolean
  enableTools?: boolean
  context?: {
    leadContext?: {
      name?: string
      email?: string
      company?: string
      role?: string
    }
    intelligenceContext?: any
    conversationIds?: string[]
    adminId?: string
    multimodalData?: any
  }
  onIntelligenceUpdate?: (context: any) => void
  onToolCall?: (toolName: string, args: any, result: any) => void
}

interface IntelligenceContext {
  lead?: {
    name: string
    email: string
    company?: string
    role?: string
    confidence: number
  }
  company?: {
    name: string
    domain: string
    industry?: string
    size?: string
    confidence: number
  }
  person?: {
    role?: string
    seniority?: string
    department?: string
    confidence: number
  }
  intent?: {
    primary: string
    urgency: 'low' | 'medium' | 'high'
    budget?: string
    timeline?: string
    confidence: number
  }
  capabilities?: string[]
  conversationStage?: string
  timestamp: string
}

interface SuggestedAction {
  action: string
  priority: 'high' | 'medium' | 'low'
  reason: string
  tool?: string
}

export function useIntelligentAISDK(options: IntelligentChatOptions) {
  const [intelligenceContext, setIntelligenceContext] = useState<IntelligenceContext | null>(null)
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([])
  const [contextLoading, setContextLoading] = useState(false)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
    append,
    setMessages,
    setInput,
    data
  } = useChat({
    api: '/api/chat/intelligent',
    body: {
      sessionId: options.sessionId,
      mode: options.mode || 'standard',
      context: options.context,
      enableIntelligence: options.enableIntelligence !== false,
      enableTools: options.enableTools !== false
    },
    onResponse: (response) => {
      console.log('[INTELLIGENT_AI_SDK] Response headers:', {
        mode: response.headers.get('X-Chat-Mode'),
        hasContext: response.headers.get('X-Has-Context'),
        intelligenceEnabled: response.headers.get('X-Intelligence-Enabled'),
        toolsEnabled: response.headers.get('X-Tools-Enabled')
      })
    },
    onFinish: (message, { usage, finishReason }) => {
      console.log('[INTELLIGENT_AI_SDK] Finished:', {
        messageLength: message.content.length,
        usage,
        finishReason,
        toolCalls: message.toolInvocations?.length || 0
      })

      // Fetch updated intelligence context
      fetchIntelligenceContext()
    },
    onError: (error) => {
      console.error('[INTELLIGENT_AI_SDK] Error:', error)
    },
    onToolCall: ({ toolCall }) => {
      console.log('[INTELLIGENT_AI_SDK] Tool called:', {
        toolName: toolCall.toolName,
        args: toolCall.args
      })
      
      options.onToolCall?.(toolCall.toolName, toolCall.args, null)
    }
  })

  // Fetch intelligence context for session
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
        
        console.log('[INTELLIGENT_AI_SDK] Intelligence context updated:', {
          hasLead: !!data.context?.lead,
          hasCompany: !!data.context?.company,
          hasIntent: !!data.context?.intent,
          actionsCount: data.suggestedActions?.length || 0
        })
      }
    } catch (error) {
      console.error('[INTELLIGENT_AI_SDK] Failed to fetch intelligence context:', error)
    } finally {
      setContextLoading(false)
    }
  }, [options.sessionId, options.enableIntelligence, options.onIntelligenceUpdate])

  // Fetch intelligence context on mount and when session changes
  useEffect(() => {
    fetchIntelligenceContext()
  }, [fetchIntelligenceContext])

  // Convert AI SDK messages to unified format for compatibility
  const unifiedMessages = messages.map((msg: Message) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.createdAt || new Date(),
    type: 'text' as const,
    metadata: {
      toolCalls: msg.toolInvocations?.length || 0,
      usage: data?.[0]?.usage || undefined
    }
  }))

  // Enhanced send message with intelligence
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    try {
      await append({
        role: 'user',
        content: content.trim()
      })
    } catch (error) {
      console.error('[INTELLIGENT_AI_SDK] Send message failed:', error)
    }
  }, [append, isLoading])

  // Add message with intelligence awareness
  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }
    
    setMessages([...messages, newMessage])
    
    // Trigger intelligence update after adding message
    setTimeout(fetchIntelligenceContext, 100)
    
    return {
      ...newMessage,
      timestamp: newMessage.createdAt || new Date(),
      type: 'text' as const,
      metadata: {}
    }
  }, [messages, setMessages, fetchIntelligenceContext])

  // Clear messages and reset intelligence
  const clearMessages = useCallback(() => {
    setMessages([])
    setIntelligenceContext(null)
    setSuggestedActions([])
  }, [setMessages])

  // Execute suggested action
  const executeSuggestedAction = useCallback(async (action: SuggestedAction) => {
    console.log('[INTELLIGENT_AI_SDK] Executing suggested action:', action)
    
    if (action.tool) {
      // If action involves a tool, send a message that will trigger the tool
      await sendMessage(`Please help me with: ${action.action}`)
    } else {
      // Generic action execution
      await sendMessage(action.action)
    }
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
    // Core chat functionality
    messages: unifiedMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isStreaming: isLoading,
    error,
    reload,
    stop,
    setInput,
    
    // Enhanced functionality
    sendMessage,
    addMessage,
    clearMessages,
    
    // Intelligence features
    intelligenceContext,
    suggestedActions,
    contextLoading,
    executeSuggestedAction,
    getIntelligenceInsights,
    refreshIntelligence: fetchIntelligenceContext,
    
    // Tool data
    toolCalls: data?.filter(d => d.toolName) || [],
    
    // Compatibility
    updateContext: (context: any) => {
      console.log('[INTELLIGENT_AI_SDK] Context update requested:', context)
      // Context updates are handled automatically through intelligence system
    }
  }
}

// Legacy compatibility
export function useIntelligentChat(options: IntelligentChatOptions) {
  console.warn('⚠️ useIntelligentChat is deprecated. Use useIntelligentAISDK instead.')
  return useIntelligentAISDK(options)
}