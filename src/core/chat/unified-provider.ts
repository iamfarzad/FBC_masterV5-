/**
 * Unified Chat Provider
 * Single provider that handles all chat modes and routing
 */

import {
  UnifiedChatProvider,
  UnifiedMessage,
  UnifiedContext,
  ChatMode,
  ChatCapabilities,
  UnifiedChatChunk
} from './unified-types'
import { getProvider } from '../ai'
import { ContextStorage } from '../context/context-storage'
import { multimodalContextManager } from '../context/multimodal-context'
import { unifiedErrorHandler } from './unified-error-handler'
import { unifiedStreamingService, sseFromAsyncIterable } from '../streaming/unified-stream'
import { adminChatService } from '../admin/admin-chat-service'
import { embedText } from '../embeddings/gemini'
import { supabaseService } from '@/src/core/supabase/client'

export class UnifiedChatProviderImpl implements UnifiedChatProvider {
  private adminSessions = new Map<string, {
    isConnected: boolean
    lastActivity: Date
    messageCount: number
    adminId?: string
  }>()

  // 🔧 PATCH: if something may be a Uint8Array but param is string | undefined
  private asMaybeString(v: unknown): string | undefined {
    return typeof v === 'string' ? v : undefined;
  }

  private realtimeSessions = new Map<string, {
    isConnected: boolean
    isConnecting: boolean
    isStreaming: boolean
    lastActivity: Date
    messageCount: number
    abortController?: AbortController
    correlationId?: string
  }>()

  private contextStorage: ContextStorage

  constructor() {
    this.contextStorage = new ContextStorage()
  }


  async *generate(input: {
    messages: UnifiedMessage[]
    context?: UnifiedContext
    mode?: ChatMode
  }): AsyncIterable<UnifiedMessage> {
    const { messages, context, mode = 'standard' } = input

    try {
      // Get the underlying AI provider
      const aiProvider = getProvider()
      let chunkId = 0
      let responseText = ''

      // Handle admin mode with database persistence and embeddings
      if (mode === 'admin') {
        yield* this.handleAdminMode(messages, context, aiProvider)
        return
      }

      // Process multimodal data if provided (skip for admin mode)
      let multimodalContent = ''
      if (context?.multimodalData && context.sessionId) {
        try {
          if (context.multimodalData.audioData) {
            // Add voice message to multimodal context
            await multimodalContextManager.addVoiceMessage(
              context.sessionId,
              `Audio input: ${context.multimodalData.audioData.length} bytes`,
              0, // duration not provided
              { format: 'audio/pcm', sampleRate: 16000, confidence: 0.9 }
            )
            multimodalContent += `[Audio input received - ${context.multimodalData.audioData.length} bytes]`
          }
          if (context.multimodalData.imageData) {
            // Add visual analysis to multimodal context
            await multimodalContextManager.addVisualAnalysis(
              context.sessionId,
              `Image input: ${context.multimodalData.imageData.length} bytes`,
              'webcam', // default type
              context.multimodalData.imageData.length,
              context.multimodalData.imageData
            )
            multimodalContent += `[Image input received - ${context.multimodalData.imageData.length} bytes]`
          }
          {
            const vd = context?.multimodalData?.videoData;
            // where TS says: 'string | Uint8Array' not assignable to 'string | undefined'
            const videoNote = this.asMaybeString(vd);
            if (videoNote) {
              multimodalContent += videoNote;
            }
          }
        } catch (multimodalError) {
          const meta = {
            sessionId: context?.sessionId,
            mode,
            ...(context?.adminId ? { userId: context.adminId } : {})
          };
          unifiedErrorHandler.handleError(multimodalError, meta, 'multimodal_processing');
          // Continue without multimodal processing
        }
      }

      // INTEGRATE INTELLIGENCE CONTEXT: Add intelligence data to multimodal content
      if (context?.intelligenceContext) {
        multimodalContent += `\n\nINTELLIGENCE CONTEXT:\n${context.intelligenceContext}`
      }

      // PDF generation is handled by dedicated API route due to Puppeteer dependencies
      // This prevents client-side bundling issues with Node.js modules
      if ((context as any)?.capability === 'exportPdf') {
        // Redirect to dedicated PDF API endpoint
        yield {
          id: 'pdf_redirect',
          role: 'assistant',
          content: 'PDF generation is being processed through dedicated endpoint.',
          timestamp: new Date(),
          type: 'text',
          metadata: {
            mode: 'automation',
            capability: 'exportPdf',
            redirectTo: '/api/export-summary',
            context: context
          }
        }
        return
      }

      // Enhance messages with context for system prompt
      const enhancedMessages = this.enhanceMessagesWithContext(messages, context, mode, multimodalContent)

      // Generate response using the AI provider
      for await (const text of aiProvider.generate({ messages: enhancedMessages })) {
        responseText += text

        // Yield unified message chunk
        yield {
          id: `chunk_${chunkId++}`,
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
          type: 'text',
          metadata: {
            mode,
            isStreaming: true,
            chunkId
          }
        }
      }

      // Save conversation context (non-blocking)
      if (responseText && context?.sessionId) {
        try {
          const userMessage = messages[messages.length - 1]
          if (userMessage) {
            await this.contextStorage.update(context.sessionId, {
              last_user_message: userMessage.content
            }).catch(err => console.error('Context save error (non-critical):', err))
          }
        } catch (contextError) {
          console.error('Context save error (non-critical):', contextError)
        }
      }

      // Yield final complete message
      yield {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        type: 'text',
        metadata: {
          mode,
          isComplete: true,
          finalChunk: true
        }
      }

    } catch (error) {
      const meta2: { sessionId?: string; mode?: string; userId?: string } = { mode }
      if (context?.sessionId) meta2.sessionId = context.sessionId
      if (context?.adminId) meta2.userId = context.adminId
      const chatError = unifiedErrorHandler.handleError(error, meta2, 'chat_generation')

      // Yield standardized error message
      yield {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: chatError.message,
        timestamp: new Date(),
        type: 'text',
        metadata: {
          mode,
          error: true,
          errorCode: chatError.code,
          recoverable: chatError.recoverable,
          errorMessage: chatError.message
        }
      }
    }
  }

