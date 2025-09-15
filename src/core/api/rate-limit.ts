import type { NextRequest } from 'next/server'

type Bucket = { ts: number[] }
const buckets = new Map<string, Bucket>()

export function rateLimit(
  req: NextRequest,
  opts: { id?: string; limit?: number; windowMs?: number } = {}
) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'ip:unknown'
  const id = opts.id || ip
  const limit = Math.max(1, opts.limit ?? 10)
  const windowMs = Math.max(1000, opts.windowMs ?? 15000)

  const now = Date.now()
  const bucket = buckets.get(id) || { ts: [] }
  // drop old
  bucket.ts = bucket.ts.filter(t => now - t < windowMs)
  if (bucket.ts.length >= limit) {
    const retryAfterMs = windowMs - (now - bucket.ts[0])
    return { ok: false, retryAfterMs }
  }
  bucket.ts.push(now)
  buckets.set(id, bucket)
  return { ok: true }
}

