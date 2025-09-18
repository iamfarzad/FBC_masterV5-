/**
 * Unified Chat API Endpoint - AI SDK Backend
 * Connects your existing pipeline to AI SDK Tools
 */

import { NextRequest, NextResponse } from 'next/server'
import { google, createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText, generateText, tool } from 'ai'

// AI SDK model
const geminiApiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY

const geminiProvider = createGoogleGenerativeAI(
  geminiApiKey ? { apiKey: geminiApiKey } : undefined,
)

const model = geminiProvider(
  process.env.GEMINI_TEXT_MODEL ||
    process.env.NEXT_PUBLIC_GEMINI_TEXT_MODEL ||
    'gemini-2.5-flash',
)

// AI SDK Tools for enhanced functionality
const tools = {
  analyzeLead: tool({
    description: 'Analyze lead data and provide insights',
    parameters: {
      leadId: { type: 'string', description: 'Lead identifier' },
      analysisType: { 
        type: 'string', 
        enum: ['scoring', 'prioritization', 'next-steps', 'risk-assessment'],
        description: 'Type of analysis to perform'
      },
      context: { type: 'string', description: 'Additional context for analysis' }
    },
    execute: async ({ leadId, analysisType, context }) => {
      // Simulate lead analysis
      return {
        leadId,
        analysisType,
        score: Math.floor(Math.random() * 100),
        insights: [
          'High engagement with product demos',
          'Decision maker identified',
          'Budget confirmed for Q2'
        ],
        recommendations: [
          'Schedule technical deep-dive',
          'Prepare ROI calculator',
          'Engage with procurement team'
        ],
        nextSteps: [
          'Send technical documentation',
          'Schedule follow-up meeting',
          'Prepare proposal'
        ]
      }
    }
  }),

  draftEmail: tool({
    description: 'Draft professional emails for business communication',
    parameters: {
      recipient: { type: 'string', description: 'Email recipient' },
      purpose: { 
        type: 'string', 
        enum: ['follow-up', 'proposal', 'meeting-request', 'status-update'],
        description: 'Purpose of the email'
      },
      tone: { 
        type: 'string', 
        enum: ['professional', 'friendly', 'urgent', 'casual'],
        description: 'Tone of the email'
      },
      keyPoints: { type: 'array', items: { type: 'string' }, description: 'Key points to include' }
    },
    execute: async ({ recipient, purpose, tone, keyPoints }) => {
      // Simulate email drafting
      const templates = {
        'follow-up': `Hi ${recipient},\n\nThank you for your interest in our solution. I wanted to follow up on our conversation and provide additional information.\n\nKey points:\n${keyPoints?.map(point => `• ${point}`).join('\n')}\n\nBest regards`,
        'proposal': `Dear ${recipient},\n\nI'm pleased to present our proposal for your consideration.\n\n${keyPoints?.map(point => `• ${point}`).join('\n')}\n\nI look forward to discussing this further.\n\nBest regards`,
        'meeting-request': `Hi ${recipient},\n\nI'd like to schedule a meeting to discuss ${keyPoints?.[0] || 'our proposal'}.\n\n${keyPoints?.slice(1).map(point => `• ${point}`).join('\n')}\n\nPlease let me know your availability.\n\nBest regards`,
        'status-update': `Hi ${recipient},\n\nHere's an update on our current status:\n\n${keyPoints?.map(point => `• ${point}`).join('\n')}\n\nPlease let me know if you have any questions.\n\nBest regards`
      }
      
      return {
        subject: `${purpose.charAt(0).toUpperCase() + purpose.slice(1)} - ${recipient}`,
        body: templates[purpose] || templates['follow-up'],
        tone,
        wordCount: templates[purpose]?.split(' ').length || 0
      }
    }
  }),

  generateROI: tool({
    description: 'Generate ROI calculations and projections',
    parameters: {
      investment: { type: 'number', description: 'Initial investment amount' },
      timeframe: { type: 'string', description: 'ROI calculation timeframe' },
      savings: { type: 'array', items: { type: 'number' }, description: 'Expected savings per period' },
      revenue: { type: 'array', items: { type: 'number' }, description: 'Expected revenue per period' }
    },
    execute: async ({ investment, timeframe, savings = [], revenue = [] }) => {
      const totalSavings = savings.reduce((sum, s) => sum + s, 0)
      const totalRevenue = revenue.reduce((sum, r) => sum + r, 0)
      const totalReturn = totalSavings + totalRevenue
      const roi = ((totalReturn - investment) / investment) * 100
      
      return {
        investment,
        timeframe,
        totalSavings,
        totalRevenue,
        totalReturn,
        roi: Math.round(roi * 100) / 100,
        paybackPeriod: investment / (totalReturn / 12), // months
        breakdown: {
          savings: savings,
          revenue: revenue
        }
      }
    }
  }),

  scheduleMeeting: tool({
    description: 'Schedule meetings and manage calendar',
    parameters: {
      attendees: { type: 'array', items: { type: 'string' }, description: 'Meeting attendees' },
      duration: { type: 'number', description: 'Meeting duration in minutes' },
      purpose: { type: 'string', description: 'Meeting purpose' },
      priority: { 
        type: 'string', 
        enum: ['low', 'medium', 'high', 'urgent'],
        description: 'Meeting priority'
      }
    },
    execute: async ({ attendees, duration, purpose, priority }) => {
      // Simulate meeting scheduling
      const meetingId = `meeting_${Date.now()}`
      const suggestedTimes = [
        '2024-01-15T10:00:00Z',
        '2024-01-15T14:00:00Z',
        '2024-01-16T09:00:00Z'
      ]
      
      return {
        meetingId,
        attendees,
        duration,
        purpose,
        priority,
        suggestedTimes,
        status: 'pending',
        calendarLink: `https://calendar.fbc.com/meeting/${meetingId}`
      }
    }
  }),

  analyzeWebcamImage: tool({
    description: 'Analyze webcam images for business insights and context',
    parameters: {
      image: { type: 'string', description: 'Base64 encoded image data' },
      context: { type: 'string', description: 'Additional context for analysis' },
      type: { type: 'string', description: 'Type of analysis (webcam, document, etc.)' }
    },
    execute: async ({ image, context, type }) => {
      try {
        // Call the existing webcam API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tools/webcam`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image,
            context,
            type: type || 'webcam'
          })
        })

        if (!response.ok) {
          throw new Error(`Webcam API error: ${response.status}`)
        }

        const result = await response.json()
        
        return {
          success: result.success || true,
          analysis: result.output?.analysis || 'Analysis completed',
          insights: result.output?.insights || ['Image analyzed'],
          imageSize: result.output?.imageSize || image.length,
          processedAt: result.output?.processedAt || new Date().toISOString(),
          type: result.output?.type || type || 'webcam'
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Analysis failed',
          imageSize: image.length,
          processedAt: new Date().toISOString(),
          type: type || 'webcam'
        }
      }
    }
  }),

  analyzeScreenShare: tool({
    description: 'Analyze screen share images for business insights',
    parameters: {
      image: { type: 'string', description: 'Base64 encoded screen image data' },
      context: { type: 'string', description: 'Additional context for analysis' },
      type: { type: 'string', description: 'Type of analysis (screen, presentation, etc.)' }
    },
    execute: async ({ image, context, type }) => {
      try {
        // Call the existing screen API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tools/screen`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image,
            context,
            type: type || 'screen'
          })
        })

        if (!response.ok) {
          throw new Error(`Screen API error: ${response.status}`)
        }

        const result = await response.json()
        
        return {
          success: result.success || true,
          analysis: result.output?.analysis || 'Analysis completed',
          insights: result.output?.insights || ['Screen analyzed'],
          imageSize: result.output?.imageSize || image.length,
          processedAt: result.output?.processedAt || new Date().toISOString(),
          type: result.output?.type || type || 'screen'
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Analysis failed',
          imageSize: image.length,
          processedAt: new Date().toISOString(),
          type: type || 'screen'
        }
      }
    }
  }),

  searchWeb: tool({
    description: 'Search the web for information and current data',
    parameters: {
      query: { type: 'string', description: 'Search query' },
      urls: { type: 'array', items: { type: 'string' }, description: 'Specific URLs to search' }
    },
    execute: async ({ query, urls }) => {
      try {
        // Call the existing search API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tools/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            urls
          })
        })

        if (!response.ok) {
          throw new Error(`Search API error: ${response.status}`)
        }

        const result = await response.json()
        
        return {
          success: result.ok !== false,
          results: result.results || [],
          query,
          resultCount: result.results?.length || 0,
          processedAt: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Search failed',
          query,
          processedAt: new Date().toISOString()
        }
      }
    }
  }),

  calculateROI: tool({
    description: 'Calculate return on investment with detailed financial analysis',
    parameters: {
      initialInvestment: { type: 'number', description: 'Initial investment amount' },
      monthlyRevenue: { type: 'number', description: 'Monthly revenue' },
      monthlyExpenses: { type: 'number', description: 'Monthly expenses' },
      timePeriod: { type: 'number', description: 'Time period in months' }
    },
    execute: async ({ initialInvestment, monthlyRevenue, monthlyExpenses, timePeriod }) => {
      try {
        // Call the existing ROI API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tools/roi`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initialInvestment,
            monthlyRevenue,
            monthlyExpenses,
            timePeriod
          })
        })

        if (!response.ok) {
          throw new Error(`ROI API error: ${response.status}`)
        }

        const result = await response.json()
        
        return {
          success: result.success !== false,
          roi: result.output?.roi || 0,
          paybackPeriod: result.output?.paybackPeriod || 0,
          netProfit: result.output?.netProfit || 0,
          processedAt: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'ROI calculation failed',
          processedAt: new Date().toISOString()
        }
      }
    }
  }),

  analyzeDocument: tool({
    description: 'Analyze documents and PDFs for business insights',
    parameters: {
      documentData: { type: 'string', description: 'Base64 encoded document data' },
      fileName: { type: 'string', description: 'Document file name' },
      mimeType: { type: 'string', description: 'Document MIME type' }
    },
    execute: async ({ documentData, fileName, mimeType }) => {
      try {
        // Call the existing document API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tools/doc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentData,
            fileName,
            mimeType
          })
        })

        if (!response.ok) {
          throw new Error(`Document API error: ${response.status}`)
        }

        const result = await response.json()
        
        return {
          success: result.success !== false,
          analysis: result.output?.analysis || 'Document analyzed',
          insights: result.output?.insights || ['Document processed'],
          fileName,
          processedAt: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Document analysis failed',
          fileName,
          processedAt: new Date().toISOString()
        }
      }
    }
  }),

  analyzeURL: tool({
    description: 'Analyze web URLs and extract content for business insights',
    parameters: {
      url: { type: 'string', description: 'URL to analyze' }
    },
    execute: async ({ url }) => {
      try {
        // Call the existing URL API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tools/url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url
          })
        })

        if (!response.ok) {
          throw new Error(`URL API error: ${response.status}`)
        }

        const result = await response.json()
        
        return {
          success: result.success !== false,
          title: result.output?.title || '',
          content: result.output?.content || '',
          url,
          processedAt: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'URL analysis failed',
          url,
          processedAt: new Date().toISOString()
        }
      }
    }
  })
}

