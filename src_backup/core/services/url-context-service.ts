import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../config'

interface URLMetadata {
  title?: string
  description?: string
  image?: string
  type?: string
  content?: string
  error?: string
}

export class URLContextService {
  private genAI: GoogleGenerativeAI | null = null

  constructor() {
    if (config.ai.gemini.apiKey) {
      this.genAI = new GoogleGenerativeAI(config.ai.gemini.apiKey)
    }
  }

  async extractMetadata(url: string): Promise<URLMetadata> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; F.B/c Bot/1.0)'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }

      const html = await response.text()
      
      // Extract metadata using regex
      const titleMatch = html.match(/<title>(.*?)<\/title>/i)
      const descMatch = html.match(/<meta name="description" content="(.*?)"/i)
      const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/i)
      
      // Extract main content
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      let content = ''
      
      if (bodyMatch) {
        // Strip HTML tags and clean content
        content = bodyMatch[1]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 5000) // Limit content length
      }

      return {
        title: titleMatch?.[1] || '',
        description: descMatch?.[1] || '',
        image: imageMatch?.[1] || '',
        content
      }
    } catch (error) {
      console.error('URL extraction error:', error)
      return {
        error: error instanceof Error ? error.message : 'Failed to extract URL metadata'
      }
    }
  }

  async analyzeURL(url: string, query?: string): Promise<string> {
    const metadata = await this.extractMetadata(url)
    
    if (metadata.error) {
      return `Unable to analyze URL: ${metadata.error}`
    }

    if (this.genAI) {
      const model = this.genAI.getGenerativeModel({ model: config.ai.gemini.model })
      
      const prompt = query 
        ? `Analyze this webpage content and answer: ${query}\n\nTitle: ${metadata.title}\nDescription: ${metadata.description}\nContent: ${metadata.content}`
        : `Summarize this webpage:\nTitle: ${metadata.title}\nDescription: ${metadata.description}\nContent: ${metadata.content}`
      
      const result = await model.generateContent(prompt)
      return result.response.text()
    }

    // Fallback summary without AI
    return `
Title: ${metadata.title}
Description: ${metadata.description}
Content Preview: ${metadata.content?.slice(0, 500)}...
    `.trim()
  }
}

export const urlContextService = new URLContextService()