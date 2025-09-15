import { NextRequest, NextResponse } from 'next/server'
import { GoogleGroundingProvider } from '@/src/core/intelligence/providers/search/google-grounding'
import { rateLimit } from '@/src/core/api/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(req, { limit: 8, windowMs: 15000 })
    if (!rl.ok) {
      return NextResponse.json({ ok: false, error: 'Rate limited' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.retryAfterMs || 1000)/1000)) } })
    }
    const body = await req.json().catch(() => ({})) as { query?: string; urls?: string[] }
    const query = (body.query || '').trim()
    const urls = Array.isArray(body.urls) ? body.urls : undefined

    if (!query) {
      return NextResponse.json({ ok: false, error: 'Missing query' }, { status: 400 })
    }

    const provider = new GoogleGroundingProvider()
    const result = await provider.groundedAnswer(query, urls)

    return NextResponse.json({ ok: true, output: { text: result.text, citations: result.citations }})
  } catch (error) {
    console.error('Grounded search failed', error)
    return NextResponse.json({ ok: false, error: 'Grounded search failed' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
