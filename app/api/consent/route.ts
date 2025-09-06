import { NextRequest, NextResponse } from 'next/server'

type ConsentCookie = {
  allow: boolean
  allowedDomains: string[]
  ts: number
  policyVersion?: string
  name?: string
  email?: string
  companyDomain?: string | undefined
}

function inferDomainFromEmail(email?: string): string | null {
  if (!email || !email.includes('@')) return null
  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) return null
  const generic = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','proton.me','protonmail.com']
  if (generic.includes(domain)) return null
  return domain
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('fbc-consent')?.value
  if (!cookie) return NextResponse.json({ allow: false }, { status: 200 })
  try {
    const data = JSON.parse(cookie) as ConsentCookie
    return NextResponse.json({ allow: !!data.allow, allowedDomains: data.allowedDomains, ts: data.ts })
  } catch {
    return NextResponse.json({ allow: false }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, companyUrl, policyVersion, name, sessionId } = await req.json()
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }
    let domain: string | null = null
    const inferred = inferDomainFromEmail(email)
    if (inferred) domain = inferred
    else if (typeof companyUrl === 'string' && companyUrl.length > 3) {
      try { domain = new URL(companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`).hostname } catch {}
    }
    const allowedDomains = Array.from(new Set([domain].filter(Boolean) as string[]).values())
    // Always allow linkedin.com as secondary source if a domain exists
    if (allowedDomains.length) allowedDomains.push('linkedin.com')

    const value: ConsentCookie = { allow: true, allowedDomains, ts: Date.now(), policyVersion, name, email, companyDomain: domain || undefined }
    const res = NextResponse.json({ ok: true, allowedDomains })
    const isProd = process.env.NODE_ENV === 'production';
    res.cookies.set('fbc-consent', JSON.stringify(value), { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 60 * 60 * 24 * 30 })

    // 🔧 MASTER FLOW: Wire consent → session-init (idempotent)
    // Immediately trigger intelligence initialization after consent
    const finalSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                     (req.headers.get('x-forwarded-proto') || 'http') + '://' + 
                     (req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000')
      
      const initResponse = await fetch(`${baseUrl}/api/intelligence/session-init`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-intelligence-session-id': finalSessionId
        },
        body: JSON.stringify({
          sessionId: finalSessionId,
          email,
          name,
          companyUrl
        })
      })

      if (initResponse.ok) {
        console.log(`✅ Intelligence initialized for session: ${finalSessionId}`)
        // Include sessionId in response for client to use
        const responseData = await res.json()
        return NextResponse.json({ 
          ...responseData, 
          sessionId: finalSessionId,
          intelligenceReady: true 
        })
      } else {
        console.warn(`⚠️ Intelligence init failed (non-fatal): ${initResponse.status}`)
      }
    } catch (e) {
      console.warn('[consent] session-init failed (non-fatal)', e)
    }

    return res
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('fbc-consent', '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 })
  return res
}


