/**
 * UNIFIED CHAT API - Single Source of Truth
 * Combines chat, live audio, tools, and admin functionality
 */

import { NextRequest, NextResponse } from 'next/server'
import { unifiedChatProvider } from '@/src/core/chat/unified-provider'
import { unifiedStreamingService } from '@/src/core/streaming/unified-stream'
import { validateRequest, chatRequestSchema } from '@/src/core/validation'
import { GoogleGenAI } from '@google/genai'
import { multimodalContextManager } from '@/src/core/context/multimodal-context'
import { recordCapabilityUsed } from '@/src/core/context/capabilities'
import { APIErrorHandler, rateLimiter, performanceMonitor } from '@/src/core/api/error-handler'
import { z } from 'zod'

// Edge Function Configuration for optimal performance
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Unified request schema combining all capabilities
const UnifiedChatRequestSchema = z.object({
  // Core chat functionality
  messages: z.array(z.object({
    id: z.string().optional(),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.string().optional(),
    type: z.enum(['text', 'audio', 'image', 'tool_call', 'tool_result']).optional()
  })),
  
  // Chat mode and context
  mode: z.enum(['standard', 'admin', 'live', 'tool']).optional().default('standard'),
  stream: z.boolean().optional().default(true),
  
  // Live audio capabilities
  audio: z.object({
    action: z.enum(['start', 'send', 'end', 'probe']).optional(),
    sessionId: z.string().optional(),
    audioData: z.string().optional(),
    mimeType: z.string().optional()
  }).optional(),
  
  // Image analysis capabilities
  image: z.object({
    data: z.string(),
    type: z.enum(['webcam', 'screen', 'document', 'upload']).optional().default('upload'),
    context: z.string().optional()
  }).optional(),
  
  // Tool execution capabilities
  tool: z.object({
    name: z.enum(['roi', 'translate', 'screen', 'webcam', 'doc']),
    params: z.record(z.any())
  }).optional(),
  
  // Context and session management
  context: z.object({
    sessionId: z.string().optional(),
    leadContext: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      company: z.string().optional(),
      role: z.string().optional()
    }).optional(),
    adminId: z.string().optional(),
    conversationIds: z.array(z.string()).optional(),
    intelligenceContext: z.string().optional()
  }).optional()
})

type UnifiedChatRequest = z.infer<typeof UnifiedChatRequestSchema>

/**
 * Unified POST handler for all chat interactions
 */
export async function POST(req: NextRequest) {
  const operationId = `unified-chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  let metrics: any = null
  
  try {
    metrics = performanceMonitor.startOperation(operationId)
  } catch (e) {
    // Fallback if performance monitor not available
    metrics = { end: () => {}, recordError: () => {} }
  }
  
  try {
    // Rate limiting based on request type
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const body = await req.json()
    
    // Validate unified request
    const validation = UnifiedChatRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request format',
        details: validation.error.issues
      }, { status: 400 })
    }
    
    const request = validation.data
    const { messages, mode, stream, audio, image, tool, context } = request
    
    // Apply appropriate rate limiting
    let rateLimitKey = `chat-${clientIP}`
    let rateLimitCount = 60 // default for chat
    
    if (audio?.action) {
      rateLimitKey = `audio-${clientIP}`
      rateLimitCount = 30
    } else if (image) {
      rateLimitKey = `image-${clientIP}`
      rateLimitCount = 20
    } else if (tool) {
      rateLimitKey = `tool-${clientIP}`
      rateLimitCount = 40
    }
    
    const isAllowed = rateLimiter.isAllowed(rateLimitKey, rateLimitCount, 60 * 1000)
    if (!isAllowed) {
      return APIErrorHandler.createErrorResponse({
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many ${mode} requests. Please wait before trying again.`,
        details: `Rate limit exceeded for ${mode} mode`,
        retryable: true,
        statusCode: 429
      })
    }
    
    // Handle different request types
    if (audio?.action) {
      return await handleLiveAudio(audio, context, req)
    }
    
    if (image) {
      return await handleImageAnalysis(image, messages, context, stream)
    }
    
    if (tool) {
      return await handleToolExecution(tool, context)
    }
    
    // Handle standard chat (including admin mode)
    return await handleUnifiedChat(messages, mode, context, stream, req)
    
  } catch (error) {
    console.error('Unified chat API error:', error)
    
    // Record error metrics
    metrics.recordError(error instanceof Error ? error : new Error('Unknown error'))
    
    return APIErrorHandler.createErrorResponse(error)
  } finally {
    if (metrics && typeof metrics.end === 'function') {
      metrics.end()
    }
  }
}

