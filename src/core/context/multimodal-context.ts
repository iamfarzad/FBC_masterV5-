import { ContextStorage } from './context-storage'
import { MultimodalContext, ConversationEntry, VisualEntry, AudioEntry, LeadContext } from './context-types'

export class MultimodalContextManager {
  private contextStorage: ContextStorage
  private activeContexts = new Map<string, MultimodalContext>()

  constructor() {
    this.contextStorage = new ContextStorage()
  }

  async initializeSession(sessionId: string, leadContext?: LeadContext): Promise<MultimodalContext> {
    const context: MultimodalContext = {
      sessionId,
      conversationHistory: [],
      visualContext: [],
      audioContext: [],
      leadContext: leadContext ?? { name: '', email: '', company: '' },
      metadata: {
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        modalitiesUsed: [],
        totalTokens: 0
      }
    }

    // Store in memory for fast access
    this.activeContexts.set(sessionId, context)

    // Note: Like FB-c_labV2, we don't store multimodal context in database
    // It's managed purely in memory for now to avoid schema complications
    // Action logged`)
    return context
  }

  async addTextMessage(sessionId: string, content: string, metadata?: ConversationEntry['metadata']): Promise<void> {
    const context = await this.getOrCreateContext(sessionId)

    const entry: ConversationEntry = {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      modality: 'text',
      content,
      metadata: metadata ?? {}
    }

    context.conversationHistory.push(entry)
    context.metadata.lastUpdated = entry.timestamp
    context.metadata.modalitiesUsed = [...new Set([...context.metadata.modalitiesUsed, 'text'])]

    // Estimate tokens (rough approximation)
    context.metadata.totalTokens += Math.ceil(content.length / 4)

    await this.saveContext(sessionId, context)
    // Action logged
  }

  async addVoiceMessage(sessionId: string, transcription: string, duration: number, metadata?: Partial<AudioEntry['metadata']>): Promise<void> {
    const context = await this.getOrCreateContext(sessionId)

    // Add to conversation history
    const convEntry: ConversationEntry = {
      id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      modality: 'voice',
      content: transcription,
      metadata: { duration, transcription }
    }

    context.conversationHistory.push(convEntry)

    // Add to audio context
    const audioEntry: AudioEntry = {
      id: convEntry.id,
      timestamp: convEntry.timestamp,
      duration,
      transcription,
      metadata: {
        sampleRate: metadata?.sampleRate || 16000,
        format: metadata?.format || 'audio/pcm',
        confidence: metadata?.confidence || 0.9
      }
    }

    context.audioContext.push(audioEntry)
    context.metadata.lastUpdated = convEntry.timestamp
    context.metadata.modalitiesUsed = [...new Set([...context.metadata.modalitiesUsed, 'voice'])]

    // Estimate tokens
    context.metadata.totalTokens += Math.ceil(transcription.length / 4)

    await this.saveContext(sessionId, context)
    // Action logged
  }

