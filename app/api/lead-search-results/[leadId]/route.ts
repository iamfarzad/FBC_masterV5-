import { getSupabaseStorage } from '@/src/services/storage/supabase'
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 })
    }

    // Get search results for the lead
    const supabase = getSupabaseStorage()
    const { data: searchResults, error } = await supabase
      .from('lead_search_results')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) {
      // Error: Failed to fetch search results
      return NextResponse.json({ 
        error: "Failed to fetch search results",
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      leadId,
      searchResults: searchResults || [],
      count: searchResults?.length || 0
    })

  } catch (error: unknown) {
    console.error('Search results fetch error', error)
    return NextResponse.json({ 
      error: error.message || "Failed to fetch search results"
    }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params
    const { sources = ['linkedin.com'] } = await req.json()

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 })
    }

    // Get lead information first
    const { data: lead, error: leadError } = await supabase
      .from('lead_summaries')
      .select('name, email, company_name')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ 
        error: "Lead not found",
        details: leadError?.message 
      }, { status: 404 })
    }

    // Perform new grounded search
    const { GroundedSearchService } = await import('@/src/core/grounded-search-service')
    const groundedSearchService = new GroundedSearchService()
    
    const searchResults = await groundedSearchService.searchLead({
      name: lead.name || '',
      email: lead.email || '',
      company: lead.company_name || '',
      sources,
      leadId
    })

    return NextResponse.json({
      success: true,
      leadId,
      searchResults,
      count: searchResults.length
    })

  } catch (error: unknown) {
    console.error('Search results generation error', error)
    return NextResponse.json({ 
      error: error.message || "Failed to generate search results"
    }, { status: 500 })
  }
}
