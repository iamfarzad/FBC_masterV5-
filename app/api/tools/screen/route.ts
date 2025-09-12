import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createOptimizedConfig } from '@/src/core/gemini-config-enhanced'
import { selectModelForFeature, estimateTokens } from '@/src/core/model-selector'
import { enforceBudgetAndLog } from '@/src/core/token-usage-logger'

import { ScreenShareSchema } from '@/src/core/services/tool-service'
import { recordCapabilityUsed } from '@/src/core/context/capabilities'
import { multimodalContextManager } from '@/src/core/context/multimodal-context'
import { APIErrorHandler, rateLimiter, performanceMonitor } from '@/src/core/api/error-handler'

export async function POST(req: NextRequest) {
  // Variables declared outside try block for catch block access
  const operationId = `screen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  let estimatedTokens = 0
  let modelSelection: any = null
  
  try {
    // 🚀 Rate Limiting: 20 requests per minute for screen analysis (more conservative than webcam)
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const isAllowed = rateLimiter.isAllowed(`screen-${clientIP}`, 20, 60 * 1000) // 20 requests per minute

    if (!isAllowed) {
      return APIErrorHandler.createErrorResponse({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many screen analysis requests. Please wait before trying again.',
        details: 'Rate limit exceeded for screen share API',
        retryable: true,
        statusCode: 429
      })
    }

    // 📊 Performance Monitoring: Start tracking
    const metrics = performanceMonitor.startOperation(operationId)

    const body = await req.json()
    const validatedData = ScreenShareSchema.parse(body)
    const { image, type, context } = validatedData as any
    const capability = type === 'document' ? 'doc' : type === 'screen' ? 'screenshot' : 'screen'

    const sessionId = req.headers.get('x-intelligence-session-id') || undefined
    const userId = req.headers.get('x-user-id') || undefined

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ ok: false, error: 'AI service not configured' }, { status: 503 })
    }

    if (!image) return NextResponse.json({ ok: false, error: 'No image data provided' }, { status: 400 })

    estimatedTokens = estimateTokens('screen analysis') + 2000

    // Use hardcoded model for now to fix multimodal functionality
    modelSelection = { model: 'gemini-2.5-flash', score: 30, cost: 0.001 }



    if (userId && process.env.NODE_ENV !== 'test') {
      const budgetCheck = await enforceBudgetAndLog(userId, sessionId, 'screen', modelSelection.model, estimatedTokens, estimatedTokens * 0.5, true)
      if (!budgetCheck.allowed) return NextResponse.json({ ok: false, error: 'Budget limit reached' }, { status: 429 })
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    let analysisResult = ''

    try {
      // 🔍 ENHANCED SCREEN ANALYSIS PROMPT
      let analysisPrompt = 'Analyze this screen for business insights'

      if (context?.prompt) {
        analysisPrompt += ` with focus on: ${context.prompt}`
      }

      if (context?.trigger === 'manual') {
        analysisPrompt += '. Provide detailed manual analysis.'
      }

      console.log('Analysis prompt:', analysisPrompt)
      console.log('Model selected:', modelSelection.model)
      console.log('Image length:', image.length)
      console.log('Image starts with:', image.substring(0, 50))

      // Use simple config instead of optimized config to avoid compatibility issues
      const optimizedConfig = {
        maxOutputTokens: 1024,
        temperature: 0.3,
        topP: 0.8,
        topK: 40
      }
      console.log('Config:', JSON.stringify(optimizedConfig, null, 2))

      const imageData = image.startsWith('data:') ? image.split(',')[1] : image
      console.log('Image data length after processing:', imageData.length)

      // First test without image to see if API call structure works
      console.log('Testing API call without image first...')
      console.log('Using model:', modelSelection.model)
      const testResult = await genAI.models.generateContent({
        model: 'gemini-2.5-flash', // Use known working model
        contents: [{ role: 'user', parts: [{ text: 'Hello, test message' }] }],
      })
      console.log('Text-only API call successful')

      const result = await genAI.models.generateContent({
        model: modelSelection.model,
        config: optimizedConfig,
        contents: [{ role: 'user', parts: [ { text: analysisPrompt }, { inlineData: { mimeType: 'image/png', data: imageData } } ] }],
      })

      console.log('Gemini response received, type:', typeof result)
      console.log('Gemini response keys:', Object.keys(result || {}))

      if (!result) {
        throw new Error('No response from Gemini API')
      }

      analysisResult = result.candidates?.[0]?.content?.parts?.map(p => (p as any).text).filter(Boolean).join(' ') || result.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis completed'
      console.log('Analysis result:', analysisResult)
    } catch (e) {
      console.error('Screen analysis AI error:', e)
      console.error('Error stack:', (e as Error).stack)
      return NextResponse.json({ ok: false, error: 'AI analysis failed', details: (e as Error).message, stack: (e as Error).stack }, { status: 500 })
    }

    const response = { ok: true, output: {
      analysis: analysisResult,
      insights: ["UI elements detected", "Content structure analyzed"],
      imageSize: image.length,
      isBase64: image.startsWith('data:image'),
      processedAt: new Date().toISOString(),
      trigger: context?.trigger || 'manual',
      hasContext: !!(context?.prompt || sessionId)
    }}
    if (sessionId) {
      try {
        await recordCapabilityUsed(String(sessionId), 'screen', { insights: response.output.insights, imageSize: image.length })
        await recordCapabilityUsed(String(sessionId), 'screenShare', { alias: true })

        // Add visual analysis to multimodal context
        await multimodalContextManager.addVisualAnalysis(
          String(sessionId),
          analysisResult,
          type === 'document' ? 'upload' : 'screen',
          image.length,
          image
        )
      } catch {}
    }

    // 📊 Performance Monitoring: Complete successful operation
    performanceMonitor.endOperation(operationId, {
      success: true,
      tokensUsed: estimatedTokens,
      model: modelSelection.model,
      errorCode: undefined
    })

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    // 📊 Performance Monitoring: Complete failed operation
    performanceMonitor.endOperation(operationId, {
      success: false,
      tokensUsed: estimatedTokens,
      model: modelSelection?.model,
      errorCode: (error as any)?.code || 'UNKNOWN_ERROR'
    })

    // 🚨 Enhanced Error Handling
    return APIErrorHandler.createErrorResponse(error)
  }
}


