import { intelligenceService } from '@/src/core/intelligence'
import { sessionInitSchema } from '@/src/core/validation/index'
import type { ContextSnapshot } from '@/src/core/types/intelligence'

export interface IntelligenceRequest {
  action: 'init-session' | 'analyze-message' | 'research-lead'
  data: Record<string, unknown>
}

export async function handleIntelligence(body: IntelligenceRequest): Promise<unknown> {
  const { action, data } = body

  switch (action) {
    case 'init-session': {
      const validated = sessionInitSchema.parse(data)
      const context = await intelligenceService.initSession(validated)
      return { success: true, context }
    }

    case 'analyze-message': {
      const { message, context } = data as { message: string; context?: ContextSnapshot }
      const intent = await intelligenceService.analyzeMessage(message, context)
      return { success: true, intent }
    }

    case 'research-lead': {
      const { email, name, companyUrl, sessionId } = data as { email: string; name?: string; companyUrl?: string; sessionId?: string }

      // Action logged

      const result = await intelligenceService.researchLead(email, name, companyUrl)

      // Store in context if sessionId provided
      if (sessionId) {
        const { ContextStorage } = await import('@/src/core/context/context-storage')
        const contextStorage = new ContextStorage()

        await contextStorage.update(sessionId, {
          company_context: result.company,
          person_context: result.person,
          role: result.role,
          role_confidence: result.confidence
        })

        // Optional: store embeddings for memory when enabled
        if (process.env.EMBEDDINGS_ENABLED === 'true') {
          const { embedTexts } = await import('@/src/core/embeddings/gemini')
          const { upsertEmbeddings } = await import('@/src/core/embeddings/query')

          const texts: string[] = []
          if (result.company?.summary) texts.push(String(result.company.summary))
          if (result.person?.summary) texts.push(String(result.person.summary))
          const vectors = texts.length ? await embedTexts(texts, 1536) : []
          if (vectors.length) await upsertEmbeddings(sessionId, 'lead_research', texts, vectors)
        }
      }

      // Action logged

      return { success: true, research: {
        company: result.company,
        person: result.person,
        role: result.role,
        scores: { confidence: result.confidence },
        citations: result.citations || []
      }}
    }

    default:
      throw new Error(`Unknown intelligence action: ${action}`)
  }
}