  async addVisualAnalysis(sessionId: string, analysis: string, type: 'webcam' | 'screen' | 'upload', imageSize?: number, imageData?: string): Promise<void> {
    const context = await this.getOrCreateContext(sessionId)

    // Add to conversation history
    const convEntry: ConversationEntry = {
      id: `vision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      modality: 'vision',
      content: analysis,
      metadata: { ...(typeof imageSize === 'number' ? { imageSize } : {}) }
    }

    context.conversationHistory.push(convEntry)

    // Add to visual context
    const visualEntry: VisualEntry = {
      id: convEntry.id,
      timestamp: convEntry.timestamp,
      type,
      analysis,
      imageData: imageData ?? '',
      metadata: {
        size: imageSize || 0,
        format: type,
        confidence: 0.9 // Assume high confidence for now
      }
    }

    context.visualContext.push(visualEntry)
    context.metadata.lastUpdated = convEntry.timestamp
    context.metadata.modalitiesUsed = [...new Set([...context.metadata.modalitiesUsed, 'vision'])]

    // Estimate tokens for analysis
    context.metadata.totalTokens += Math.ceil(analysis.length / 4)

    await this.saveContext(sessionId, context)
    // Action logged
  }

  async getContext(sessionId: string): Promise<MultimodalContext | null> {
    // Check memory first
    if (this.activeContexts.has(sessionId)) {
      return this.activeContexts.get(sessionId)!
    }

    // Check database
    const stored = await this.contextStorage.get(sessionId)
    if (stored?.multimodal_context) {
      this.activeContexts.set(sessionId, stored.multimodal_context)
      return stored.multimodal_context
    }

    return null
  }

  async getConversationHistory(sessionId: string, limit?: number): Promise<ConversationEntry[]> {
    const context = await this.getContext(sessionId)
    if (!context) return []

    const history = context.conversationHistory
    return limit ? history.slice(-limit) : history
  }

  async getRecentVisualContext(sessionId: string, limit: number = 3): Promise<VisualEntry[]> {
    const context = await this.getContext(sessionId)
    if (!context) return []

    return context.visualContext.slice(-limit)
  }

  async getRecentAudioContext(sessionId: string, limit: number = 3): Promise<AudioEntry[]> {
    const context = await this.getContext(sessionId)
    if (!context) return []

    return context.audioContext.slice(-limit)
  }

  async getContextSummary(sessionId: string): Promise<{
    totalMessages: number
    modalitiesUsed: string[]
    lastActivity: string
    recentTopics: string[]
  }> {
    const context = await this.getContext(sessionId)
    if (!context) {
      return { totalMessages: 0, modalitiesUsed: [], lastActivity: '', recentTopics: [] }
    }

    const recentMessages = context.conversationHistory.slice(-5)
    const recentTopics = this.extractTopics(recentMessages)

    return {
      totalMessages: context.conversationHistory.length,
      modalitiesUsed: context.metadata.modalitiesUsed,
      lastActivity: context.metadata.lastUpdated,
      recentTopics
    }
  }

  private async getOrCreateContext(sessionId: string): Promise<MultimodalContext> {
    let context = await this.getContext(sessionId)
    if (!context) {
      context = await this.initializeSession(sessionId)
    }
    return context
  }

  private async saveContext(sessionId: string, context: MultimodalContext): Promise<void> {
    // Update memory only (like FB-c_labV2 approach)
    this.activeContexts.set(sessionId, context)
    // Action logged`)
  }

  private extractTopics(messages: ConversationEntry[]): string[] {
    const topics = new Set<string>()
    const content = messages.map(m => m.content).join(' ').toLowerCase()

    // Simple keyword extraction (could be enhanced with NLP)
    const topicKeywords = {
      business: /\b(business|company|organization|enterprise|startup)\b/g,
      ai: /\b(ai|artificial.intelligence|machine.learning|automation)\b/g,
      analysis: /\b(analysis|analyze|research|study|investigation)\b/g,
      technical: /\b(technical|technology|software|development|code)\b/g,
      financial: /\b(financial|money|cost|budget|revenue|profit)\b/g,
      visual: /\b(image|photo|picture|screen|screenshot|camera)\b/g,
      audio: /\b(audio|voice|sound|speech|music|recording)\b/g
    }

    for (const [topic, pattern] of Object.entries(topicKeywords)) {
      if (pattern.test(content)) {
        topics.add(topic)
      }
    }

    return Array.from(topics)
  }

  async clearSession(sessionId: string): Promise<void> {
    // Clear from memory only (like FB-c_labV2 approach)
    this.activeContexts.delete(sessionId)
    // Action logged`)
  }

  // Get all active sessions (for monitoring)
  getActiveSessions(): string[] {
    return Array.from(this.activeContexts.keys())
  }
}

// Export singleton instance
export const multimodalContextManager = new MultimodalContextManager()
