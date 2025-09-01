import { detectIntent } from './intent-detector'
import { detectRole } from './role-detector'
import { LeadResearchService } from './lead-research'
import type { ContextSnapshot, IntentResult, ResearchResult } from '../types/intelligence'

export class IntelligenceService {
  private research = new LeadResearchService()

  async initSession(input: { 
    sessionId: string
    email: string
    name?: string
    companyUrl?: string 
  }): Promise<ContextSnapshot> {
    const { sessionId, email, name, companyUrl } = input

    // Research the lead
    const researchResult = await this.research.researchLead(email, name, companyUrl, sessionId)
    
    // Detect role from research
    const roleResult = await detectRole({
      company: researchResult.company,
      person: researchResult.person,
      role: researchResult.role
    })

    // Build context snapshot
    const context: ContextSnapshot = {
      lead: { email, name: name || email.split('@')[0] || '' },
      capabilities: ['search'], // Will be expanded
      role: roleResult.role,
      roleConfidence: roleResult.confidence,
      company: researchResult.company,
      person: researchResult.person
    }

    // Action logged

    return context
  }

  async analyzeMessage(message: string, context?: ContextSnapshot): Promise<IntentResult> {
    return detectIntent(message)
  }

  async researchLead(email: string, name?: string, companyUrl?: string): Promise<ResearchResult> {
    return this.research.researchLead(email, name, companyUrl)
  }

  clearCache() {
    this.research.clearCache()
  }
}

// Export singleton instance
export const intelligenceService = new IntelligenceService()

// Export individual functions for granular usage
export { detectIntent } from './intent-detector'
export { detectRole, detectRoleFromText } from './role-detector'
export { LeadResearchService } from './lead-research'