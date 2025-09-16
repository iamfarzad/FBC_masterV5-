/**
 * AI SDK Intelligent Chat Route
 * Complete integration of AI SDK with intelligence system
 */

import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { z } from 'zod'
import { intelligenceTools } from '@/lib/ai/intelligence-tools'
import { intelligenceService, contextStorage } from '@/lib/ai/intelligence-context'

const model = google('gemini-1.5-pro-latest')

// Enhanced request schema
const intelligentChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  sessionId: z.string(),
  mode: z.enum(['standard', 'admin', 'realtime', 'multimodal']).default('standard'),
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
  }).optional(),
  enableIntelligence: z.boolean().default(true),
  enableTools: z.boolean().default(true)
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      messages, 
      sessionId, 
      mode, 
      context, 
      enableIntelligence,
      enableTools 
    } = intelligentChatRequestSchema.parse(body)

    console.log('[AI_SDK_INTELLIGENT] Request:', { 
      sessionId, 
      mode, 
      messageCount: messages.length,
      enableIntelligence,
      enableTools
    })

    // 1. Analyze conversation for intelligence context
    let intelligenceContext = null
    if (enableIntelligence) {
      try {
        intelligenceContext = await contextStorage.analyze(sessionId, messages)
        console.log('[AI_SDK_INTELLIGENT] Intelligence analysis:', {
          hasLead: !!intelligenceContext.lead,
          hasCompany: !!intelligenceContext.company,
          hasPerson: !!intelligenceContext.person,
          hasIntent: !!intelligenceContext.intent
        })
      } catch (error) {
        console.warn('[AI_SDK_INTELLIGENT] Intelligence analysis failed:', error)
      }
    }

    // 2. Generate personalized system prompt
    let systemPrompt = `You are F.B/c AI, a specialized business automation and AI consultant.

Your expertise includes:
- Business process automation and optimization
- AI implementation strategies and ROI analysis
- Lead generation and conversion optimization
- Technical architecture and integration planning
- Financial modeling and investment analysis

You have access to powerful tools for research, calculations, and analysis.
Always be helpful, professional, and focus on providing actionable business value.`

    if (intelligenceContext) {
      try {
        systemPrompt = await intelligenceService.generatePersonalizedPrompt(intelligenceContext)
      } catch (error) {
        console.warn('[AI_SDK_INTELLIGENT] Prompt personalization failed:', error)
      }
    }

    // 3. Add intelligence context to system prompt
    if (intelligenceContext && (intelligenceContext.lead || intelligenceContext.company)) {
      systemPrompt += '\n\nCONTEXT ABOUT THIS USER:\n'
      
      if (intelligenceContext.lead) {
        systemPrompt += `- Name: ${intelligenceContext.lead.name}\n`
        systemPrompt += `- Email: ${intelligenceContext.lead.email}\n`
        if (intelligenceContext.lead.role) {
          systemPrompt += `- Role: ${intelligenceContext.lead.role}\n`
        }
      }
      
      if (intelligenceContext.company) {
        systemPrompt += `- Company: ${intelligenceContext.company.name}\n`
        if (intelligenceContext.company.industry) {
          systemPrompt += `- Industry: ${intelligenceContext.company.industry}\n`
        }
        if (intelligenceContext.company.size) {
          systemPrompt += `- Company Size: ${intelligenceContext.company.size}\n`
        }
      }
      
      if (intelligenceContext.intent) {
        systemPrompt += `- Primary Intent: ${intelligenceContext.intent.primary}\n`
        systemPrompt += `- Urgency: ${intelligenceContext.intent.urgency}\n`
      }
    }

    // 4. Add capability awareness
    if (enableTools) {
      systemPrompt += `\n\nYOU HAVE ACCESS TO THESE TOOLS:
- roiCalculator: Calculate ROI, payback periods, and financial projections
- webSearch: Search for current information and research
- leadResearch: Research companies and contacts using email/domain
- documentAnalysis: Analyze uploaded documents and files
- videoToApp: Convert videos into interactive app blueprints
- urlAnalysis: Analyze websites for business insights
- meetingScheduler: Schedule consultations and meetings
- businessCalculator: Perform complex business calculations

When users ask about these topics, proactively suggest and use the relevant tools!`
    }

    // 5. Stream response with AI SDK
    const result = await streamText({
      model,
      system: systemPrompt,
      messages,
      tools: enableTools ? intelligenceTools : undefined,
      temperature: 0.7,
      maxRetries: 3,
      onFinish: async (result) => {
        console.log('[AI_SDK_INTELLIGENT] Response completed:', {
          sessionId,
          mode,
          tokensUsed: result.usage?.totalTokens || 0,
          finishReason: result.finishReason,
          toolCalls: result.toolCalls?.length || 0
        })

        // Update intelligence context based on conversation
        if (enableIntelligence && result.text) {
          try {
            const updatedMessages = [...messages, { role: 'assistant', content: result.text }]
            await contextStorage.analyze(sessionId, updatedMessages)
          } catch (error) {
            console.warn('[AI_SDK_INTELLIGENT] Context update failed:', error)
          }
        }
      }
    })

    // 6. Return streaming response
    return result.toDataStreamResponse({
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'X-Chat-Mode': mode,
        'X-Session-Id': sessionId,
        'X-Intelligence-Enabled': String(enableIntelligence),
        'X-Tools-Enabled': String(enableTools),
        'X-Has-Context': String(!!intelligenceContext)
      }
    })

  } catch (error) {
    console.error('[AI_SDK_INTELLIGENT] Error:', error)
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'AI SDK intelligent chat error',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  
  if (!sessionId) {
    return Response.json({ error: 'sessionId required' }, { status: 400 })
  }
  
  try {
    // Get intelligence context for session
    const context = await contextStorage.retrieve(sessionId)
    
    // Get suggested next actions
    const actions = context 
      ? await intelligenceService.suggestNextActions(context)
      : []
    
    return Response.json({
      sessionId,
      context,
      suggestedActions: actions,
      capabilities: Object.keys(intelligenceTools),
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[AI_SDK_INTELLIGENT] Context retrieval error:', error)
    
    return Response.json({
      error: error instanceof Error ? error.message : 'Context retrieval failed',
      sessionId,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}