  supportsMode(mode: ChatMode): boolean {
    const supportedModes: ChatMode[] = ['standard', 'realtime', 'admin', 'multimodal', 'automation']
    return supportedModes.includes(mode)
  }

  // Admin Chat Methods
  async initializeAdminSession(sessionId: string, adminId?: string): Promise<void> {
    // when passing the status payload (example)
    this.adminSessions.set(sessionId, {
      isConnected: true,
      lastActivity: new Date(),
      messageCount: 0,
      ...(adminId ? { adminId } : {}) // ← conditional spread instead of adminId: string|undefined
    })
  }

  async updateAdminActivity(sessionId: string): Promise<void> {
    const session = this.adminSessions.get(sessionId)
    if (session) {
      session.lastActivity = new Date()
      session.messageCount++
    }
  }

  // methods must match the base type: return Promise
  async getAdminSessionStatus(sessionId: string): Promise<{ isActive: boolean; lastActivity: Date } | null> {
    const s = this.adminSessions.get(sessionId);
    if (!s) return null;
    return { isActive: !!s.isConnected, lastActivity: s.lastActivity ?? new Date(0) };
  }

  async disconnectAdminSession(sessionId: string): Promise<void> {
    this.adminSessions.delete(sessionId);
  }

  // Real-time Chat Methods
  async initializeRealtimeSession(sessionId: string): Promise<void> {
    this.realtimeSessions.set(sessionId, {
      isConnected: false,
      isConnecting: false,
      isStreaming: false,
      lastActivity: new Date(),
      messageCount: 0,
      correlationId: `realtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })
  }

  async updateRealtimeActivity(sessionId: string): Promise<void> {
    const session = this.realtimeSessions.get(sessionId)
    if (session) {
      session.lastActivity = new Date()
      session.messageCount++
    }
  }

  getRealtimeSessionStatus(sessionId: string): {
    isConnected: boolean
    isConnecting: boolean
    isStreaming: boolean
    lastActivity: Date | null
    messageCount: number
    correlationId?: string
  } | null {
    const session = this.realtimeSessions.get(sessionId)
    return session ? {
      isConnected: session.isConnected,
      isConnecting: session.isConnecting,
      isStreaming: session.isStreaming,
      lastActivity: session.lastActivity,
      messageCount: session.messageCount,
      ...(session.correlationId ? { correlationId: session.correlationId } : {})
    } : null
  }

  disconnectRealtimeSession(sessionId: string): void {
    const session = this.realtimeSessions.get(sessionId)
    if (session?.abortController) {
      session.abortController.abort()
    }
    this.realtimeSessions.delete(sessionId)
  }

  async connectRealtimeSession(sessionId: string): Promise<void> {
    const session = this.realtimeSessions.get(sessionId)
    if (session) {
      session.isConnected = true
      session.isConnecting = false
      session.lastActivity = new Date()
    }
  }

  async setRealtimeConnecting(sessionId: string, connecting: boolean): Promise<void> {
    const session = this.realtimeSessions.get(sessionId)
    if (session) {
      session.isConnecting = connecting
      session.lastActivity = new Date()
    }
  }

  async setRealtimeStreaming(sessionId: string, streaming: boolean): Promise<void> {
    const session = this.realtimeSessions.get(sessionId)
    if (session) {
      session.isStreaming = streaming
      session.lastActivity = new Date()
    }
  }

  getRealtimeAbortController(sessionId: string): AbortController | null {
    const session = this.realtimeSessions.get(sessionId)
    return session?.abortController || null
  }

  setRealtimeAbortController(sessionId: string, controller: AbortController): void {
    const session = this.realtimeSessions.get(sessionId)
    if (session) {
      session.abortController = controller
    }
  }

  /**
   * Handle admin mode with database persistence and embeddings
   */
  private async *handleAdminMode(
    messages: UnifiedMessage[],
    context?: UnifiedContext,
    aiProvider?: any
  ): AsyncIterable<UnifiedMessage> {
    const sessionId = context?.sessionId || 'admin-session'
    const adminId = context?.adminId

    try {
      // Ensure admin session exists
      console.log('Creating/finding admin session:', sessionId, adminId)
      await adminChatService.getOrCreateSession(sessionId, adminId)

      // Save user message to admin database
      const userMessage = messages[messages.length - 1]
      if (userMessage) {
        // Convert UnifiedMessage to AdminMessage format
        const adminUserMessage = {
          sessionId,
          ...(adminId ? { adminId } : {}),
          type: userMessage.role,
          content: userMessage.content,
          ...(context?.conversationIds ? { contextLeads: context.conversationIds } : {}),
          metadata: {
            mode: 'admin',
            timestamp: userMessage.timestamp.toISOString(),
            unifiedMessageId: userMessage.id
          }
        }
        await adminChatService.saveMessage(adminUserMessage)

        // Generate embeddings for user message (optional - don't fail if it doesn't work)
        try {
          const embeddings = await embedText([userMessage.content])
          if (embeddings?.[0]) {
            await adminChatService.saveMessage({
              sessionId,
              adminId,
              type: 'user',
              content: userMessage.content,
              embeddings: embeddings[0],
              contextLeads: context?.conversationIds
            } as any)
          }
        } catch (embeddingError) {
          console.warn('Embeddings not available for admin message:', embeddingError)
        }
      }

      // Build AI context with conversation history and basic lead information
      let adminContext = await adminChatService.buildAIContext(
        sessionId,
        userMessage?.content || '',
        context?.conversationIds
      )

      // INTEGRATE INTELLIGENCE CONTEXT: If intelligence context is provided, add it
      if (context?.intelligenceContext) {
        adminContext += `\n\nINTELLIGENCE RESEARCH DATA:\n${  context.intelligenceContext}`
      }

      // Get conversation history for context
      const conversationContext = await adminChatService.getConversationContext(
        sessionId,
        userMessage?.content || '',
        10
      )

      // Prepare messages for AI with admin system prompt
      const adminSystemMessage = {
        role: 'system' as const,
        content: `You are F.B/c AI Admin Assistant, a specialized business intelligence and management AI.

Your capabilities:
- Analyze lead data and provide actionable insights
- Draft professional emails for campaigns and follow-ups
- Suggest meeting scheduling strategies and optimizations
- Interpret analytics and performance metrics
- Provide business recommendations based on data
- Help with lead scoring and prioritization
- Monitor system health and performance
- Assist with cost optimization and budget management
- Generate reports and summaries
- Suggest improvements for business processes

Available Context:
${adminContext}

Response Style:
- Be concise, actionable, and data-driven
- Provide specific recommendations with rationale
- Use available context to support your suggestions
- Suggest next steps and priorities
- Maintain professional, business-focused tone`
      }

      // Convert conversation history to AI format
      const conversationMessages = conversationContext.messages.slice(-5).map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))

      const aiMessages = [
        adminSystemMessage,
        ...conversationMessages,
        {
          role: 'user' as const,
          content: userMessage?.content || 'Hello, I need assistance with admin tasks.'
        }
      ]

      // Generate response using AI provider
      let responseText = ''
      for await (const text of aiProvider.generate({ messages: aiMessages })) {
        responseText += text
        yield {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: text,
          timestamp: new Date(),
          type: 'text',
          metadata: {
            mode: 'admin',
            adminSessionId: sessionId,
            isStreaming: true
          }
        }
      }

      // Save assistant response to admin database
      if (responseText) {
        // Convert to AdminMessage format
        const adminAssistantMessage = {
          sessionId,
          ...(adminId ? { adminId } : {}),
          type: 'assistant' as const,
          content: responseText,
          ...(context?.conversationIds ? { contextLeads: context.conversationIds } : {}),
          metadata: {
            mode: 'admin',
            contextUsed: adminContext.length > 0,
            leadsReferenced: context?.conversationIds?.length || 0,
            intelligenceIntegrated: context?.intelligenceContext !== undefined
          }
        }
        await adminChatService.saveMessage(adminAssistantMessage)

        // Generate embeddings for assistant response (optional)
        try {
          const embeddings = await embedText([responseText])
          if (embeddings?.[0]) {
            await adminChatService.saveMessage({
              sessionId,
              adminId,
              type: 'assistant',
              content: responseText,
              embeddings: embeddings[0],
              contextLeads: context?.conversationIds
            } as any)
          }
        } catch (embeddingError) {
          console.warn('Embeddings not available for admin response:', embeddingError)
        }
      }

      // Yield final complete message
      yield {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        type: 'text',
        metadata: {
          mode: 'admin',
          isComplete: true,
          finalChunk: true,
          adminSessionId: sessionId
        }
      }

    } catch (error) {
      const chatError = unifiedErrorHandler.handleError(error, {
        sessionId,
        mode: 'admin',
        ...(adminId ? { userId: adminId } : {})
      }, 'admin_mode_processing')

      yield {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: chatError.message,
        timestamp: new Date(),
        type: 'text',
        metadata: {
          mode: 'admin',
          error: true,
          errorCode: chatError.code,
          isComplete: true
        }
      }
    }
  }

  /**
   * Legacy streaming method for backward compatibility
   * Returns Response in original SSE format (string chunks)
   */
  async generateLegacyStream(
    input: {
      messages: UnifiedMessage[]
      context?: UnifiedContext
      mode?: ChatMode
    }
  ): Promise<Response> {
    const { messages, context, mode = 'standard' } = input

    try {
      // Get the underlying AI provider
      const aiProvider = getProvider()
      const chunkId = 0
      let responseText = ''

      // Process multimodal data if provided
      let multimodalContent = ''
      if (context?.multimodalData && context.sessionId) {
        try {
          if (context.multimodalData.audioData) {
            await multimodalContextManager.addVoiceMessage(
              context.sessionId,
              `Audio input: ${context.multimodalData.audioData.length} bytes`,
              0,
              { format: 'audio/pcm', sampleRate: 16000, confidence: 0.9 }
            )
            multimodalContent += `[Audio input received - ${context.multimodalData.audioData.length} bytes]`
          }
          if (context.multimodalData.imageData) {
            await multimodalContextManager.addVisualAnalysis(
              context.sessionId,
              `Image input: ${context.multimodalData.imageData.length} bytes`,
              'webcam',
              context.multimodalData.imageData.length,
              context.multimodalData.imageData
            )
            multimodalContent += `[Image input received - ${context.multimodalData.imageData.length} bytes]`
          }
          if (context.multimodalData.videoData) {
            await multimodalContextManager.addVisualAnalysis(
              context.sessionId,
              `Video input: ${context.multimodalData.videoData.length} bytes`,
              'screen',
              context.multimodalData.videoData.length,
              this.asMaybeString(context.multimodalData.videoData)
            )
            multimodalContent += `[Video input received - ${context.multimodalData.videoData.length} bytes]`
          }
        } catch (multimodalError) {
          const error = unifiedErrorHandler.handleError(multimodalError, {
            ...(context?.sessionId ? { sessionId: context.sessionId } : {}),
            mode,
            ...(context?.adminId ? { userId: context.adminId } : {})
          }, 'multimodal_processing')
        }
      }

      // Enhance messages with context for system prompt
      const enhancedMessages = this.enhanceMessagesWithContext(messages, context, mode, multimodalContent)

      // Create async iterable that yields string chunks (legacy format)
      async function* textChunks() {
        for await (const text of aiProvider.generate({ messages: enhancedMessages })) {
          responseText += text
          yield text
        }

        // Save conversation to context storage (non-blocking)
        if (responseText && context?.sessionId) {
          try {
            const contextStorage = new ContextStorage()
            const userMessage = messages[messages.length - 1]?.content || ''

            contextStorage.update(context.sessionId, {
              last_user_message: userMessage
            }).catch(err => console.error('Failed to save conversation context:', err))
          } catch (contextError) {
            console.error('Context save error (non-critical):', contextError)
          }
        }
      }

      return sseFromAsyncIterable(textChunks())

    } catch (error) {
      const chatError = unifiedErrorHandler.handleError(error, {
        ...(context?.sessionId ? { sessionId: context.sessionId } : {}),
        mode,
        ...(context?.adminId ? { userId: context.adminId } : {})
      }, 'legacy_stream_generation')

      // Return error response in legacy format
      const errorResponse = new Response(
        `event: error\ndata: ${JSON.stringify({ error: chatError.message })}\n\n`,
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
          }
        }
      )

      return errorResponse
    }
  }

  getCapabilities(): ChatCapabilities {
    return {
      supportsStreaming: true,
      supportsMultimodal: true,
      supportsRealtime: true,
      maxTokens: 4000,
      supportedModes: ['standard', 'realtime', 'admin', 'multimodal']
    }
  }

  private enhanceMessagesWithContext(
    messages: UnifiedMessage[],
    context?: UnifiedContext,
    mode?: ChatMode,
    multimodalContent?: string
  ): { role: string; content: string }[] {
    // Convert UnifiedMessage[] to the format expected by AI provider
    // IMPORTANT: Map 'assistant' to 'model' for Gemini API compatibility
    let enhancedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role, // Convert assistant -> model
      content: msg.content
    }))

    // Filter out system messages since Gemini doesn't support them in chat history
    enhancedMessages = enhancedMessages.filter(msg => msg.role !== 'system')

    // Add session data and multimodal content to the first user message for context
    if ((context?.sessionId || multimodalContent || context?.conversationIds) && enhancedMessages.length > 0) {
      const firstUserMessageIndex = enhancedMessages.findIndex(msg => msg.role === 'user')
      if (firstUserMessageIndex !== -1) {
        let additionalContent = ''

        if (multimodalContent) {
          additionalContent += `\n\n[MULTIMODAL_INPUT: ${multimodalContent}]`
        }

        if (context?.sessionId) {
          additionalContent += `\n\n[SESSION_CONTEXT: ${JSON.stringify({
            sessionId: context.sessionId,
            leadContext: context.leadContext,
            intelligenceContext: context.intelligenceContext,
            conversationIds: context.conversationIds,
            adminId: context.adminId,
            mode
          })}]`
        }

        {
          const prev = enhancedMessages[firstUserMessageIndex]
          const prevContent = prev ? (prev as any).content ?? '' : ''
          enhancedMessages[firstUserMessageIndex] = { role: 'user', content: prevContent + additionalContent }
        }
      }
    }

    return enhancedMessages
  }

  private buildSystemPrompt(context?: UnifiedContext, mode?: ChatMode): string {
    // Admin mode has special system prompt
    if (mode === 'admin') {
      return `You are an AI assistant helping with lead management and business operations. You have access to conversation history and can reference specific leads when asked. Always be helpful, accurate, and professional.`
    }

    // Standard system prompt for other modes
    return `You are F.B/c AI, a helpful and intelligent assistant. Provide clear, actionable responses.`
  }


  // Admin search and context implementation
  async searchAdminConversations(query: string, limit: number = 10, adminId?: string): Promise<any[]> {
    try {
      // Use admin chat service for semantic search
      const results = await adminChatService.searchAllConversations(query, limit, adminId)
      return results
    } catch (error) {
      console.error('Admin conversation search failed:', error)
      return []
    }
  }

  async getAdminConversationContext(sessionId: string, currentMessage: string = '', limit: number = 50): Promise<any> {
    try {
      const context = await adminChatService.getConversationContext(sessionId, currentMessage, limit)
      return context
    } catch (error) {
      console.error('Failed to get admin conversation context:', error)
      return {
        sessionId,
        messages: [],
        relevantHistory: [],
        leadContext: []
      }
    }
  }

  private async *handleAutomationMode(messages: UnifiedMessage[], context?: UnifiedContext): AsyncIterable<UnifiedMessage> {
    const capability = (context as any)?.capability

    switch (capability) {
      case 'exportPdf':
        // PDF generation is handled by dedicated API route due to Puppeteer dependencies
        yield {
          id: 'pdf_redirect',
          role: 'assistant',
          content: 'PDF generation is being processed through dedicated endpoint.',
          timestamp: new Date(),
          type: 'text',
          metadata: {
            mode: 'automation',
            capability: 'exportPdf',
            redirectTo: '/api/export-summary',
            context: context
          }
        }
        break

      default:
        yield {
          id: 'automation_error',
          role: 'assistant',
          content: `Unknown automation capability: ${capability}`,
          timestamp: new Date(),
          type: 'text',
          metadata: {
            mode: 'automation',
            error: true,
            capability
          }
        }
    }
  }
}

// Export singleton instance
export const unifiedChatProvider = new UnifiedChatProviderImpl()
