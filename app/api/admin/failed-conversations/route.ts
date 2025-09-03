import { NextRequest, NextResponse } from 'next/server'
import { getFailedConversations } from '@/src/core/db/conversations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : null

    const failedConversations = await getFailedConversations(limit)

    // Filter by lead score if specified
    let filteredConversations = failedConversations
    if (minScore !== null) {
      filteredConversations = failedConversations.filter(
        conv => (conv.lead_score || 0) >= minScore
      )
    }

    return NextResponse.json(filteredConversations)
  } catch (error) {
    console.error('Error fetching failed conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch failed conversations' },
      { status: 500 }
    )
  }
}
