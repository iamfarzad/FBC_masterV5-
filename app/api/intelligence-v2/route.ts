import { NextRequest } from 'next/server'
import { handleIntelligence } from '@/src/api/intelligence/handler'
import type { IntelligenceRequest } from '@/src/api/intelligence/handler'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Transform the request to match the expected format
    let intelligenceRequest: IntelligenceRequest

    if (body.type === 'lead_research') {
      intelligenceRequest = {
        action: 'research-lead',
        data: {
          email: body.query.split(' ').pop() || 'test@example.com',
          name: body.query,
          companyUrl: body.companyUrl
        }
      }
    } else if (body.type === 'message_analysis') {
      intelligenceRequest = {
        action: 'analyze-message',
        data: {
          message: body.query
        }
      }
    } else {
      intelligenceRequest = {
        action: 'analyze-message',
        data: {
          message: body.query
        }
      }
    }

    const result = await handleIntelligence(intelligenceRequest)

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Intelligence API error', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'