/**
 * Handle live audio interactions
 */
async function handleLiveAudio(
  audio: NonNullable<UnifiedChatRequest['audio']>,
  context?: UnifiedChatRequest['context'],
  req?: NextRequest
) {
  const { action, sessionId, audioData, mimeType } = audio
  
  // Use existing Gemini Live logic but integrate with unified context
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
  }
  
  const genAI = new GoogleGenAI({ apiKey })
  const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-live-2.5-flash-preview-native-audio'
  
  // Implement live audio session management (simplified for unified API)
  switch (action) {
    case 'probe':
      return NextResponse.json({
        available: true,
        capabilities: ['audio', 'text', 'streaming'],
        model: modelName
      })
      
    case 'start':
      // Initialize session with unified context
      const unifiedSessionId = sessionId || `unified-${crypto.randomUUID()}`
      if (context?.sessionId) {
        await multimodalContextManager.initializeSession(unifiedSessionId, context.leadContext)
      }
      
      return NextResponse.json({
        success: true,
        sessionId: unifiedSessionId,
        status: 'started',
        mode: 'live_audio'
      })
      
    default:
      return NextResponse.json({ error: 'Audio action not fully implemented in unified API' }, { status: 501 })
  }
}

/**
 * Handle image analysis
 */
async function handleImageAnalysis(
  image: NonNullable<UnifiedChatRequest['image']>,
  messages: UnifiedChatRequest['messages'],
  context?: UnifiedChatRequest['context'],
  stream = true
) {
  // Create enhanced messages with image
  const enhancedMessages = [
    ...messages,
    {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: image.context || `Analyze this ${image.type || 'image'}`,
      timestamp: new Date().toISOString(),
      type: 'image' as const,
      metadata: {
        imageData: image.data,
        imageType: image.type
      }
    }
  ]
  
  // Use unified provider with image context
  const messageStream = unifiedChatProvider.generate({
    messages: enhancedMessages.map(msg => ({
      id: msg.id || crypto.randomUUID(),
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp || Date.now()),
      type: msg.type || 'text',
      metadata: msg.metadata
    })),
    context: {
      sessionId: context?.sessionId || `image-${crypto.randomUUID()}`,
      leadContext: context?.leadContext
    },
    mode: 'standard'
  })
  
  if (stream) {
    return unifiedStreamingService.createChatStream(messageStream, {
      headers: {
        'X-Chat-Type': 'image-analysis',
        'X-Image-Type': image.type || 'upload'
      }
    })
  }
  
  // Collect response for non-streaming
  const responses = []
  for await (const message of messageStream) {
    responses.push(message)
  }
  
  return NextResponse.json({
    responses,
    mode: 'image_analysis',
    imageType: image.type
  })
}

/**
 * Handle tool execution - Unified tool execution with existing implementations
 */
