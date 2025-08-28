import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const period = searchParams.get('period') || 'last_30_days'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'last_7_days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'last_30_days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'last_90_days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Fetch from conversations table
    let query = supabase
      .from('conversations')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    // Apply search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    const { data: conversations, error } = await query

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      )
    }

    // Transform data for frontend consumption
    const transformedConversations = (conversations || []).map(conv => ({
      id: conv.id,
      name: conv.name,
      email: conv.email,
      summary: conv.summary,
      leadScore: conv.lead_score,
      researchJson: conv.research_json,
      pdfUrl: conv.pdf_url,
      emailStatus: conv.email_status,
      emailRetries: conv.email_retries,
      createdAt: conv.created_at
    }))

    return NextResponse.json(transformedConversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