// Node.js runtime for streaming compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/**
 * Unified POST handler - AI SDK backend
 */
export async function POST(req: NextRequest) {
  try {
    const reqId = req.headers.get('x-request-id') || crypto.randomUUID()
    const startTime = Date.now()
    console.log('[UNIFIED_AI_SDK] Request:', reqId)

    const body = await req.json()
    const { messages, context, mode = 'standard', stream = true } = body

    // Build system prompt based on mode and context
    let systemPrompt = "You are F.B/c AI, a helpful business assistant."
    
    if (mode === 'admin') {
      systemPrompt = `You are F.B/c AI Admin Assistant, specialized in business intelligence and management.
      
Your capabilities:
- Analyze lead data and provide actionable insights
- Draft professional emails for campaigns
- Suggest meeting scheduling strategies
- Interpret analytics and performance metrics
- Provide business recommendations based on data
- Help with lead scoring and prioritization

Response style: Be concise, actionable, and data-driven.`
    }

    // Add intelligence context if available
    if (context?.intelligenceContext) {
      const intCtx = context.intelligenceContext
      let contextData = '\n\nPERSONALIZED CONTEXT:\n'
      
      if (intCtx.lead) {
        contextData += `User: ${intCtx.lead.name} (${intCtx.lead.email})\n`
      }
      
      if (intCtx.company) {
        contextData += `Company: ${intCtx.company.name || 'Unknown'}\n`
        if (intCtx.company.industry) contextData += `Industry: ${intCtx.company.industry}\n`
        if (intCtx.company.size) contextData += `Size: ${intCtx.company.size}\n`
      }
      
      if (intCtx.person) {
        if (intCtx.person.role) contextData += `Role: ${intCtx.person.role}\n`
        if (intCtx.person.seniority) contextData += `Seniority: ${intCtx.person.seniority}\n`
      }

      systemPrompt += contextData
    }

    // Add multimodal context
    if (context?.multimodalData) {
      let multimodalContext = '\n\nMULTIMODAL INPUT:\n'
      
      if (context.multimodalData.audioData) {
        multimodalContext += `Audio input received (${context.multimodalData.audioData.length} bytes)\n`
      }
      
      if (context.multimodalData.imageData) {
        multimodalContext += `Image input received (${context.multimodalData.imageData.length} bytes)\n`
      }
      
      if (context.multimodalData.videoData) {
        multimodalContext += `Video input received\n`
      }

      systemPrompt += multimodalContext
    }

    // Convert messages to AI SDK format
    const aiMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : msg.role,
      content: msg.content
    }))

    // Handle streaming vs non-streaming
    if (stream !== false) {
      // Streaming response using AI SDK with tools
      const result = await streamText({
        model,
        system: systemPrompt,
        messages: aiMessages,
        tools,
        temperature: 0.7,
        onFinish: (result) => {
          console.log('[UNIFIED_AI_SDK] Completed:', {
            reqId,
            tokensUsed: result.usage?.totalTokens || 0,
            finishReason: result.finishReason,
            toolCalls: result.toolCalls?.length || 0,
            duration: Date.now() - startTime
          })
        }
      })

      // Convert AI SDK stream to your expected SSE format
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send meta event with reqId (for compatibility)
            const metaEvent = `event: meta\ndata: ${JSON.stringify({ reqId, type: 'meta' })}\n\n`
            controller.enqueue(encoder.encode(metaEvent))

            let fullContent = ''
            
            // Stream AI SDK response
            for await (const chunk of result.textStream) {
              fullContent += chunk
              
              // Send as unified message format
              const messageData = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: fullContent,
                timestamp: new Date().toISOString(),
                type: 'text',
                metadata: {
                  mode,
                  isStreaming: true,
                  reqId,
                  suggestions: buildSuggestions(fullContent),
                }
              }
              
              const eventData = `data: ${JSON.stringify(messageData)}\n\n`
              controller.enqueue(encoder.encode(eventData))
            }

            // Send completion event with full AI SDK metadata
            const suggestions = buildSuggestions(fullContent)
            const reasoning = buildReasoning(context, mode)
            const tasks = buildTasks(context)
            const citations = buildCitations(context)
            
            // Extract tool invocations from the result (handle different AI SDK response structures)
            let toolInvocations = []
            if (result.toolCalls && Array.isArray(result.toolCalls)) {
              toolInvocations = result.toolCalls.map(toolCall => ({
                toolCallId: toolCall.toolCallId,
                toolName: toolCall.toolName,
                args: toolCall.args,
                result: toolCall.result,
                state: 'output-available'
              }))
            } else if (result.toolCalls && typeof result.toolCalls === 'object') {
              // Handle case where toolCalls is an object, not array
              toolInvocations = Object.values(result.toolCalls).map(toolCall => ({
                toolCallId: toolCall.toolCallId,
                toolName: toolCall.toolName,
                args: toolCall.args,
                result: toolCall.result,
                state: 'output-available'
              }))
            }

            const completionData = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: fullContent,
              timestamp: new Date().toISOString(),
              type: 'text',
              metadata: {
                mode,
                isComplete: true,
                finalChunk: true,
                reqId,
                reasoning,
                suggestions,
                tasks,
                citations,
                toolInvocations,
                annotations: [
                  ...(reasoning ? [{ type: 'reasoning', content: reasoning }] : []),
                  ...(suggestions?.map(s => ({ type: 'suggestion', content: s })) || []),
                  ...(tasks?.map(t => ({ type: 'task', ...t })) || []),
                  ...(citations?.map(c => ({ type: 'citation', ...c })) || [])
                ]
              }
            }
            
            const completionEvent = `data: ${JSON.stringify(completionData)}\n\n`
            controller.enqueue(encoder.encode(completionEvent))
            
            controller.close()
          } catch (error) {
            console.error('[UNIFIED_AI_SDK] Stream error:', error)
            controller.error(error)
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
          'x-fbc-endpoint': 'unified-ai-sdk',
          'x-request-id': reqId,
          'X-Chat-Mode': mode,
          'X-Session-Id': context?.sessionId || 'anonymous'
        }
      })

    } else {
      // Non-streaming response with tools
      const result = await generateText({
        model,
        system: systemPrompt,
        messages: aiMessages,
        tools,
        temperature: 0.7
      })

      const content = result.text
      const suggestions = buildSuggestions(content)
      const reasoning = buildReasoning(context, mode)
      const tasks = buildTasks(context)
      const citations = buildCitations(context)
      
      // Extract tool invocations from the result (handle different AI SDK response structures)
      let toolInvocations = []
      if (result.toolCalls && Array.isArray(result.toolCalls)) {
        toolInvocations = result.toolCalls.map(toolCall => ({
          toolCallId: toolCall.toolCallId,
          toolName: toolCall.toolName,
          args: toolCall.args,
          result: toolCall.result,
          state: 'output-available'
        }))
      } else if (result.toolCalls && typeof result.toolCalls === 'object') {
        // Handle case where toolCalls is an object, not array
        toolInvocations = Object.values(result.toolCalls).map(toolCall => ({
          toolCallId: toolCall.toolCallId,
          toolName: toolCall.toolName,
          args: toolCall.args,
          result: toolCall.result,
          state: 'output-available'
        }))
      }

      return NextResponse.json({
        id: crypto.randomUUID(),
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
        type: 'text',
        metadata: {
          mode,
          tokensUsed: result.usage?.totalTokens || 0,
          reqId,
          isComplete: true,
          reasoning,
          suggestions,
          tasks,
          citations,
          toolInvocations,
          annotations: [
            ...(reasoning ? [{ type: 'reasoning', content: reasoning }] : []),
            ...(suggestions?.map(s => ({ type: 'suggestion', content: s })) || []),
            ...(tasks?.map(t => ({ type: 'task', ...t })) || []),
            ...(citations?.map(c => ({ type: 'citation', ...c })) || [])
          ]
        }
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'x-fbc-endpoint': 'unified-ai-sdk',
          'x-request-id': reqId
        }
      })
    }

  } catch (error) {
    console.error('[UNIFIED_AI_SDK] Error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Internal server error'

    return new Response(
      JSON.stringify({
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

/**
 * GET handler for capabilities and status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'capabilities':
        return NextResponse.json({
          capabilities: {
            supportsStreaming: true,
            supportsMultimodal: true,
            supportsRealtime: true,
            maxTokens: 8192,
            supportedModes: ['standard', 'realtime', 'admin', 'multimodal']
          },
          provider: 'ai-sdk',
          model: 'gemini-1.5-pro-latest',
          timestamp: new Date().toISOString()
        })

      case 'status':
        return NextResponse.json({
          status: 'operational',
          provider: 'unified-ai-sdk',
          version: '2.0.0',
          backend: 'AI SDK Tools',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          message: 'Unified Chat API - AI SDK Backend',
          endpoints: {
            POST: '/api/chat/unified - Send chat messages (AI SDK)',
            'GET (capabilities)': '/api/chat/unified?action=capabilities',
            'GET (status)': '/api/chat/unified?action=status'
          },
          supportedModes: ['standard', 'realtime', 'admin', 'multimodal'],
          backend: 'AI SDK Tools',
          timestamp: new Date().toISOString()
        })
    }

  } catch (error) {
    console.error('[UNIFIED_AI_SDK] GET error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process request',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function buildSuggestions(content: string): string[] {
  const baseSuggestions = [
    'What else should I explore?',
    'Summarise this for an email.',
    'Outline the next actions.',
  ]

  if (!content) return baseSuggestions

  const lower = content.toLowerCase()
  if (lower.includes('roi')) {
    return [
      'Ask for underlying ROI assumptions.',
      'Request a sensitivity analysis.',
      'Draft a follow-up note to share the ROI findings.',
    ]
  }

  if (lower.includes('lead') || lower.includes('prospect')) {
    return [
      'Prioritise the next lead stage.',
      'Draft a tailored outreach email.',
      'Identify supporting assets for the lead.',
    ]
  }

  return baseSuggestions
}

function buildReasoning(context: unknown, mode: string): string | undefined {
  if (!context || typeof context !== 'object') return undefined
  try {
    const ctx = context as { intelligenceContext?: any }
    const stageLabel = ctx.intelligenceContext?.stage || ctx.intelligenceContext?.currentStage
    if (stageLabel) {
      return `Response tailored for stage ${stageLabel} while running in ${mode} mode.`
    }

    const leadScore = ctx.intelligenceContext?.leadScore
    if (typeof leadScore === 'number') {
      return `Prioritised recommendations for a lead score of ${leadScore}.`
    }
  } catch {
    // swallow malformed context shapes
  }
  return undefined
}

function buildTasks(context: unknown) {
  if (!context || typeof context !== 'object') return undefined
  try {
    const ctx = context as { intelligenceContext?: any }
    const backlog = ctx.intelligenceContext?.capabilities
    if (Array.isArray(backlog) && backlog.length > 0) {
      return [
        {
          id: 'capability-review',
          title: 'Capabilities to validate',
          items: backlog.slice(0, 4).map((cap: any, index: number) => ({
            id: `cap-${index}`,
            title: typeof cap === 'string' ? cap : cap?.name ?? 'Capability',
            description: typeof cap === 'object' ? cap?.description : undefined,
          })),
        },
      ]
    }
  } catch {
    // ignore invalid shapes
  }
  return undefined
}

function buildCitations(context: unknown) {
  if (!context || typeof context !== 'object') return undefined
  try {
    const ctx = context as { intelligenceContext?: any }
    const sources = ctx.intelligenceContext?.sources
    if (Array.isArray(sources) && sources.length > 0) {
      return sources
        .map((source: any, index: number) => {
          if (typeof source === 'string') {
            return { uri: source }
          }
          if (source && typeof source === 'object') {
            const uri = source.url || source.uri
            if (!uri) return null
            return {
              uri,
              title: source.title || undefined,
              description: source.excerpt || source.description || undefined,
            }
          }
          return null
        })
        .filter(Boolean)
    }
  } catch {
    // ignore invalid shapes
  }
  return undefined
}
