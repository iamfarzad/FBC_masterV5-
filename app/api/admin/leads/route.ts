import { getSupabaseService } from "@/src/lib/supabase";
import { getSupabaseStorage } from '@/src/services/storage/supabase'
import { type NextRequest, NextResponse } from "next/server"
import { adminAuthMiddleware } from '@/src/core/auth/index'
import { adminRateLimit } from "@/app/api-utils/rate-limiting"
import { withAdminAuth } from "@/app/api-utils/api-security"

export const GET = withAdminAuth(async (request: NextRequest) => {
  // Check rate limiting
  const rateLimitResult = adminRateLimit(request);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  // Check admin authentication
  const authResponse = await adminAuthMiddleware({
    authorization: request.headers.get('authorization'),
    'x-admin-password': request.headers.get('x-admin-password')
  })
  if (authResponse) {
    return authResponse
  }
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const period = searchParams.get("period") || "7d"
    const intent = searchParams.get("intent") || "all"

    // Calculate date range
    const now = new Date()
    const daysBack = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    const supabaseClient = getSupabaseService()
    let query = supabaseClient
      .from("lead_summaries")
      .select("id, name, email, company_name, lead_score, conversation_summary, consultant_brief, ai_capabilities_shown, intent_type, created_at")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`)
    }

    if (intent && intent !== 'all') {
      query = query.eq('intent_type', intent)
    }

    const { data: leads, error } = await query

    if (error) {
      // console.error("Supabase error:", error) // Commented out console.error
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
    }

    interface LeadSummary {
      id: string;
      name: string;
      email: string;
      company_name: string | null;
      lead_score: number;
      conversation_summary: string | null;
      consultant_brief: string | null;
      ai_capabilities_shown: string[] | null;
      intent_type: string | null;
      created_at: string;
    }

    // Add mock status and engagement_type for demo
    const enrichedLeads =
      leads?.map((lead: LeadSummary) => ({
        ...lead,
        status: ["new", "contacted", "qualified", "converted"][Math.floor(Math.random() * 4)],
        engagement_type: lead.ai_capabilities_shown?.[0] || "chat",
      })) || []

    return NextResponse.json({
      leads: enrichedLeads,
      total: leads?.length || 0,
    })
  } catch (error: unknown) {
    // console.error("Admin leads error:", error) // Commented out console.error
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
})
