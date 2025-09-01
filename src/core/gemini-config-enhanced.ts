/**
 * Enhanced Gemini Configuration with Cost Optimization
 * Implements context caching, token limits, and conversation summarization
 */

export interface EnhancedGenerationConfig {
  maxOutputTokens: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  responseMimeType?: string;
  // Context caching configuration
  cacheConfig?: {
    ttl: number; // Time to live in seconds
    enabled: boolean;
  };
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
  timestamp?: string;
}

export interface OptimizedContent {
  contents: unknown[];
  estimatedTokens: number;
  usedCache: boolean;
  summary?: string;
}

export class GeminiConfigEnhanced {
  private static instance: GeminiConfigEnhanced;
  private conversationCache = new Map<string, { content: unknown[], timestamp: number, tokens: number }>();
  private systemPromptCache = new Map<string, { content: string, timestamp: number, tokens: number }>();

  static getInstance(): GeminiConfigEnhanced {
    if (!GeminiConfigEnhanced.instance) {
      GeminiConfigEnhanced.instance = new GeminiConfigEnhanced();
    }
    return GeminiConfigEnhanced.instance;
  }

  /**
   * Create optimized generation config with token limits
   */
  createGenerationConfig(
    feature: 'chat' | 'analysis' | 'document' | 'live' | 'research' | 'text_generation' | 'document_analysis',
    customLimits?: Partial<EnhancedGenerationConfig>
  ): EnhancedGenerationConfig {
    const baseConfigs = {
      chat: {
        maxOutputTokens: 2048, // Reasonable limit for chat responses
        temperature: 0.7,
        topP: 0.8,
        responseMimeType: 'text/plain',
        cacheConfig: { ttl: 1800, enabled: true } // 30 min cache
      },
      analysis: {
        maxOutputTokens: 1024, // Shorter for analysis
        temperature: 0.3, // More focused
        topP: 0.9,
        responseMimeType: 'text/plain',
        cacheConfig: { ttl: 3600, enabled: true } // 1 hour cache
      },
      document: {
        maxOutputTokens: 1536,
        temperature: 0.4,
        topP: 0.85,
        responseMimeType: 'text/plain',
        cacheConfig: { ttl: 7200, enabled: true } // 2 hour cache
      },
      live: {
        maxOutputTokens: 512, // Short for live responses
        temperature: 0.6,
        topP: 0.8,
        responseMimeType: 'text/plain',
        cacheConfig: { ttl: 300, enabled: true } // 5 min cache
      },
      research: {
        maxOutputTokens: 3072, // Longer for research
        temperature: 0.5,
        topP: 0.9,
        responseMimeType: 'text/plain',
        cacheConfig: { ttl: 3600, enabled: true } // 1 hour cache
      },
      // Aliases for unified feature naming
      text_generation: undefined as unknown as EnhancedGenerationConfig,
      document_analysis: undefined as unknown as EnhancedGenerationConfig
    };

    // Map aliases to their canonical configs
    if (feature === 'text_generation') {
      return { ...baseConfigs.chat, ...customLimits };
    }
    if (feature === 'document_analysis') {
      return { ...baseConfigs.document, ...customLimits };
    }

    return { ...baseConfigs[feature], ...customLimits };
  }

  /**
   * Optimize conversation history to reduce token usage
   */
  async optimizeConversation(
    messages: ConversationMessage[],
    systemPrompt: string,
    sessionId: string,
    maxHistoryTokens: number = 4000
  ): Promise<OptimizedContent> {
    const cacheKey = `${sessionId}_${this.hashContent(systemPrompt)}`;
    const now = Date.now();

    // Check if we have cached content
    const cached = this.conversationCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < 1800000) { // 30 min cache
      // Use cached content if recent
      const newMessages = messages.slice(-3); // Keep last 3 messages
      const contents = [
        ...cached.content,
        ...this.formatMessages(newMessages)
      ];
      
      return {
        contents,
        estimatedTokens: cached.tokens + this.estimateTokens(newMessages),
        usedCache: true
      };
    }

    // Create optimized content
    const optimizedContent = await this.createOptimizedContent(
      messages, 
      systemPrompt, 
      maxHistoryTokens
    );

    // Cache the system prompt and early conversation
    if (messages.length > 5) {
      const cacheableContent = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...this.formatMessages(messages.slice(0, Math.min(5, messages.length - 3)))
      ];
      
