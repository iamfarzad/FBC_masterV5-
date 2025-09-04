
import { NextRequest, NextResponse } from 'next/server'

// Unified rate limiting
const rateLimitCache = new Map<string, { count: number; reset: number }>()

export function createRateLimiter(maxRequests: number, windowMs: number) {
  return (key: string): boolean => {
    const now = Date.now()
    const record = rateLimitCache.get(key)
    
    if (!record || record.reset < now) {
      rateLimitCache.set(key, { count: 1, reset: now + windowMs })
      return true
    }
    
    if (record.count >= maxRequests) return false
    record.count++
    return true
  }
}

// Unified idempotency handling
const idempotencyCache = new Map<string, { body: any; expires: number }>()

export function handleIdempotency(sessionId: string, idemKey: string) {
  if (!sessionId || !idemKey) return null
  
  const key = `${sessionId}:${idemKey}`
  const cached = idempotencyCache.get(key)
  
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.body)
  }
  
  return null
}

export function cacheIdempotentResponse(
  sessionId: string, 
  idemKey: string, 
  response: any, 
  ttlMs: number = 300_000
) {
  if (!sessionId || !idemKey) return
  
  const key = `${sessionId}:${idemKey}`
  idempotencyCache.set(key, {
    body: response,
    expires: Date.now() + ttlMs
  })
}

// Unified session ID extraction
export function extractSessionId(req: NextRequest, body?: any): string | undefined {
  return req.headers.get('x-intelligence-session-id') || 
         body?.sessionId || 
         undefined
}

// Unified error responses
export const ErrorResponses = {
  rateLimited: () => NextResponse.json(
    { ok: false, error: 'Rate limit exceeded' }, 
    { status: 429 }
  ),
  
  badRequest: (message: string) => NextResponse.json(
    { ok: false, error: message }, 
    { status: 400 }
  ),
  
  unauthorized: () => NextResponse.json(
    { ok: false, error: 'Unauthorized' }, 
    { status: 401 }
  ),
  
  serverError: (message: string = 'Internal server error') => NextResponse.json(
    { ok: false, error: message }, 
    { status: 500 }
  )
}

// Unified route handler wrapper
export function createApiHandler(config: {
  rateLimit?: { max: number; windowMs: number }
  requireAuth?: boolean
  requireBody?: string[]
}) {
  return function(handler: (req: NextRequest, body: any, sessionId?: string) => Promise<NextResponse>) {
    return async function(req: NextRequest) {
      try {
        // Parse body
        const body = await req.json().catch(() => ({}))
        const sessionId = extractSessionId(req, body)
        const idemKey = req.headers.get('x-idempotency-key')
        
        // Rate limiting
        if (config.rateLimit) {
          const rateLimiter = createRateLimiter(config.rateLimit.max, config.rateLimit.windowMs)
          const rlKey = `${req.url}:${sessionId || 'anon'}`
          if (!rateLimiter(rlKey)) {
            return ErrorResponses.rateLimited()
          }
        }
        
        // Idempotency check
        if (sessionId && idemKey) {
          const cached = handleIdempotency(sessionId, idemKey)
          if (cached) return cached
        }
        
        // Body validation
        if (config.requireBody) {
          for (const field of config.requireBody) {
            if (!body[field]) {
              return ErrorResponses.badRequest(`Missing required field: ${field}`)
            }
          }
        }
        
        // Execute handler
        const response = await handler(req, body, sessionId)
        
        // Cache idempotent response
        if (sessionId && idemKey && response.status === 200) {
          const responseBody = await response.clone().json()
          cacheIdempotentResponse(sessionId, idemKey, responseBody)
        }
        
        return response
        
      } catch (error) {
        console.error('API Handler Error:', error)
        return ErrorResponses.serverError()
      }
    }
  }
}
