import { NextRequest, NextResponse } from 'next/server'
import { GoogleGroundingProvider } from '@/src/core/intelligence/providers/search/google-grounding'
import { rateLimit } from '@/src/core/api/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(req, { limit: 6, windowMs: 15000 })
    if (!rl.ok) {
      return NextResponse.json({ ok: false, error: 'Rate limited' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.retryAfterMs || 1000)/1000)) } })
    }
    const body = await req.json().catch(() => ({})) as { urls?: string[]; query?: string }
    const urls = (Array.isArray(body.urls) ? body.urls : []).filter(Boolean)
    const query = (body.query || 'Analyze the provided URLs and extract key business insights.').trim()

    if (!urls.length) {
      return NextResponse.json({ ok: false, error: 'Missing urls' }, { status: 400 })
    }

    const provider = new GoogleGroundingProvider()
    const result = await provider.groundedAnswer(query, urls)

    return NextResponse.json({ ok: true, output: { text: result.text, citations: result.citations, urls }})
  } catch (error) {
    console.error('URL context analysis failed', error)
    return NextResponse.json({ ok: false, error: 'URL context analysis failed' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
