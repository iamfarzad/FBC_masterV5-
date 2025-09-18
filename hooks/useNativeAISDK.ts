/**
 * Native AI SDK Hook
 * Uses AI SDK's native streaming with full metadata support
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UIMessage as Message } from 'ai'
import {
  UNIFIED_CHAT_STORE_ID,
  syncUnifiedChatStoreState,
  resetUnifiedChatStore,
} from '@/src/core/chat/state/unified-chat-store'

export interface NativeAISDKOptions {
  sessionId?: string
  mode?: 'standard' | 'realtime' | 'admin' | 'multimodal' | 'automation'
  context?: {
    sessionId?: string
    leadContext?: {
      name?: string
      email?: string
      company?: string
      role?: string
      industry?: string
    }
    intelligenceContext?: any
    conversationIds?: string[]
    adminId?: string
    multimodalData?: {
      audioData?: string | Uint8Array
      imageData?: string | Uint8Array
      videoData?: string | Uint8Array
    }
    [key: string]: any
  }
  initialMessages?: Message[]
  onMessage?: (message: Message) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

export interface NativeAISDKReturn {
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  error: Error | null
  sendMessage: (content: string) => Promise<void>
  addMessage: (message: Omit<Message, 'id'>) => Message
  clearMessages: () => void
  updateContext: (context: Partial<NativeAISDKOptions['context']>) => void
  // AI SDK native methods
  append: (message: Message) => Promise<void>
  reload: () => Promise<void>
  stop: () => void
  setMessages: (messages: Message[]) => void
  // Rich metadata
  toolInvocations: any[]
  annotations: any[]
}

export function useNativeAISDK(options: NativeAISDKOptions): NativeAISDKReturn {
  const {
    sessionId = 'native-ai-sdk',
    mode = 'standard',
    context,
    initialMessages = [],
    onMessage,
    onComplete,
    onError,
  } = options

  // Build system prompt based on mode and context
  const systemPrompt = useMemo(() => {
    let prompt = "You are F.B/c AI, a helpful business assistant."
    
    if (mode === 'admin') {
      prompt = `You are F.B/c AI Admin Assistant, specialized in business intelligence and management.
      
Your capabilities:
- Analyze lead data and provide actionable insights
- Draft professional emails for campaigns
- Suggest meeting scheduling strategies
- Interpret analytics and performance metrics
- Provide business recommendations based on data
- Help with lead scoring and prioritization

Response style: Be concise, actionable, and data-driven.`
    }

    // Add intelligence context if available
    if (context?.intelligenceContext) {
      const intCtx = context.intelligenceContext
      let contextData = '\n\nPERSONALIZED CONTEXT:\n'
      
      if (intCtx.lead) {
        contextData += `User: ${intCtx.lead.name} (${intCtx.lead.email})\n`
      }
      
      if (intCtx.company) {
        contextData += `Company: ${intCtx.company.name || 'Unknown'}\n`
        if (intCtx.company.industry) contextData += `Industry: ${intCtx.company.industry}\n`
        if (intCtx.company.size) contextData += `Size: ${intCtx.company.size}\n`
      }
      
      if (intCtx.person) {
        if (intCtx.person.role) contextData += `Role: ${intCtx.person.role}\n`
        if (intCtx.person.seniority) contextData += `Seniority: ${intCtx.person.seniority}\n`
      }

      prompt += contextData
    }

    // Add multimodal context
    if (context?.multimodalData) {
      let multimodalContext = '\n\nMULTIMODAL INPUT:\n'
      
      if (context.multimodalData.audioData) {
        multimodalContext += `Audio input received (${context.multimodalData.audioData.length} bytes)\n`
      }
      
      if (context.multimodalData.imageData) {
        multimodalContext += `Image input received (${context.multimodalData.imageData.length} bytes)\n`
      }
      
      if (context.multimodalData.videoData) {
        multimodalContext += `Video input received\n`
      }

      prompt += multimodalContext
    }

    return prompt
  }, [mode, context])

  // Use existing unified chat infrastructure with enhanced metadata
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [toolInvocations, setToolInvocations] = useState<any[]>([])
  const [annotations, setAnnotations] = useState<any[]>([])

  const append = useCallback(async (message: Message) => {
    setMessages(prev => [...prev, message])
  }, [])

  const reload = useCallback(async () => {
    // Reload functionality - would need to be implemented
    console.log('[NATIVE_AI_SDK] Reload requested')
  }, [])

  const stop = useCallback(() => {
    setIsLoading(false)
  }, [])

  const isStreaming = isLoading && messages.length > 0

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || isLoading) return

    try {
      setIsLoading(true)
      setError(null)

      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
      }
      setMessages(prev => [...prev, userMessage])

      // Call unified API with enhanced metadata
      const response = await fetch('/api/chat/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
          'x-chat-mode': mode,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context,
          mode,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Parse SSE stream
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      let assistantMessage: Message | null = null
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.role === 'assistant') {
                if (!assistantMessage) {
                  assistantMessage = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: data.content,
                  }
                  setMessages(prev => [...prev, assistantMessage!])
                } else {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage!.id 
                      ? { ...msg, content: data.content }
                      : msg
                  ))
                }

                // Extract enhanced metadata
                if (data.metadata?.toolInvocations) {
                  setToolInvocations(data.metadata.toolInvocations)
                }
                if (data.metadata?.annotations) {
                  setAnnotations(data.metadata.annotations)
                }

                if (data.metadata?.isComplete) {
                  setIsLoading(false)
                  onComplete?.()
                  break
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      setIsLoading(false)
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error)
    }
  }, [messages, isLoading, sessionId, mode, context, onComplete, onError])

  const addMessage = useCallback((message: Omit<Message, 'id'>): Message => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [setMessages])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [setMessages])

  const updateContext = useCallback((newContext: Partial<NativeAISDKOptions['context']>) => {
    // Context updates would require re-initializing the chat
    // For now, we'll log the update
    console.log('[NATIVE_AI_SDK] Context update requested:', newContext)
  }, [])

  // Sync state to unified store for compatibility
  useEffect(() => {
    syncUnifiedChatStoreState({
      id: sessionId,
      messages: messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(),
        type: 'text' as const,
        metadata: {
          mode,
          isComplete: !isStreaming,
          toolInvocations: toolInvocations?.length || 0,
          annotations: annotations?.length || 0,
        },
      })),
      status: error ? 'error' : isStreaming ? 'streaming' : isLoading ? 'submitted' : 'ready',
      error: error ?? undefined,
      context,
      sendMessage: async (content: string) => {
        await sendMessage(content)
      },
      regenerate: reload,
      stop,
      resumeStream: undefined, // Not supported in native AI SDK
      addToolResult: undefined, // Handled by AI SDK
      setMessages: (msgs) => {
        setMessages(msgs.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })))
      },
      clearError: () => {
        // AI SDK handles errors internally
      },
    }, UNIFIED_CHAT_STORE_ID)
  }, [
    messages,
    isLoading,
    isStreaming,
    error,
    context,
    sendMessage,
    reload,
    stop,
    setMessages,
    sessionId,
    mode,
    toolInvocations,
    annotations,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetUnifiedChatStore(UNIFIED_CHAT_STORE_ID)
    }
  }, [])

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    addMessage,
    clearMessages,
    updateContext,
    // AI SDK native methods
    append,
    reload,
    stop,
    setMessages,
    // Rich metadata
    toolInvocations: toolInvocations || [],
    annotations: annotations || [],
  }
}
