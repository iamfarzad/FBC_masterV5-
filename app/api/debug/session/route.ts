import { NextRequest, NextResponse } from 'next/server'
import { ContextStorage } from '@/src/core/context/context-storage'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const paramSid = searchParams.get('sessionId')
    const headerSid = req.headers.get('x-intelligence-session-id') || undefined
    const sessionId = paramSid || headerSid || undefined

    const consentCookie = req.cookies.get('fbc-consent')?.value || null
    let consent: any = null
    try { consent = consentCookie ? JSON.parse(consentCookie) : null } catch {}

    const ctxStore = new ContextStorage()
    const context = sessionId ? (await ctxStore.get(sessionId)) : null

    return NextResponse.json({
      ok: true,
      sessionId: sessionId || null,
      consent,
      context
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}

