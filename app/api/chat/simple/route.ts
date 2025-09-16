/**
 * Simple AI SDK Chat Route
 * Demonstrates clean AI SDK implementation
 */

import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

const model = google('gemini-1.5-flash-latest')

export async function POST(req: Request) {
  try {
    const { messages, sessionId, mode = 'standard' } = await req.json()
    
    console.log('[SIMPLE_AI_SDK] Request:', { sessionId, mode, messageCount: messages.length })

    // Simple system prompt
    const systemPrompt = mode === 'admin' 
      ? "You are F.B/c AI Admin Assistant. Provide concise, actionable business insights."
      : "You are F.B/c AI, a helpful business assistant."

    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content || 'Hello'

    // Generate response
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: lastMessage,
      temperature: 0.7,
      maxTokens: 1000
    })

    console.log('[SIMPLE_AI_SDK] Response generated:', {
      sessionId,
      tokens: result.usage?.totalTokens || 0,
      finishReason: result.finishReason
    })

    // Return simple JSON response
    return Response.json({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: result.text,
      timestamp: new Date().toISOString(),
      mode,
      sessionId,
      usage: result.usage
    })

  } catch (error) {
    console.error('[SIMPLE_AI_SDK] Error:', error)
    
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'AI SDK error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}