import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createOptimizedConfig } from '@/src/core/gemini-config-enhanced'
import { selectModelForFeature, estimateTokens } from '@/src/core/model-selector'
import { enforceBudgetAndLog } from '@/src/core/token-usage-logger'
import { recordCapabilityUsed } from '@/src/core/context/capabilities'
import { multimodalContextManager } from '@/src/core/context/multimodal-context'

interface URLAnalysisRequest {
  url: string
  analysisType?: string
  extractContent?: boolean
  contextPrompt?: string
}

// 🌐 GOOGLE URL CONTEXT ANALYSIS - Advanced web content processing
export async function POST(req: NextRequest) {
  try {
    const body: URLAnalysisRequest = await req.json()
    const { url, analysisType, extractContent = true, contextPrompt } = body
    const sessionId = req.headers.get('x-intelligence-session-id') || undefined
    const userId = req.headers.get('x-user-id') || undefined

    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ ok: false, error: 'Valid URL required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ ok: false, error: 'AI service not configured' }, { status: 503 })
    }

    // 📄 FETCH AND PROCESS WEB CONTENT
    let webContent = ''
    let contentType = 'text/html'
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'F.B/c AI Assistant (https://farzadbayat.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000 // 10 second timeout
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      contentType = response.headers.get('content-type') || 'text/html'
      webContent = await response.text()
      
      // Basic content extraction for HTML
      if (contentType.includes('text/html') && extractContent) {
        // Remove scripts, styles, and extract main content
        webContent = webContent
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 10000) // Limit content size
      }
      
    } catch (fetchError) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Failed to fetch URL content',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }, { status: 400 })
    }

    // Budget and model selection
    const estimatedTokens = estimateTokens(webContent) + 3000
    const modelSelection = selectModelForFeature('url_analysis', estimatedTokens, !!sessionId)

    if (userId && process.env.NODE_ENV !== 'test') {
      const budgetCheck = await enforceBudgetAndLog(userId, sessionId, 'url_analysis', modelSelection.model, estimatedTokens, estimatedTokens * 0.6, true)
      if (!budgetCheck.allowed) {
        return NextResponse.json({ ok: false, error: 'Budget limit reached' }, { status: 429 })
      }
    }

    // 🤖 ENHANCED AI ANALYSIS WITH CONTEXT
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const optimizedConfig = createOptimizedConfig('analysis', { 
      maxOutputTokens: 2048,
      temperature: 0.3,
      topP: 0.8,
      topK: 40
    })

    let analysisText = ''
    try {
      // 🔍 SMART CONTEXT INTEGRATION
      const existingContext = sessionId ? await multimodalContextManager.getSessionContext(sessionId) : null
      
      // 📋 BUILD CONTEXT-AWARE ANALYSIS PROMPT
      let analysisPrompt = `🌐 WEB CONTENT ANALYSIS\n\n`
      analysisPrompt += `URL: ${url}\n\n`
      analysisPrompt += `Analyze this web content and provide:\n`
      analysisPrompt += `• Executive Summary\n• Key Information & Insights\n• Business Relevance\n• Actionable Recommendations\n\n`
      
      if (analysisType) {
        analysisPrompt += `SPECIAL FOCUS: ${analysisType}\n\n`
      }
      
      if (contextPrompt) {
        analysisPrompt += `CONTEXT: ${contextPrompt}\n\n`
      }
      
      if (existingContext?.textMessages?.length > 0) {
        const recentContext = existingContext.textMessages.slice(-3).map(m => m.content).join(' ')
        analysisPrompt += `CONVERSATION CONTEXT: ${recentContext.slice(0, 500)}\n\n`
      }
      
      analysisPrompt += `Connect the analysis to business context and provide specific actionable insights.\n\n`
      analysisPrompt += `WEB CONTENT:\n${webContent}`

      const result = await genAI.models.generateContent({
        model: modelSelection.model,
        config: optimizedConfig,
        contents: [{
          role: 'user',
          parts: [{ text: analysisPrompt }]
        }]
      })
      
      analysisText = result.candidates?.[0]?.content?.parts?.map(p => (p as any).text).filter(Boolean).join(' ') || 
                    result.candidates?.[0]?.content?.parts?.[0]?.text || 
                    'Analysis completed'
                    
      console.log(`🌐 URL analysis completed: ${url}, ${analysisText.length} characters`)
      
    } catch (e) {
      console.error('URL analysis failed:', e)
      return NextResponse.json({ 
        ok: false, 
        error: 'AI analysis failed', 
        details: e instanceof Error ? e.message : 'Unknown error' 
      }, { status: 500 })
    }

    // 📊 ENHANCED RESPONSE WITH METADATA
    const response = { 
      ok: true, 
      output: {
        analysis: analysisText,
        url,
        contentType,
        contentLength: webContent.length,
        source: 'url_analysis',
        processedAt: new Date().toISOString(),
        capabilities: ['web_analysis', 'business_insights', 'url_context'],
        hasConversationContext: !!(existingContext?.textMessages?.length)
      }
    }
    
    // 🔄 ADVANCED CONTEXT MANAGEMENT
    if (sessionId) {
      try { 
        await recordCapabilityUsed(String(sessionId), 'url', { 
          url,
          contentType,
          contentLength: webContent.length,
          analysisType
        })
        
        // Add URL analysis to multimodal context
        await multimodalContextManager.addDocumentAnalysis(
          sessionId,
          analysisText,
          {
            filename: url,
            mimeType: 'text/html',
            source: 'url_context',
            urlContext: url,
            size: webContent.length,
            timestamp: new Date().toISOString(),
            contentType
          }
        )
      } catch (contextError) {
        console.warn('Context management failed:', contextError)
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('URL analysis API error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 🔗 URL VALIDATION HELPER
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Force dynamic rendering for real-time processing
export const dynamic = 'force-dynamic'
export const revalidate = 0