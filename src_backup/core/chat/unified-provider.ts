import { config } from '../config'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export class UnifiedChatProvider {
  private genAI: GoogleGenerativeAI | null = null
  
  constructor() {
    if (config.ai.gemini.apiKey) {
      this.genAI = new GoogleGenerativeAI(config.ai.gemini.apiKey)
    }
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}) {
    if (config.features.mockMode || !this.genAI) {
      return this.mockChat(messages, options)
    }

    const model = this.genAI.getGenerativeModel({
      model: options.model || config.ai.gemini.model,
      generationConfig: {
        maxOutputTokens: options.maxTokens || config.ai.gemini.maxTokens,
        temperature: options.temperature || config.ai.gemini.temperature,
      }
    })

    const lastMessage = messages[messages.length - 1].content
    
    if (options.stream) {
      const result = await model.generateContentStream(lastMessage)
      return result.stream
    } else {
      const result = await model.generateContent(lastMessage)
      return result.response.text()
    }
  }

  private async mockChat(messages: ChatMessage[], options: ChatOptions) {
    const mockResponse = this.generateMockResponse(messages[messages.length - 1].content)
    
    if (options.stream) {
      return this.createMockStream(mockResponse)
    }
    
    return mockResponse
  }

  private generateMockResponse(input: string): string {
    return `Processing: "${input}"\n\nThis is a development mode response.`
  }

  private createMockStream(text: string) {
    const chunks = text.split(' ')
    let index = 0
    
    return {
      async *[Symbol.asyncIterator]() {
        while (index < chunks.length) {
          yield { text: () => chunks[index++] + ' ' }
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
    }
  }
}