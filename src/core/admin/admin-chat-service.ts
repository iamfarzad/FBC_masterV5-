import { supabaseService } from '../supabase/client'
import type { Database } from '../database.types'

type AdminMessageType = 'user' | 'assistant' | 'system'
type AdminConversation = Database['public']['Tables']['admin_conversations']['Row']
type AdminSession = Database['public']['Tables']['admin_sessions']['Row']

export interface AdminMessage {
  id?: string
  sessionId: string
  conversationId?: string
  adminId?: string
  type: AdminMessageType
  content: string
  metadata?: Record<string, any>
  contextLeads?: string[]
  embeddings?: number[]
}

export interface AdminChatContext {
  sessionId: string
  messages: AdminMessage[]
  relevantHistory: AdminMessage[]
  leadContext?: {
    conversationId: string
    name: string
    email: string
    summary: string
    leadScore: number
    researchData: any
  }[]
}

export class AdminChatService {
  private static instance: AdminChatService
  private sessionCache = new Map<string, AdminChatContext>()

  static getInstance(): AdminChatService {
    if (!AdminChatService.instance) {
      AdminChatService.instance = new AdminChatService()
    }
    return AdminChatService.instance
  }

  /**
   * Create or get admin session
   */
  async getOrCreateSession(sessionId: string, adminId?: string, sessionName?: string): Promise<AdminSession> {
    // Check if session exists
    const { data: existingSession } = await supabaseService
      .schema('admin')
      .from('admin_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (existingSession) {
      // Update last activity
      await supabaseService
        .schema('admin')
        .from('admin_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', sessionId)

      return existingSession
    }

    // Create new session
    const { data: newSession, error } = await supabaseService
      .schema('admin')
      .from('admin_sessions')
      .insert({
        id: sessionId,
        admin_id: adminId,
        session_name: sessionName || `Session ${new Date().toLocaleDateString()}`,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return newSession
  }

  /**
   * Save message to persistent storage with embeddings
   */
  async saveMessage(message: AdminMessage): Promise<AdminConversation> {
    // Generate embeddings for the message content
    const embeddings = await this.generateEmbeddings(message.content)

    const { data, error } = await supabaseService
      .schema('admin')
      .from('admin_conversations')
      .insert({
        conversation_id: message.conversationId,
        admin_id: message.adminId,
        session_id: message.sessionId,
        message_type: message.type,
        message_content: message.content,
        message_metadata: message.metadata,
        embeddings,
        context_leads: message.contextLeads
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get conversation context with semantic search
   */
  async getConversationContext(
    sessionId: string,
    currentMessage: string,
    limit: number = 20
  ): Promise<AdminChatContext> {
    // Get recent messages from current session
    const { data: recentMessages } = await supabaseService
      .schema('admin')
      .from('admin_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Generate embeddings for current message and find semantically similar messages
    const currentEmbeddings = await this.generateEmbeddings(currentMessage)
    const { data: similarMessages } = await supabaseService
      .schema('admin')
      .rpc('search_admin_conversations', {
        query_embedding: currentEmbeddings,
        session_id_filter: sessionId,
        limit_count: 5,
        similarity_threshold: 0.7
      })

    // Format messages
    const messages: AdminMessage[] = (recentMessages || []).map(msg => ({
      id: msg.id,
      sessionId: msg.session_id,
      conversationId: msg.conversation_id,
      adminId: msg.admin_id,
      type: msg.message_type as AdminMessageType,
      content: msg.message_content,
      metadata: msg.message_metadata,
      contextLeads: msg.context_leads,
      embeddings: msg.embeddings
    })).reverse() // Reverse to chronological order

    const relevantHistory: AdminMessage[] = (similarMessages || []).map(msg => ({
      id: msg.id,
      sessionId: msg.session_id,
      conversationId: msg.conversation_id,
      type: msg.message_type as AdminMessageType,
      content: msg.message_content,
      contextLeads: msg.context_leads
    }))

    return {
      sessionId,
      messages,
      relevantHistory
    }
  }

  /**
   * Load lead context for admin conversation
   */
  async loadLeadContext(conversationIds: string[]): Promise<AdminChatContext['leadContext']> {
    if (!conversationIds.length) return []

    const { data: conversations } = await supabaseService
      .from('conversations')
      .select('id, name, email, summary, lead_score, research_json')
      .in('id', conversationIds)

    return (conversations || []).map(conv => ({
      conversationId: conv.id,
      name: conv.name || 'Unknown',
      email: conv.email || '',
      summary: conv.summary || '',
      leadScore: conv.lead_score || 0,
      researchData: conv.research_json
    }))
  }

  /**
   * Build context for AI from conversation history and lead data
   */
  async buildAIContext(
    sessionId: string,
    currentMessage: string,
    conversationIds?: string[]
  ): Promise<string> {
    const context = await this.getConversationContext(sessionId, currentMessage)

    let contextString = `# Admin Conversation Context\n\n`

    // Add recent conversation history
    if (context.messages.length > 0) {
      contextString += `## Recent Conversation History\n`
      context.messages.forEach(msg => {
        contextString += `**${msg.type.toUpperCase()}:** ${msg.content}\n\n`
      })
    }

    // Add semantically relevant history
    if (context.relevantHistory.length > 0) {
      contextString += `## Relevant Historical Context\n`
      context.relevantHistory.forEach(msg => {
        contextString += `**${msg.type.toUpperCase()}:** ${msg.content}\n\n`
      })
    }

    // Add lead context if specific conversations requested
    if (conversationIds && conversationIds.length > 0) {
      const leadContext = await this.loadLeadContext(conversationIds)
      if (leadContext.length > 0) {
        contextString += `## Lead Context\n`
        leadContext.forEach(lead => {
          contextString += `### Lead: ${lead.name} (${lead.email})\n`
          contextString += `**Lead Score:** ${lead.leadScore}/100\n`
          contextString += `**Summary:** ${lead.summary}\n\n`

          if (lead.researchData) {
            const company = lead.researchData.company || {}
            const person = lead.researchData.person || {}
            if (company.name) {
              contextString += `**Company:** ${company.name} (${company.industry || 'Unknown industry'})\n`
            }
            if (person.role) {
              contextString += `**Contact:** ${person.role} at ${company.name || 'company'}\n`
            }
          }
          contextString += `\n`
        })
      }
    }

    return contextString
  }

  /**
   * Generate embeddings using OpenAI (placeholder - implement based on your setup)
   */
  private async generateEmbeddings(text: string): Promise<number[]> {
    // This is a placeholder - implement with your embedding provider
    // For now, return empty array to avoid errors
    // In production, you'd call OpenAI's embedding API or similar

    // Example implementation:
    /*
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002'
      })
    })

    const data = await response.json()
    return data.data[0].embedding
    */

    return [] // Placeholder - implement with your embedding service
  }

  /**
   * Search across all admin conversations
   */
  async searchAllConversations(
    query: string,
    limit: number = 10,
    adminId?: string
  ): Promise<AdminMessage[]> {
    const queryEmbeddings = await this.generateEmbeddings(query)

    const { data } = await supabaseService
      .schema('admin')
      .rpc('search_admin_conversations', {
        query_embedding: queryEmbeddings,
        limit_count: limit,
        similarity_threshold: 0.6
      })

    return (data || []).map(msg => ({
      id: msg.id,
      sessionId: msg.session_id,
      conversationId: msg.conversation_id,
      type: msg.message_type as AdminMessageType,
      content: msg.message_content,
      contextLeads: msg.context_leads
    }))
  }

  /**
   * Get session list for admin
   */
  async getAdminSessions(adminId?: string, limit: number = 20): Promise<AdminSession[]> {
    let query = supabaseService
      .schema('admin')
      .from('admin_sessions')
      .select('*')
      .order('last_activity', { ascending: false })
      .limit(limit)

    if (adminId) {
      query = query.eq('admin_id', adminId)
    }

    const { data } = await query
    return data || []
  }

  /**
   * Clean up old sessions (optional maintenance)
   */
  async cleanupOldSessions(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const { count } = await supabaseService
      .schema('admin')
      .from('admin_sessions')
      .delete({ count: 'exact' })
      .eq('is_active', false)
      .lt('last_activity', cutoffDate.toISOString())

    return count || 0
  }
}

// Export singleton instance
export const adminChatService = AdminChatService.getInstance()
