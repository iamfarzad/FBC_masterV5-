import { NextRequest, NextResponse } from 'next/server'
import { adminIntelligenceHandler } from '@/src/core/intelligence/admin-integration'

// Server-side admin handler - NOT Edge Runtime
export const runtime = 'nodejs' // Use Node.js runtime for intelligence integration

export async function POST(request: NextRequest) {
  try {
    const { action, conversationIds, sessionId, userMessage, email, name, companyUrl } = await request.json()

    switch (action) {
      case 'build_admin_context': {
        const result = await adminIntelligenceHandler.buildAdminContext(
          conversationIds || [],
          sessionId,
          userMessage
        )
        return NextResponse.json({ success: true, context: result })
      }

      case 'get_lead_intelligence': {
        const result = await adminIntelligenceHandler.getLeadIntelligence(
          email,
          name,
          companyUrl
        )
        return NextResponse.json({ success: true, research: result })
      }

      case 'init_admin_session': {
        const result = await adminIntelligenceHandler.initAdminIntelligenceSession(
          sessionId,
          email,
          name,
          companyUrl
        )
        return NextResponse.json({ success: true, session: result })
      }

      case 'analyze_intent': {
        const result = await adminIntelligenceHandler.analyzeAdminIntent(
          userMessage
        )
        return NextResponse.json({ success: true, intent: result })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Admin server handler error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Force dynamic rendering for server-side processing
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'


