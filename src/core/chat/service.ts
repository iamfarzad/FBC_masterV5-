import type { ChatRequest, ChatChunk } from '../types/chat'
import { selectProvider, getProvider } from '../ai'
import { contextStorage } from '../context/context-storage'
import { embedTexts } from '../embeddings/gemini'
import { upsertEmbeddings, queryTopK } from '../embeddings/query'

export async function* chatService(req: ChatRequest): AsyncIterable<ChatChunk> {
  // Choose provider based on intent and URL detection when possible
  const provider = selectProvider(req.messages)
  let chunkId = 0
  let responseText = ''

  try {
    // Extract session ID and lead context from request
    const sessionId = (req as any).sessionId || 'default-session'
    const leadContext = (req as any).leadContext || {}
    const conversationStage: string | undefined = (req as any).conversationStage
    const hasGreeted: boolean | undefined = (req as any).hasGreeted

    // Optionally hydrate intelligence context (company/person/role) for richer system prompt
    let intelligenceContext: undefined | {
      company?: unknown
      person?: unknown
      role?: string
      roleConfidence?: number
    }
    try {
      const ctx = await contextStorage.get(sessionId)
      if (ctx) {
        intelligenceContext = {
          company: ctx.company_context,
          person: ctx.person_context,
          role: ctx.role,
          roleConfidence: ctx.role_confidence,
        }
      }
    } catch {
      // best-effort; ignore failures
    }

    // Attach session data to the latest message so getSystemPrompt can read it
    const enhancedMessages = req.messages.map((msg, index) => {
      const isLast = index === req.messages.length - 1
      return {
        ...msg,
        ...(isLast ? {
          metadata: {
            ...(msg as any).metadata,
            sessionData: {
              sessionId,
              leadContext,
              conversationStage,
              intelligenceContext,
              hasGreeted,
              timestamp: new Date().toISOString()
            }
          }
        } : {})
      }
    })

    // Memory retrieval (best-effort)
    let messagesForProvider = enhancedMessages
    try {
      const lastUser = req.messages[req.messages.length - 1]?.content || ''
      if (lastUser && lastUser.length > 8) {
        const vectors = await embedTexts([lastUser], 768)
        if (vectors && vectors[0]) {
          const top = await queryTopK(sessionId, vectors[0], 3)
          const snippets: string[] = Array.isArray(top)
            ? top.map((r: any) => r?.text || r?.snippet || r?.raw?.text || r?.raw?.snippet).filter(Boolean)
            : []
          if (snippets.length) {
            const summary = snippets.slice(0, 3).map((s, i) => `• ${String(s).slice(0, 240)}${String(s).length > 240 ? '…' : ''}`).join('\n')
            const memoryMessage = { role: 'user', content: `Relevant conversation memory (for grounding):\n${summary}` }
            // Insert memory message just before the last user message
            messagesForProvider = [
              ...enhancedMessages.slice(0, -1),
              memoryMessage,
              enhancedMessages[enhancedMessages.length - 1]
            ]
          }
        }
      }
    } catch (e) {
      // Memory lookup is best-effort; ignore failures
    }

    // Generate response using provider with enhanced context
    const introFilterEnabled = Boolean((req as any).hasGreeted || (conversationStage && conversationStage !== 'greeting'))
    let introFiltering = introFilterEnabled
    let pending = ''
    const stripIntro = (s: string): string => {
      try {
        // Remove leading generic greeting/self-intro if present
        const patterns = [
          /^\s*(hi|hello|hey)[^\n.!?]*[\n.!?]+/i,
          /^\s*i\s*['’]?m\s*f\.?\s*b\/?\s*c[^\n.!?]*[\n.!?]+/i,
          /^\s*(hi|hello)[^\n]*i\s*['’]?m\s*f\.?\s*b\/?\s*c[^\n]*[\n.!?]+/i,
        ]
        let out = s
        for (const re of patterns) {
          out = out.replace(re, '')
        }
        return out
      } catch { return s }
    }

    for await (const text of provider.generate({ messages: messagesForProvider })) {
      if (introFiltering) {
        pending += text
        // Wait until we have a sentence boundary or reasonable chunk to filter
        if (/[\.!?\n]/.test(pending) || pending.length > 300) {
          const filtered = stripIntro(pending)
          introFiltering = false
          pending = ''
          responseText += filtered
          if (filtered) {
            yield { id: String(chunkId++), type: 'text', data: filtered }
          }
        }
        continue
      }
      responseText += text
      yield { id: String(chunkId++), type: 'text', data: text }
    }

    // Save conversation to context storage (non-blocking)
    if (responseText) {
      try {
        const userMessage = req.messages[req.messages.length - 1]?.content || ''

        // Update context asynchronously without blocking the response
        contextStorage.update(sessionId, {
          last_user_message: userMessage
        }).catch(err => console.error('Failed to save conversation context:', err))

        // Persist simple stage progression as part of intent_data
        try {
          const count = req.messages.length
          let idx = 1
          if (count <= 2) idx = 1
          else if (count <= 4) idx = 2
          else if (count <= 6) idx = 3
          else if (count <= 8) idx = 4
          else if (count <= 11) idx = 5
          else if (count <= 14) idx = 6
          else idx = 7
          const stageNames = [
            'First impression & rapport building',
            'Stakeholder identification & role understanding',
            'Consent acquisition & intelligence gathering',
            'Competitive landscape & industry analysis',
            'Pain point identification & impact quantification',
            'Tailored proposals & value proposition',
            'Decision facilitation & next steps'
          ]
          const name = stageNames[Math.max(1, Math.min(idx, 7)) - 1]
          contextStorage.update(sessionId, {
            intent_data: {
              conversation_stage: { index: idx, name }
            }
          }).catch(() => {})
        } catch {}

        // Also upsert embeddings for semantic memory when configured
        try {
          const vectors = await embedTexts([userMessage], 768)
          if (vectors && vectors[0]) {
            await upsertEmbeddings(sessionId, 'chat', [userMessage], vectors)
          }
        } catch (e) {
          // Ignore embedding failures
        }
      } catch (contextError) {
        // Don't fail the response if context saving fails
        console.error('Context save error (non-critical):', contextError)
      }
    }

    yield {
      id: 'done',
      type: 'done',
      data: null
    }
  } catch (error) {
    console.error('Chat service error:', error)

    // If we haven't yielded anything yet, send an error response
    if (chunkId === 0) {
      yield {
        id: 'error',
        type: 'text',
        data: 'I apologize, but I\'m having trouble responding right now. Please try again.'
      }
    }

    yield {
      id: 'done',
      type: 'done',
      data: null
    }
  }
}
