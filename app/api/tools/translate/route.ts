import { GoogleGenAI } from '@google/genai'

import type { NextRequest } from 'next/server'
import { recordCapabilityUsed } from '@/src/core/context/capabilities'
import { translationRequestSchema, validateRequest, sanitizeString } from '@/src/core/validation/index'
import { logServerActivity } from '@/src/core/server-activity-logger'
import type { ToolRunResult } from '@/src/core/types/intelligence'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = Math.random().toString(36).substring(7)
  try {
    const body = await req.json()
    const validation = validateRequest(translationRequestSchema, body)
    if (!validation.success) {
      return new Response(JSON.stringify({ ok: false, error: 'Validation failed' } satisfies ToolRunResult), { status: 400 })
    }

    const { text, targetLang, sourceLang, sessionId: bodySessionId } = validation.data as any
    const cleanText = sanitizeString(text)
    const sessionId = bodySessionId || req.headers.get('x-intelligence-session-id') || null

    if (!process.env.GEMINI_API_KEY) {
      const mocked = `[mock-${targetLang}] ${cleanText}`
      if (sessionId) {
        try { await recordCapabilityUsed(String(sessionId), 'translate', { targetLang, sourceLang, inputLength: cleanText.length, outputLength: mocked.length, mocked: true }) } catch {}
      }
      await logServerActivity({
        type: 'ai_stream',
        title: 'Translate Completed (mock)',
        description: `Translated to ${targetLang}`,
        status: 'completed',
        metadata: { correlationId, ms: Date.now() - startTime }
      })
      return new Response(JSON.stringify({ ok: true, output: { translated: mocked } } satisfies ToolRunResult), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    await logServerActivity({
      type: 'ai_thinking',
      title: 'Translate Request',
      description: `to ${targetLang}${sourceLang ? ` from ${sourceLang}` : ''}`,
      status: 'in_progress',
      metadata: { correlationId, length: cleanText.length }
    })

    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    // Note: Using gemini-2.5-flash instead of 2.0-flash for better performance
    const modelName = 'gemini-2.5-flash'

    const getLanguageName = (code: string): string => {
      const languages: Record<string, string> = {
        'en': 'English', 'no': 'Norwegian', 'sv': 'Swedish', 'da': 'Danish',
        'de': 'German', 'fr': 'French', 'es': 'Spanish', 'it': 'Italian',
        'pt': 'Portuguese', 'nl': 'Dutch'
      };
      return languages[code] || code;
    };

    const prompt = `
You are a professional translator specializing in AI and technology content.

TRANSLATE the following text${sourceLang ? ` from ${getLanguageName(sourceLang)}` : ''} to ${getLanguageName(targetLang)}.

CONTEXT: AI consulting and business development platform
TONE: professional
PRESERVE THESE TERMS (do not translate): AI, API, ROI, CRM, SaaS, F.B/c, OAuth, JWT, SQL, NoSQL, MLOps

IMPORTANT RULES:
- Maintain professional business language
- Preserve technical terms and acronyms  
- Keep company names and product names unchanged (especially F.B/c)
- Maintain the original formatting and structure
- Ensure natural, fluent ${getLanguageName(targetLang)} text
- Use appropriate business terminology for the target market
- Return ONLY the translated text, no explanations or metadata

TEXT TO TRANSLATE:
"""
${cleanText}
"""

TRANSLATED TEXT:`

    const result = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { maxOutputTokens: Math.min(4096, Math.ceil(cleanText.length * 1.2)) }
    })

    const translated = result.text ?? ''

    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'translate', { targetLang, sourceLang, inputLength: cleanText.length, outputLength: translated.length }) } catch {}
    }

    await logServerActivity({
      type: 'ai_stream',
      title: 'Translate Completed',
      description: `Translated to ${targetLang}`,
      status: 'completed',
      metadata: { correlationId, ms: Date.now() - startTime }
    })

    return new Response(JSON.stringify({ ok: true, output: { translated } } satisfies ToolRunResult), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logServerActivity({
      type: 'error',
      title: 'Translate Failed',
      description: errorMessage,
      status: 'failed',
      metadata: { correlationId }
    })
    return new Response(JSON.stringify({ ok: false, error: 'Internal error' } satisfies ToolRunResult), { status: 500 })
  }
}


