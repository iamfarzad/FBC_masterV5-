import { GoogleGenerativeAI } from '@google/generative-ai';

export interface TranslationOptions {
  context?: string;
  preserveTerms?: string[];
  tone?: 'professional' | 'casual' | 'technical';
}

/**
 * Gemini-powered translator using existing AI infrastructure
 * COST: $0 additional (reuses existing Gemini API costs)
 */
export class GeminiTranslator {
  private genAI: GoogleGenerativeAI | null = null;
  private cache = new Map<string, { translation: string; timestamp: number }>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private isAvailable: boolean = false;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!key) {
      console.warn('GeminiTranslator: No API key found - translation features will be disabled');
      this.isAvailable = false;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(key);
      this.isAvailable = true;
      console.log('GeminiTranslator: Initialized successfully');
    } catch (error) {
      console.warn('GeminiTranslator: Failed to initialize:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Generate cache key for translation
   */
  private getCacheKey(text: string, targetLang: string, options?: TranslationOptions): string {
    const context = options?.context || '';
    const terms = options?.preserveTerms?.join(',') || '';
    const tone = options?.tone || 'professional';
    return `${targetLang}:${tone}:${context}:${terms}:${text.slice(0, 100)}`;
  }

  /**
   * Check cache for existing translation
   */
  private getCachedTranslation(text: string, targetLang: string, options?: TranslationOptions): string | null {
    const key = this.getCacheKey(text, targetLang, options);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.translation;
    }

    return null;
  }

  /**
   * Cache translation result
   */
  private setCachedTranslation(text: string, targetLang: string, translation: string, options?: TranslationOptions): void {
    const key = this.getCacheKey(text, targetLang, options);
    this.cache.set(key, { translation, timestamp: Date.now() });

    // Clean up old cache entries (keep cache size manageable)
    if (this.cache.size > 1000) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
  }

  /**
   * Main translation method
   */
  async translate(
    text: string,
    targetLang: string,
    options: TranslationOptions = {}
  ): Promise<string> {
    // Return original text if translator is not available
    if (!this.isAvailable || !this.genAI) {
      console.log('GeminiTranslator: Not available, returning original text');
      return text;
    }

    // Check cache first
    const cached = this.getCachedTranslation(text, targetLang, options);
    if (cached) {
      return cached;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const {
        context = 'AI consulting and business development',
        preserveTerms = ['AI', 'API', 'ROI', 'CRM', 'SaaS', 'F.B/c'],
        tone = 'professional'
      } = options;

      const prompt = `
You are a professional translator specializing in AI and technology content.

TRANSLATE the following text to ${this.getLanguageName(targetLang)}.

CONTEXT: ${context}
TONE: ${tone}
PRESERVE THESE TERMS (do not translate): ${preserveTerms.join(', ')}, OAuth, JWT, SQL, NoSQL, MLOps, API endpoints, webhooks

IMPORTANT RULES:
- Maintain professional business language and appropriate terminology for the target market
- Preserve technical terms, acronyms, and industry jargon
- Keep company names and product names unchanged (especially F.B/c)
- Maintain the original formatting, structure, and line breaks
- Ensure natural, fluent ${this.getLanguageName(targetLang)} text that reads as if originally written in that language
- Use appropriate business terminology and cultural context for the target language
- Maintain consistent terminology throughout the translation
- Return ONLY the translated text, no explanations or metadata

TEXT TO TRANSLATE:
"""
${text}
"""

TRANSLATED TEXT:`;

      const result = await model.generateContent(prompt);
      const translation = result.response.text().trim();

      // Cache the result
      this.setCachedTranslation(text, targetLang, translation, options);

      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      // Return original text if translation fails
      return text;
    }
  }

  /**
   * Translate conversation summaries with AI context
   */
  async translateSummary(summary: string, targetLang: string): Promise<string> {
    return this.translate(summary, targetLang, {
      context: 'AI consulting conversation summary',
      preserveTerms: ['AI', 'API', 'ROI', 'CRM', 'SaaS', 'F.B/c', 'lead', 'prospect', 'conversion'],
      tone: 'professional'
    });
  }

  /**
   * Translate consultant briefs
   */
  async translateBrief(brief: string, targetLang: string): Promise<string> {
    return this.translate(brief, targetLang, {
      context: 'AI consulting strategy and recommendations',
      preserveTerms: ['AI', 'ROI', 'KPIs', 'F.B/c', 'implementation', 'optimization'],
      tone: 'professional'
    });
  }

  /**
   * Batch translate multiple texts
   */
  async translateBatch(
    texts: string[],
    targetLang: string,
    options?: TranslationOptions
  ): Promise<string[]> {
    const results: string[] = [];

    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => this.translate(text, targetLang, options));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Get human-readable language name
   */
  private getLanguageName(code: string): string {
    const languages: Record<string, string> = {
      'en': 'English',
      'no': 'Norwegian',
      'sv': 'Swedish',
      'da': 'Danish',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish',
      'it': 'Italian',
      'pt': 'Portuguese',
      'nl': 'Dutch'
    };
    return languages[code] || code;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // Would need to track hits/misses for accurate rate
    };
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const geminiTranslator = new GeminiTranslator();

