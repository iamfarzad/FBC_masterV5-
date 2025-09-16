/**
 * AI SDK Chat API Route
 * Clean, standardized implementation using AI SDK
 */

import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { z } from 'zod'

// AI SDK model configuration
const model = google('gemini-1.5-pro-latest')

// Request schema
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  sessionId: z.string().optional(),
  mode: z.enum(['standard', 'realtime', 'admin', 'multimodal']).default('standard'),
  context: z.object({
    sessionId: z.string().optional(),
    leadContext: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      company: z.string().optional(),
      role: z.string().optional()
    }).optional(),
    intelligenceContext: z.any().optional(),
    conversationIds: z.array(z.string()).optional(),
    adminId: z.string().optional(),
    multimodalData: z.any().optional()
  }).optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, sessionId, mode, context } = chatRequestSchema.parse(body)

    // Build system prompt with context
    let systemPrompt = "You are F.B/c AI, a helpful and intelligent business assistant."
    
    if (mode === 'admin') {
      systemPrompt = `You are F.B/c AI Admin Assistant, a specialized business intelligence and management AI.

Your capabilities:
- Analyze lead data and provide actionable insights
- Draft professional emails for campaigns and follow-ups
- Suggest meeting scheduling strategies and optimizations
- Interpret analytics and performance metrics
- Provide business recommendations based on data
- Help with lead scoring and prioritization
- Monitor system health and performance
- Assist with cost optimization and budget management

Response Style:
- Be concise, actionable, and data-driven
- Provide specific recommendations with rationale
- Use available context to support your suggestions
- Suggest next steps and priorities
- Maintain professional, business-focused tone`
    }

    // Add intelligence context to system prompt
    if (context?.intelligenceContext) {
      const intCtx = context.intelligenceContext
      let intelligenceData = '\n\nPERSONALIZED CONTEXT:\n'
      
      if (intCtx.lead) {
        intelligenceData += `User: ${intCtx.lead.name} (${intCtx.lead.email})\n`
      }
      
      if (intCtx.company) {
        intelligenceData += `Company: ${intCtx.company.name || 'Unknown'}\n`
        if (intCtx.company.industry) intelligenceData += `Industry: ${intCtx.company.industry}\n`
        if (intCtx.company.size) intelligenceData += `Size: ${intCtx.company.size}\n`
        if (intCtx.company.summary) intelligenceData += `Background: ${intCtx.company.summary}\n`
      }
      
      if (intCtx.person) {
        if (intCtx.person.role) intelligenceData += `Role: ${intCtx.person.role}\n`
        if (intCtx.person.seniority) intelligenceData += `Seniority: ${intCtx.person.seniority}\n`
      }
      
      if (intCtx.role && intCtx.roleConfidence) {
        intelligenceData += `Detected Role: ${intCtx.role} (${Math.round(intCtx.roleConfidence * 100)}% confidence)\n`
      }

      systemPrompt += intelligenceData
    }

    // Stream the response using AI SDK
    const result = await streamText({
      model,
      system: systemPrompt,
      messages,
      temperature: 0.7,
      onFinish: (result) => {
        console.log('[AI_SDK] Chat completed:', {
          sessionId,
          mode,
          tokensUsed: result.usage?.totalTokens || 0,
          finishReason: result.finishReason
        })
      }
    })

    // Return streaming response
    return result.toAIStreamResponse({
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'X-Chat-Mode': mode,
        'X-Session-Id': sessionId || 'anonymous'
      }
    })

  } catch (error) {
    console.error('[AI_SDK] Chat error:', error)
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export async function GET() {
  return Response.json({
    message: 'AI SDK Chat API',
    status: 'operational',
    provider: 'ai-sdk',
    model: 'gemini-1.5-pro-latest',
    timestamp: new Date().toISOString()
  })
}