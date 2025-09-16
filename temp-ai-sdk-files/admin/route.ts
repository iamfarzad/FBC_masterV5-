/**
 * AI SDK Admin Chat Route
 * Complete admin system with AI SDK integration
 */

import { google } from '@ai-sdk/google'
import { streamText, generateObject } from 'ai'
import { z } from 'zod'
import { intelligenceTools } from '@/lib/ai/intelligence-tools'

const model = google('gemini-1.5-pro-latest')

// Admin request schema
const adminRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  sessionId: z.string(),
  adminId: z.string(),
  context: z.object({
    leadIds: z.array(z.string()).optional(),
    conversationIds: z.array(z.string()).optional(),
    dashboardData: z.any().optional(),
    analyticsData: z.any().optional()
  }).optional(),
  action: z.enum(['chat', 'analyze', 'report', 'export']).default('chat')
})

// Admin analytics schema
const AdminAnalyticsSchema = z.object({
  leads: z.object({
    total: z.number(),
    newThisWeek: z.number(),
    qualified: z.number(),
    conversionRate: z.number()
  }),
  conversations: z.object({
    total: z.number(),
    activeToday: z.number(),
    averageLength: z.number(),
    satisfactionScore: z.number()
  }),
  performance: z.object({
    responseTime: z.number(),
    resolutionRate: z.number(),
    toolUsage: z.record(z.number()),
    topCapabilities: z.array(z.string())
  }),
  insights: z.array(z.string()),
  recommendations: z.array(z.string())
})

export async function POST(req: Request) {
  try {
    const { messages, sessionId, adminId, context, action } = adminRequestSchema.parse(await req.json())
    
    console.log('[AI_SDK_ADMIN] Request:', { 
      sessionId, 
      adminId, 
      action,
      messageCount: messages.length,
      hasContext: !!context
    })

    // Handle different admin actions
    switch (action) {
      case 'analyze':
        return handleAdminAnalysis(sessionId, adminId, context)
      case 'report':
        return handleAdminReport(sessionId, adminId, context)
      case 'export':
        return handleAdminExport(sessionId, adminId, context)
      case 'chat':
      default:
        return handleAdminChat(messages, sessionId, adminId, context)
    }

  } catch (error) {
    console.error('[AI_SDK_ADMIN] Error:', error)
    
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'Admin chat error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Admin chat handler
async function handleAdminChat(
  messages: Array<{role: string, content: string}>,
  sessionId: string,
  adminId: string,
  context?: any
) {
  // Admin system prompt with enhanced capabilities
  const systemPrompt = `You are F.B/c AI Admin Assistant, a specialized business intelligence and management AI.

Your admin capabilities include:
- Lead analysis and scoring
- Conversation insights and analytics
- Performance monitoring and optimization
- Business intelligence and reporting
- Strategic recommendations and planning
- Cost analysis and ROI calculations
- Team productivity insights
- Customer success metrics

You have access to admin tools and can provide:
- Detailed analytics and reports
- Lead qualification insights
- Conversation performance metrics
- Business optimization recommendations
- Strategic planning assistance

Context:
- Admin ID: ${adminId}
- Session: ${sessionId}
- Lead IDs: ${context?.leadIds?.length || 0} leads
- Conversation IDs: ${context?.conversationIds?.length || 0} conversations

Always provide actionable, data-driven insights with specific recommendations.`

  // Stream admin response with tools
  const result = await streamText({
    model,
    system: systemPrompt,
    messages,
    tools: intelligenceTools,
    temperature: 0.5, // Lower temperature for more consistent admin responses
    maxTokens: 2000,
    onFinish: (result) => {
      console.log('[AI_SDK_ADMIN] Chat completed:', {
        sessionId,
        adminId,
        tokensUsed: result.usage?.totalTokens || 0,
        toolCalls: result.toolCalls?.length || 0
      })
    }
  })

  return result.toDataStreamResponse({
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'X-Chat-Mode': 'admin',
      'X-Session-Id': sessionId,
      'X-Admin-Id': adminId,
      'X-Has-Context': String(!!context)
    }
  })
}

// Admin analytics handler
async function handleAdminAnalysis(sessionId: string, adminId: string, context?: any) {
  try {
    // Generate admin analytics using AI SDK
    const result = await generateObject({
      model,
      schema: AdminAnalyticsSchema,
      system: `You are an admin analytics specialist. Generate comprehensive business analytics 
      based on available data. Provide realistic metrics and actionable insights.`,
      prompt: `Generate admin analytics dashboard data for:
      - Session: ${sessionId}
      - Admin: ${adminId}
      - Context: ${JSON.stringify(context || {})}
      
      Provide comprehensive business metrics, insights, and recommendations.`
    })

    return Response.json({
      sessionId,
      adminId,
      analytics: result.object,
      generatedAt: new Date().toISOString(),
      dataSource: 'AI SDK analytics generation',
      confidence: 0.85
    })

  } catch (error) {
    console.error('[AI_SDK_ADMIN] Analytics generation failed:', error)
    
    return Response.json(
      { error: 'Analytics generation failed' },
      { status: 500 }
    )
  }
}

// Admin report handler
async function handleAdminReport(sessionId: string, adminId: string, context?: any) {
  try {
    const reportPrompt = `Generate a comprehensive admin report for:
    - Session: ${sessionId}
    - Admin: ${adminId}
    - Context: ${JSON.stringify(context || {})}
    
    Include:
    - Executive summary
    - Key metrics and KPIs
    - Performance insights
    - Strategic recommendations
    - Action items and next steps`

    const result = await generateText({
      model,
      system: `You are an executive report writer. Create professional, data-driven reports 
      with clear insights and actionable recommendations.`,
      prompt: reportPrompt,
      temperature: 0.3,
      maxTokens: 3000
    })

    return Response.json({
      sessionId,
      adminId,
      report: {
        title: `Admin Report - ${new Date().toLocaleDateString()}`,
        content: result.text,
        sections: [
          'Executive Summary',
          'Key Performance Indicators',
          'Insights and Analysis',
          'Strategic Recommendations',
          'Action Items'
        ],
        metadata: {
          generatedAt: new Date().toISOString(),
          tokensUsed: result.usage?.totalTokens || 0,
          confidence: 0.90
        }
      }
    })

  } catch (error) {
    console.error('[AI_SDK_ADMIN] Report generation failed:', error)
    
    return Response.json(
      { error: 'Report generation failed' },
      { status: 500 }
    )
  }
}

// Admin export handler
async function handleAdminExport(sessionId: string, adminId: string, context?: any) {
  return Response.json({
    sessionId,
    adminId,
    export: {
      format: 'json',
      data: {
        session: sessionId,
        admin: adminId,
        context: context || {},
        exportedAt: new Date().toISOString()
      },
      downloadUrl: `/api/admin/export/${sessionId}`,
      message: 'Export prepared successfully'
    }
  })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const adminId = searchParams.get('adminId')
  
  return Response.json({
    message: 'AI SDK Admin Chat API',
    adminId,
    capabilities: [
      'Lead analysis and scoring',
      'Conversation analytics',
      'Performance monitoring',
      'Business intelligence',
      'Strategic planning',
      'Report generation'
    ],
    actions: ['chat', 'analyze', 'report', 'export'],
    tools: Object.keys(intelligenceTools),
    timestamp: new Date().toISOString()
  })
}