      this.conversationCache.set(cacheKey, {
        content: cacheableContent,
        timestamp: now,
        tokens: this.estimateTokens(messages.slice(0, 5)) + this.estimateTokens([{ content: systemPrompt, role: 'user' }])
      });
    }

    return optimizedContent;
  }

  /**
   * Create optimized content with summarization
   */
  private async createOptimizedContent(
    messages: ConversationMessage[],
    systemPrompt: string,
    maxHistoryTokens: number
  ): Promise<OptimizedContent> {
    // Always include system prompt
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] }
    ];

    let totalTokens = this.estimateTokens([{ content: systemPrompt, role: 'user' }]);
    
    if (messages.length <= 6) {
      // For short conversations, include all messages
      const formattedMessages = this.formatMessages(messages);
      contents.push(...formattedMessages);
      totalTokens += this.estimateTokens(messages);
      
      return {
        contents,
        estimatedTokens: totalTokens,
        usedCache: false
      };
    }

    // For long conversations, summarize older messages
    const recentMessages = messages.slice(-4); // Keep last 4 messages
    const olderMessages = messages.slice(0, -4);
    
    // Create summary of older messages
    const summary = this.createConversationSummary(olderMessages);
    const summaryTokens = this.estimateTokens([{ content: summary, role: 'user' }]);
    
    if (summaryTokens < maxHistoryTokens * 0.3) { // Summary should be < 30% of max tokens
      contents.push({ role: 'user', parts: [{ text: `Previous conversation summary: ${summary}` }] });
      totalTokens += summaryTokens;
    }

    // Add recent messages
    const formattedRecent = this.formatMessages(recentMessages);
    contents.push(...formattedRecent);
    totalTokens += this.estimateTokens(recentMessages);

    return {
      contents,
      estimatedTokens: totalTokens,
      usedCache: false,
      summary
    };
  }

  /**
   * Create a summary of conversation messages
   */
  private createConversationSummary(messages: ConversationMessage[]): string {
    if (messages.length === 0) return '';
    
    const topics = new Set<string>();
    const keyPoints: string[] = [];
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // Extract potential topics (simple keyword detection)
      if (content.includes('business') || content.includes('company')) topics.add('business');
      if (content.includes('analysis') || content.includes('analyze')) topics.add('analysis');
      if (content.includes('document') || content.includes('file')) topics.add('documents');
      if (content.includes('image') || content.includes('screenshot')) topics.add('images');
      if (content.includes('help') || content.includes('assist')) topics.add('assistance');
      
      // Keep important short messages
      if (msg.content.length < 100 && msg.content.includes('?')) {
        keyPoints.push(msg.content.substring(0, 80));
      }
    });

    const topicList = Array.from(topics).join(', ');
    const summary = `Discussed topics: ${topicList || 'general conversation'}. ${keyPoints.length > 0 ? `Key questions: ${keyPoints.slice(0, 2).join('; ')}` : ''}`;
    
    return summary.length > 200 ? summary.substring(0, 197) + '...' : summary;
  }

  /**
   * Format messages for Gemini API
   */
  private formatMessages(messages: ConversationMessage[]): unknown[] {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(messages: ConversationMessage[]): number {
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 4); // Rough estimate: 4 chars per token
  }

  /**
   * Create hash for content caching
   */
  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.conversationCache.forEach((value, key) => {
      if (now - value.timestamp > 1800000) { // 30 minutes
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.conversationCache.delete(key);
    });

    // Action logged
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { conversationEntries: number, systemPromptEntries: number, totalMemoryKB: number } {
    const conversationSize = JSON.stringify([...this.conversationCache.entries()]).length;
    const systemPromptSize = JSON.stringify([...this.systemPromptCache.entries()]).length;
    
    return {
      conversationEntries: this.conversationCache.size,
      systemPromptEntries: this.systemPromptCache.size,
      totalMemoryKB: Math.round((conversationSize + systemPromptSize) / 1024)
    };
  }

  /**
   * Clear all cache entries
   */
  clearAllCache(): void {
    this.conversationCache.clear();
    this.systemPromptCache.clear();
    // Action logged
  }
}

// Convenience functions
export const geminiConfig = GeminiConfigEnhanced.getInstance();

export const createOptimizedConfig = (
  feature: 'chat' | 'analysis' | 'document' | 'live' | 'research' | 'text_generation' | 'document_analysis',
  customLimits?: Partial<EnhancedGenerationConfig>
) => {
  const personaFun = (process.env.PERSONALITY || process.env.PERSONA || '').toLowerCase() === 'farzad' || process.env.PERSONA_FUN === 'true'
  const limits = { ...customLimits }
  const leadAggressive = (process.env.LEAD_MODE || '').toLowerCase() === 'aggressive'
  const hardCap = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || process.env.NEXT_PUBLIC_GEMINI_MAX_OUTPUT_TOKENS || '')
  const cap = Number.isFinite(hardCap) && hardCap > 0 ? Math.max(64, Math.min(4096, hardCap)) : undefined
  if (personaFun && !leadAggressive) {
    // Slightly increase temperature for a more human, lively tone, but keep within 0.95
    const baseTemp = limits.temperature ?? 0.7
    limits.temperature = Math.min(0.95, baseTemp + 0.15)
  }
  if (leadAggressive) {
    // Tighter, crisper output for lead-gen—lower temp and cap tokens if not set
    const baseTemp = limits.temperature ?? 0.7
    limits.temperature = Math.max(0.5, Math.min(baseTemp, 0.65))
    limits.maxOutputTokens = Math.min(1024, limits.maxOutputTokens ?? 1024)
  }
  if (cap) {
    // Enforce global cap as a floor across features
    if (!limits.maxOutputTokens) limits.maxOutputTokens = cap
    else limits.maxOutputTokens = Math.min(limits.maxOutputTokens, cap)
  }
  return geminiConfig.createGenerationConfig(feature, limits);
};

export const optimizeConversation = (messages: ConversationMessage[], systemPrompt: string, sessionId: string, maxHistoryTokens?: number) => {
  return geminiConfig.optimizeConversation(messages, systemPrompt, sessionId, maxHistoryTokens);
};