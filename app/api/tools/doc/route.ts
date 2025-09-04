import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { GoogleGenAI } from '@google/genai'
// Mock functionality removed for production
import { createOptimizedConfig } from '@/src/core/gemini-config-enhanced'
import { selectModelForFeature, estimateTokens, UseCase } from '@/src/core/model-selector'
import { enforceBudgetAndLog } from '@/src/core/token-usage-logger'

import { recordCapabilityUsed } from '@/src/core/context/capabilities'

type SupportedDocType = 'application/pdf' | 'text/plain' | 'application/json' | 'text/csv' | 'application/xml'

function guessMimeFromName(name?: string): SupportedDocType | undefined {
  if (!name) return undefined
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'application/pdf'
  if (ext === 'txt') return 'text/plain'
  if (ext === 'json') return 'application/json'
  if (ext === 'csv') return 'text/csv'
  if (ext === 'xml') return 'application/xml'
  return undefined
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { filename, dataUrl, type, analysisType, urlContext, documentText } = body || {}
    const sessionId = req.headers.get('x-intelligence-session-id') || undefined
    const userId = req.headers.get('x-user-id') || undefined

    let mimeType: SupportedDocType | undefined = type || guessMimeFromName(filename)
    let base64Data = ''
    let documentSource = 'upload'

    // 📄 ENHANCED DOCUMENT PROCESSING - Multiple input methods
    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
      // Client provided base64
      const commaIdx = dataUrl.indexOf(',')
      const header = dataUrl.substring(5, commaIdx)
      mimeType = header.split(';')[0] || mimeType
      base64Data = dataUrl.substring(commaIdx + 1)
      documentSource = 'base64'
    } else if (typeof filename === 'string' && filename.length) {
      // Read from uploads directory
      const filepath = join(process.cwd(), 'public', 'uploads', filename)
      const buffer = await readFile(filepath)
      base64Data = buffer.toString('base64')
      mimeType = (mimeType || guessMimeFromName(filename)) as SupportedDocType
      documentSource = 'filesystem'
    } else if (typeof documentText === 'string' && documentText.trim()) {
      // 🌐 GOOGLE URL CONTEXT - Direct text processing
      base64Data = Buffer.from(documentText, 'utf-8').toString('base64')
      mimeType = 'text/plain'
      documentSource = 'url_context'
    }

    if (!base64Data || !mimeType) {
      return NextResponse.json({ ok: false, error: 'No document provided or unsupported type' }, { status: 400 })
    }

    // No API key → return error
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ ok: false, error: 'AI service not configured' }, { status: 503 })
    }

    // Budget and access checks
    const estimatedTokens = estimateTokens(UseCase.DOCUMENT_ANALYSIS) + 2500
    const modelSelection = selectModelForFeature(UseCase.DOCUMENT_ANALYSIS, estimatedTokens)



    if (userId && process.env.NODE_ENV !== 'test') {
      const budgetCheck = await enforceBudgetAndLog(userId, sessionId, UseCase.DOCUMENT_ANALYSIS, typeof modelSelection === 'string' ? modelSelection : modelSelection.model, estimatedTokens, estimatedTokens * 0.5, true)
      if (!budgetCheck.allowed) return NextResponse.json({ ok: false, error: 'Budget limit reached' }, { status: 429 })
    }

    // Generate with Gemini
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const optimizedConfig = createOptimizedConfig('analysis', { maxOutputTokens: 1536, temperature: 0.3, topP: 0.8, topK: 40 })
    let analysisText = ''
    try {
      const result = await genAI.models.generateContent({
        model: modelSelection.model,
        config: optimizedConfig,
        contents: [{
          role: 'user',
          parts: [
            { text: `🔍 ENHANCED DOCUMENT ANALYSIS\n\nAnalyze this ${mimeType} document and provide:\n• Executive Summary\n• Key Points & Insights\n• Business Risks & Opportunities\n• Actionable Recommendations\n\n${analysisType ? `SPECIAL FOCUS: ${analysisType}\n\n` : ''}${urlContext ? `URL CONTEXT: This document relates to: ${urlContext}\n\n` : ''}Provide analysis that connects to business context and actionable insights.` },
            { inlineData: { mimeType, data: base64Data } }
          ]
        }]
      })
      analysisText = result.candidates?.[0]?.content?.parts?.map(p => (p as any).text).filter(Boolean).join(' ') || result.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis completed'
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'AI analysis failed' }, { status: 500 })
    }

    // 📊 ENHANCED RESPONSE WITH METADATA
    const response = { 
      success: true, 
      output: {
        analysis: analysisText,
        type: mimeType,
        source: documentSource,
        filename: filename || 'document',
        size: base64Data.length,
        processedAt: new Date().toISOString(),
        capabilities: ['text_analysis', 'business_insights', 'recommendations'],
        hasUrlContext: !!urlContext,
        hasConversationContext: false
      }
    }
    
    // 🔄 ADVANCED CONTEXT MANAGEMENT
    if (sessionId) {
      try { 
        await recordCapabilityUsed(String(sessionId), 'doc', { 
          type: mimeType,
          source: documentSource,
          size: base64Data.length,
          hasContext: !!urlContext
        }) 
        
        // Note: Document analysis context management would be implemented here
      } catch (contextError) {
        console.warn('Context management failed:', contextError)
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof Error && (error as any).name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}


