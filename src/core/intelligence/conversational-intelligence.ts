import { GoogleGroundingProvider } from './providers/search/google-grounding'
import { LeadResearchService } from './lead-research'
import { detectRole } from './role-detector'
import type { ContextSnapshot } from '../context/context-schema'
import { getContextSnapshot, updateContext } from '../context/context-manager'
import type { IntentResult, Suggestion } from '../types/intelligence'
import { suggestTools } from './tool-suggestion-engine'

export class ConversationalIntelligence {
  private grounding = new GoogleGroundingProvider()
  private research = new LeadResearchService()

  async initSession(input: { sessionId: string; email: string; name?: string; companyUrl?: string }): Promise<ContextSnapshot | null> {
    const { sessionId, email, name, companyUrl } = input
    const researchResult = await this.research.researchLead(email, name, companyUrl, sessionId)
    const role = await detectRole({
      company: { summary: researchResult.company?.summary, industry: researchResult.company?.industry },
      person: { role: researchResult.person?.role, seniority: researchResult.person?.seniority },
      role: researchResult.role,
    })
    await updateContext(sessionId, {
      company: researchResult.company,
      person: researchResult.person,
      role: role.role,
      roleConfidence: role.confidence,
    })
    return await getContextSnapshot(sessionId)
  }

  async researchLead(input: { sessionId: string; email: string; name?: string; companyUrl?: string }) {
    return this.research.researchLead(input.email, input.name, input.companyUrl, input.sessionId)
  }

  async detectRoleFromResearch(research: unknown) {
    return detectRole(research)
  }

  async detectIntent(text: string, context: ContextSnapshot): Promise<IntentResult> {
    // Import the intent detector dynamically to avoid circular dependencies
    const { detectIntent } = await import('./intent-detector')
    return detectIntent(text)
  }

  async suggestTools(context: ContextSnapshot, intent: IntentResult, stage: string): Promise<Suggestion[]> {
    return suggestTools(context, intent)
  }
}


