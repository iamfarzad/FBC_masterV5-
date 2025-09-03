import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '@/src/core/config'

// Initialize Gemini
const genAI = config.ai.gemini.apiKey 
  ? new GoogleGenerativeAI(config.ai.gemini.apiKey)
  : null

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    // Mock mode for development
    if (config.features.mockMode || !genAI) {
      const mockResponse = generateMockResponse(messages[messages.length - 1].content)
      return NextResponse.json({ 
        message: mockResponse,
        content: mockResponse 
      })
    }

    // Use Gemini API
    const model = genAI.getGenerativeModel({ 
      model: config.ai.gemini.model,
      generationConfig: {
        maxOutputTokens: config.ai.gemini.maxTokens,
        temperature: config.ai.gemini.temperature,
      }
    })

    const lastMessage = messages[messages.length - 1].content
    const result = await model.generateContent(lastMessage)
    const response = result.response.text()

    return NextResponse.json({
      message: response,
      content: response
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Fallback to mock response on error
    const mockResponse = 'I understand your request. Let me help you with that.'
    return NextResponse.json({
      message: mockResponse,
      content: mockResponse
    })
  }
}

function generateMockResponse(input: string): string {
  const responses = [
    'I understand your request. Let me help you with that.',
    'That\'s an interesting question. Here\'s what I think...',
    'Based on your input, I can provide the following insights...',
    'Let me analyze this for you...',
    'Here\'s a comprehensive response to your query...',
  ]
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)]
  return `${randomResponse}\n\nYou asked: "${input}"\n\nThis is a mock response while in development mode.`
}