async function handleToolExecution(
  tool: NonNullable<UnifiedChatRequest['tool']>,
  context?: UnifiedChatRequest['context']
) {
  const { name, params } = tool
  
  // Record capability usage
  if (context?.sessionId) {
    await recordCapabilityUsed(context.sessionId, name, { input: params }).catch(() => {})
  }
  
  // Execute tool based on name using existing implementations
  switch (name) {
    case 'roi': {
      // ROI Calculator - Reuse existing logic
      const z = await import('zod')
      const RoiInputSchema = z.z.object({
        initialInvestment: z.z.number().min(0),
        monthlyRevenue: z.z.number().min(0),
        monthlyExpenses: z.z.number().min(0),
        timePeriod: z.z.number().min(1).max(60)
      })
      
      try {
        const data = RoiInputSchema.parse(params)
        const round = (n: number) => Math.round(n * 100) / 100
        
        const monthlyProfit = data.monthlyRevenue - data.monthlyExpenses
        const totalProfit = monthlyProfit * data.timePeriod
        const totalRevenue = data.monthlyRevenue * data.timePeriod
        const totalExpenses = data.monthlyExpenses * data.timePeriod
        const netProfit = totalProfit - data.initialInvestment
        const roi = ((totalProfit - data.initialInvestment) / Math.max(1, data.initialInvestment)) * 100
        const paybackPeriod = monthlyProfit > 0 ? data.initialInvestment / monthlyProfit : null
        
        const output = {
          roi: round(roi),
          paybackPeriod: paybackPeriod !== null ? round(paybackPeriod) : null,
          initialInvestment: round(data.initialInvestment),
          monthlyRevenue: round(data.monthlyRevenue),
          monthlyExpenses: round(data.monthlyExpenses),
          monthlyProfit: round(monthlyProfit),
          totalRevenue: round(totalRevenue),
          totalExpenses: round(totalExpenses),
          totalProfit: round(totalProfit),
          netProfit: round(netProfit),
          timePeriod: data.timePeriod,
          calculatedAt: new Date().toISOString()
        }
        
        return NextResponse.json({
          success: true,
          tool: 'roi',
          result: output,
          message: 'ROI calculation completed'
        })
      } catch (error) {
        return NextResponse.json({
          error: 'Invalid ROI parameters',
          details: error instanceof Error ? error.message : 'Validation failed'
        }, { status: 400 })
      }
    }
    
    case 'screen': {
      // Screen analysis - Delegate to existing implementation
      if (!params.image) {
        return NextResponse.json({ error: 'Image data required for screen analysis' }, { status: 400 })
      }
      
      try {
        // Use existing screen analysis logic
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
        if (!process.env.GEMINI_API_KEY) {
          return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
        }
        
        // Simplified screen analysis for unified API
        const analysisPrompt = params.context || 'Analyze this screen for business insights'
        const imageData = params.image.startsWith('data:') ? params.image.split(',')[1] : params.image
        
        const { createOptimizedConfig } = await import('@/src/core/gemini-config-enhanced')
        const optimizedConfig = createOptimizedConfig('analysis', { 
          maxOutputTokens: 1024, 
          temperature: 0.3, 
          topP: 0.8 
        })
        
        const result = await genAI.models.generateContent({
          model: 'gemini-1.5-flash',
          config: optimizedConfig,
          contents: [{ 
            role: 'user', 
            parts: [
              { text: analysisPrompt }, 
              { inlineData: { mimeType: 'image/jpeg', data: imageData } }
            ]
          }]
        })
        
        return NextResponse.json({
          success: true,
          tool: 'screen',
          result: {
            analysis: result.response.text(),
            timestamp: new Date().toISOString()
          },
          message: 'Screen analysis completed'
        })
      } catch (error) {
        return NextResponse.json({
          error: 'Screen analysis failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }
    }
    
    case 'webcam': {
      // Webcam analysis - Similar to screen but with different prompt
      if (!params.image) {
        return NextResponse.json({ error: 'Image data required for webcam analysis' }, { status: 400 })
      }
      
      try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
        if (!process.env.GEMINI_API_KEY) {
          return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
        }
        
        const analysisPrompt = params.context || 'Analyze this webcam image for insights'
        const imageData = params.image.startsWith('data:') ? params.image.split(',')[1] : params.image
        
        const { createOptimizedConfig } = await import('@/src/core/gemini-config-enhanced')
        const optimizedConfig = createOptimizedConfig('analysis', { 
          maxOutputTokens: 1024, 
          temperature: 0.3 
        })
        
        const result = await genAI.models.generateContent({
          model: 'gemini-1.5-flash',
          config: optimizedConfig,
          contents: [{ 
            role: 'user', 
            parts: [
              { text: analysisPrompt }, 
              { inlineData: { mimeType: 'image/jpeg', data: imageData } }
            ]
          }]
        })
        
        return NextResponse.json({
          success: true,
          tool: 'webcam',
          result: {
            analysis: result.response.text(),
            timestamp: new Date().toISOString()
          },
          message: 'Webcam analysis completed'
        })
      } catch (error) {
        return NextResponse.json({
          error: 'Webcam analysis failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }
    }
    
    case 'translate': {
      // Translation tool
      if (!params.text || !params.targetLanguage) {
        return NextResponse.json({ 
          error: 'Text and target language required for translation' 
        }, { status: 400 })
      }
      
      try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
        if (!process.env.GEMINI_API_KEY) {
          return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
        }
        
        const prompt = `Translate the following text to ${params.targetLanguage}: "${params.text}"`
        
        const result = await genAI.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        })
        
        return NextResponse.json({
          success: true,
          tool: 'translate',
          result: {
            originalText: params.text,
            translatedText: result.response.text(),
            targetLanguage: params.targetLanguage,
            timestamp: new Date().toISOString()
          },
          message: 'Translation completed'
        })
      } catch (error) {
        return NextResponse.json({
          error: 'Translation failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }
    }
    
    case 'doc': {
      // Document analysis
      if (!params.content && !params.fileUrl) {
        return NextResponse.json({ 
          error: 'Document content or file URL required' 
        }, { status: 400 })
      }
      
      try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
        if (!process.env.GEMINI_API_KEY) {
          return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
        }
        
        const prompt = params.context || 'Analyze this document for key insights and summary'
        const content = params.content || `Document URL: ${params.fileUrl}`
        
        const result = await genAI.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [{ 
            role: 'user', 
            parts: [{ text: `${prompt}\n\nDocument content:\n${content}` }]
          }]
        })
        
        return NextResponse.json({
          success: true,
          tool: 'doc',
          result: {
            analysis: result.response.text(),
            timestamp: new Date().toISOString()
          },
          message: 'Document analysis completed'
        })
      } catch (error) {
        return NextResponse.json({
          error: 'Document analysis failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }
    }
    
    default:
      return NextResponse.json({
        error: `Unknown tool: ${name}`,
        availableTools: ['roi', 'translate', 'screen', 'webcam', 'doc'],
        message: 'Please specify a valid tool name'
      }, { status: 400 })
  }
}

/**
 * Handle unified chat (standard and admin modes)
 */
async function handleUnifiedChat(
  messages: UnifiedChatRequest['messages'],
  mode: UnifiedChatRequest['mode'] = 'standard',
  context?: UnifiedChatRequest['context'],
  stream = true,
  req?: NextRequest
) {
  // Transform messages to unified format
  const unifiedMessages = messages.map(msg => ({
    id: msg.id || crypto.randomUUID(),
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp || Date.now()),
    type: msg.type || 'text' as const,
    metadata: {}
  }))
  
  // Create unified context
  const unifiedContext = {
    sessionId: context?.sessionId || `chat-${crypto.randomUUID()}`,
    leadContext: context?.leadContext,
    adminId: context?.adminId,
    conversationIds: context?.conversationIds,
    intelligenceContext: context?.intelligenceContext
  }
  
  // Generate response using unified provider
  const messageStream = unifiedChatProvider.generate({
    messages: unifiedMessages,
    context: unifiedContext,
    mode: mode as any
  })
  
  if (stream) {
    return unifiedStreamingService.createChatStream(messageStream, {
      headers: {
        'X-Chat-Mode': mode,
        'X-Session-Id': unifiedContext.sessionId,
        'X-Unified-Chat': 'true'
      }
    })
  }
  
  // Collect all messages for non-streaming response
  const responses = []
  for await (const message of messageStream) {
    responses.push(message)
  }
  
  return NextResponse.json({
    responses,
    mode,
    sessionId: unifiedContext.sessionId,
    timestamp: new Date().toISOString()
  })
}

/**
 * GET handler for capabilities and status
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  
  switch (action) {
    case 'capabilities':
      return NextResponse.json({
        capabilities: {
          modes: ['standard', 'admin', 'live', 'tool'],
          features: {
            chat: true,
            streaming: true,
            audio: true,
            image: true,
            tools: ['roi', 'translate', 'screen', 'webcam', 'doc'],
            admin: true
          },
          supportedFormats: {
            text: true,
            audio: ['audio/pcm', 'audio/wav'],
            image: ['image/jpeg', 'image/png', 'image/webp'],
            video: false
          }
        },
        timestamp: new Date().toISOString()
      })
      
    case 'status':
      return NextResponse.json({
        status: 'operational',
        provider: 'unified-chat',
        version: '2.0.0',
        endpoints: {
          unified: true,
          legacy: false
        },
        timestamp: new Date().toISOString()
      })
      
    default:
      return NextResponse.json({
        message: 'Unified Chat API - Single Source of Truth',
        documentation: {
          POST: 'Send unified chat requests (text, audio, image, tools)',
          GET: 'Get capabilities (?action=capabilities) or status (?action=status)'
        },
        examples: {
          basicChat: { messages: [{ role: 'user', content: 'Hello' }] },
          adminChat: { messages: [], mode: 'admin', context: { adminId: 'admin-123' } },
          imageAnalysis: { messages: [], image: { data: 'base64...', type: 'screen' } },
          toolCall: { messages: [], tool: { name: 'roi', params: {} } }
        },
        timestamp: new Date().toISOString()
      })
  }
}
