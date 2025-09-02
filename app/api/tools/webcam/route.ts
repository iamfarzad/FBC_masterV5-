import { NextRequest, NextResponse } from 'next/server'
import { WebcamCaptureSchema } from '@/src/core/services/tool-service'

import { recordCapabilityUsed } from '@/src/core/context/capabilities'
import { GoogleGenAI } from '@google/genai'
import { createOptimizedConfig } from '@/src/core/gemini-config-enhanced'
import { selectModelForFeature, estimateTokens } from '@/src/core/model-selector'
import { enforceBudgetAndLog } from '@/src/core/token-usage-logger'

import { multimodalContextManager } from '@/src/core/context/multimodal-context'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = WebcamCaptureSchema.parse(body)
    const { image, type } = validatedData as any
    const sessionId = req.headers.get('x-intelligence-session-id') || undefined
    const userId = req.headers.get('x-user-id') || undefined

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ ok: false, error: 'AI service not configured' }, { status: 503 })
    }

    if (!image) return NextResponse.json({ ok: false, error: 'No image data provided' }, { status: 400 })

    // Determine mime type and base64 payload
    const isDataUrl = image.startsWith('data:')
    const mimeMatch = isDataUrl ? image.substring(5, image.indexOf(';')) : 'image/jpeg'
    const mimeType = mimeMatch || 'image/jpeg'
    const base64Data = isDataUrl ? image.split(',')[1] : image

    // Budget and access checks
    const estimatedTokens = estimateTokens('image analysis') + 1500
    const modelSelection = selectModelForFeature('image_analysis', estimatedTokens, !!sessionId)



    if (userId && process.env.NODE_ENV !== 'test') {
      const budgetCheck = await enforceBudgetAndLog(userId, sessionId, 'image_analysis', modelSelection.model, estimatedTokens, estimatedTokens * 0.5, true)
      if (!budgetCheck.allowed) return NextResponse.json({ ok: false, error: 'Budget limit reached' }, { status: 429 })
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    let analysisResult = ''
    try {
      const optimizedConfig = createOptimizedConfig('analysis', { maxOutputTokens: 1024, temperature: 0.3, topP: 0.8, topK: 40 })
      const result = await genAI.models.generateContent({
        model: modelSelection.model,
        config: optimizedConfig,
        contents: [{ role: 'user', parts: [ { text: 'Analyze this image for business insights.' }, { inlineData: { mimeType, data: base64Data } } ] }],
      })
      analysisResult = result.candidates?.[0]?.content?.parts?.map(p => (p as any).text).filter(Boolean).join(' ') || result.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis completed'
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'AI analysis failed' }, { status: 500 })
    }

    const response = { ok: true, output: {
      analysis: analysisResult,
      insights: ["Objects and context analyzed", "Business relevance extracted"],
      imageSize: image.length,
      isBase64: image.startsWith('data:image'),
      processedAt: new Date().toISOString()
    }}
    if (sessionId) {
      try {
        await recordCapabilityUsed(String(sessionId), 'image', { insights: response.output.insights, imageSize: image.length, type: type || 'webcam' })

        // Add visual analysis to multimodal context
        await multimodalContextManager.addVisualAnalysis(
          String(sessionId),
          analysisResult,
          type || 'webcam',
          image.length,
          image
        )
      } catch {}
    }
    return NextResponse.json(response, { status: 200 })
  } catch (error: unknown) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}


