/**
 * AI SDK Intelligence Context System
 * Native intelligence integration with AI SDK
 */

import { generateObject, generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

const model = google('gemini-1.5-flash-latest')

// Intelligence Context Schema
const IntelligenceContextSchema = z.object({
  lead: z.object({
    name: z.string(),
    email: z.string().email(),
    company: z.string().optional(),
    role: z.string().optional(),
    confidence: z.number().min(0).max(1)
  }).optional(),
  
  company: z.object({
    name: z.string(),
    domain: z.string(),
    industry: z.string().optional(),
    size: z.string().optional(),
    description: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    confidence: z.number().min(0).max(1)
  }).optional(),
  
  person: z.object({
    role: z.string().optional(),
    seniority: z.string().optional(),
    department: z.string().optional(),
    interests: z.array(z.string()).optional(),
    confidence: z.number().min(0).max(1)
  }).optional(),
  
  intent: z.object({
    primary: z.string(),
    secondary: z.array(z.string()).optional(),
    urgency: z.enum(['low', 'medium', 'high']),
    budget: z.enum(['unknown', 'limited', 'moderate', 'high']).optional(),
    timeline: z.string().optional(),
    confidence: z.number().min(0).max(1)
  }).optional(),
  
  capabilities: z.array(z.string()).optional(),
  conversationStage: z.enum(['discovery', 'qualification', 'demonstration', 'negotiation', 'closing']).optional(),
  timestamp: z.string()
})

export type IntelligenceContext = z.infer<typeof IntelligenceContextSchema>

// AI SDK Intelligence Service
export class AISDKIntelligenceService {
  
  /**
   * Analyze conversation for intelligence context
   */
  async analyzeConversation(messages: Array<{role: string, content: string}>): Promise<IntelligenceContext> {
    const conversationText = messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n')
    
    try {
      const result = await generateObject({
        model,
        schema: IntelligenceContextSchema,
        system: `You are an expert business intelligence analyst. Analyze conversations to extract:
        - Lead information (name, email, company, role)
        - Company details (name, industry, size, tech stack)
        - Person details (role, seniority, interests)
        - Intent analysis (what they want, urgency, budget)
        - Conversation stage and next steps
        
        Only extract information that is explicitly mentioned or can be reasonably inferred.
        Set confidence scores based on how certain you are about each piece of information.`,
        prompt: `Analyze this conversation and extract intelligence context:\n\n${conversationText}`
      })
      
      return result.object
    } catch (error) {
      console.error('Intelligence analysis failed:', error)
      return {
        timestamp: new Date().toISOString()
      }
    }
  }
  
  /**
   * Enrich lead context with external data
   */
  async enrichLeadContext(email: string, domain?: string): Promise<Partial<IntelligenceContext>> {
    try {
      const enrichmentPrompt = `Research and provide business context for:
      Email: ${email}
      ${domain ? `Domain: ${domain}` : ''}
      
      Provide reasonable business context based on the email domain and common patterns.`
      
      const result = await generateObject({
        model,
        schema: IntelligenceContextSchema.partial(),
        system: `You are a lead enrichment specialist. Based on email addresses and domains, 
        provide reasonable business context including likely company info, person role, and industry.
        Use common patterns and logical inference. Set confidence scores appropriately.`,
        prompt: enrichmentPrompt
      })
      
      return result.object
    } catch (error) {
      console.error('Lead enrichment failed:', error)
      return {}
    }
  }
  
  /**
   * Generate personalized system prompt based on intelligence
   */
  async generatePersonalizedPrompt(context: IntelligenceContext): Promise<string> {
    const basePrompt = `You are F.B/c AI, a specialized business automation and AI consultant.`
    
    if (!context.lead && !context.company && !context.person) {
      return basePrompt
    }
    
    try {
      const result = await generateText({
        model,
        system: `You are a personalization expert. Create personalized system prompts for AI assistants 
        based on intelligence context. Make the prompt feel natural and relevant to the specific user.`,
        prompt: `Create a personalized system prompt for an AI business consultant based on this context:
        
        ${JSON.stringify(context, null, 2)}
        
        Base prompt: "${basePrompt}"
        
        Make it feel personal and relevant while maintaining professionalism.`
      })
      
      return result.text
    } catch (error) {
      console.error('Prompt personalization failed:', error)
      return basePrompt
    }
  }
  
  /**
   * Suggest next best actions based on context
   */
  async suggestNextActions(context: IntelligenceContext): Promise<Array<{
    action: string
    priority: 'high' | 'medium' | 'low'
    reason: string
    tool?: string
  }>> {
    try {
      const result = await generateObject({
        model,
        schema: z.object({
          actions: z.array(z.object({
            action: z.string(),
            priority: z.enum(['high', 'medium', 'low']),
            reason: z.string(),
            tool: z.string().optional()
          }))
        }),
        system: `You are a business development expert. Based on intelligence context, 
        suggest the next best actions to move the conversation forward and provide value.`,
        prompt: `Based on this intelligence context, suggest 3-5 next best actions:
        
        ${JSON.stringify(context, null, 2)}
        
        Consider the conversation stage, intent, and available tools/capabilities.`
      })
      
      return result.object.actions
    } catch (error) {
      console.error('Action suggestion failed:', error)
      return []
    }
  }
  
  /**
   * Update intelligence context with new information
   */
  mergeIntelligenceContext(existing: IntelligenceContext, update: Partial<IntelligenceContext>): IntelligenceContext {
    return {
      ...existing,
      ...update,
      lead: update.lead ? { ...existing.lead, ...update.lead } : existing.lead,
      company: update.company ? { ...existing.company, ...update.company } : existing.company,
      person: update.person ? { ...existing.person, ...update.person } : existing.person,
      intent: update.intent ? { ...existing.intent, ...update.intent } : existing.intent,
      capabilities: update.capabilities ? 
        [...(existing.capabilities || []), ...update.capabilities] : existing.capabilities,
      timestamp: new Date().toISOString()
    }
  }
}

// Singleton instance
export const intelligenceService = new AISDKIntelligenceService()

// Context storage using AI SDK patterns
export class AISDKContextStorage {
  private contexts = new Map<string, IntelligenceContext>()
  
  async store(sessionId: string, context: IntelligenceContext): Promise<void> {
    this.contexts.set(sessionId, context)
    
    // In production, persist to database
    console.log(`[AI_SDK_INTELLIGENCE] Stored context for session ${sessionId}`)
  }
  
  async retrieve(sessionId: string): Promise<IntelligenceContext | null> {
    const context = this.contexts.get(sessionId)
    
    if (!context) {
      console.log(`[AI_SDK_INTELLIGENCE] No context found for session ${sessionId}`)
      return null
    }
    
    return context
  }
  
  async update(sessionId: string, updates: Partial<IntelligenceContext>): Promise<IntelligenceContext | null> {
    const existing = await this.retrieve(sessionId)
    
    if (!existing) {
      return null
    }
    
    const updated = intelligenceService.mergeIntelligenceContext(existing, updates)
    await this.store(sessionId, updated)
    
    return updated
  }
  
  async analyze(sessionId: string, messages: Array<{role: string, content: string}>): Promise<IntelligenceContext> {
    const context = await intelligenceService.analyzeConversation(messages)
    await this.store(sessionId, context)
    
    return context
  }
}

// Singleton instance
export const contextStorage = new AISDKContextStorage()

export default {
  intelligenceService,
  contextStorage,
  IntelligenceContextSchema
}