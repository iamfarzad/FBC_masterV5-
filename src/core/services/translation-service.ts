import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../config'

interface TranslationOptions {
  source?: string
  target: string
  format?: 'text' | 'html' | 'markdown'
}

export class TranslationService {
  private genAI: GoogleGenerativeAI | null = null
  private cache = new Map<string, string>()

  constructor() {
    if (config.ai.gemini.apiKey) {
      this.genAI = new GoogleGenerativeAI(config.ai.gemini.apiKey)
    }
  }

  async translate(
    text: string,
    options: TranslationOptions
  ): Promise<string> {
    const { source = 'auto', target, format = 'text' } = options
    
    // Check cache
    const cacheKey = `${text}-${source}-${target}-${format}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    if (!this.genAI) {
      // Mock translation for development
      return `[Translated to ${target}]: ${text}`
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: config.ai.gemini.model })
      
      const prompt = `
Translate the following text from ${source === 'auto' ? 'detected language' : source} to ${target}.
Maintain the ${format} formatting if present.
Only provide the translation, no explanations.

Text to translate:
${text}
      `.trim()

      const result = await model.generateContent(prompt)
      const translation = result.response.text()
      
      // Cache the result
      this.cache.set(cacheKey, translation)
      
      return translation
    } catch (error) {
      console.error('Translation error:', error)
      throw new Error('Translation failed')
    }
  }

  async detectLanguage(text: string): Promise<string> {
    if (!this.genAI) {
      return 'en'
    }

    const model = this.genAI.getGenerativeModel({ model: config.ai.gemini.model })
    
    const result = await model.generateContent(
      `Detect the language of this text and return only the ISO 639-1 code (e.g., 'en', 'es', 'fr'): "${text}"`
    )
    
    return result.response.text().trim().toLowerCase()
  }

  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' }
    ]
  }
}

export const translationService = new TranslationService()