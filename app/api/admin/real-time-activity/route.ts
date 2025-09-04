import { getSupabaseService } from "@/src/lib/supabase";
import { getSupabaseStorage } from '@/src/services/storage/supabase'
import { type NextRequest, NextResponse } from "next/server"
import { adminAuthMiddleware } from '@/src/core/auth/index'
import { adminRateLimit } from "@/app/api-utils/rate-limiting"

interface LeadActivity {
  id: string;
  name: string;
  email: string;
  company_name?: string;
  ai_capabilities_shown?: string[];
  created_at: string;
  lead_score?: number;
  consultant_brief?: string;
}

export async function GET(request: NextRequest) {
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
    // Get recent activities from the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const supabaseClient = getSupabaseService()
    const { data: recentLeads } = await supabaseClient
      .from("lead_summaries")
      .select("*")
      .gte("created_at", twentyFourHoursAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(50)

    // Transform leads into activity items
    const activities =
      recentLeads?.map((lead: LeadActivity) => ({
        id: lead.id,
        type: "lead_captured",
        title: "New Lead Captured",
        description: `${lead.name} engaged via ${lead.ai_capabilities_shown?.[0] || "chat"}`,
        user: {
          name: lead.name,
          email: lead.email,
          location: lead.company_name ? `${lead.company_name}` : undefined,
        },
        timestamp: lead.created_at,
        metadata: {
          leadScore: lead.lead_score,
          capabilities: lead.ai_capabilities_shown,
          consultantBrief: lead.consultant_brief,
        },
      })) || []

    // Add some mock AI interaction activities
    const mockActivities = [
      {
        id: "ai-1",
        type: "ai_interaction",
        title: "AI Response Generated",
        description: "Generated personalized response for lead qualification",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        metadata: { responseTime: "450ms", tokens: 1250 },
      },
      {
        id: "tool-1",
        type: "tool_used",
        title: "Google Search Executed",
        description: "Searched for company information and industry insights",
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        metadata: { query: "AI automation consulting", results: 15 },
      },
      {
        id: "ai-2",
        type: "ai_interaction",
        title: "Voice Analysis Completed",
        description: "Processed voice input and generated transcript",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        metadata: { duration: "45s", confidence: 0.94 },
      },
    ]

    const allActivities = [...activities, ...mockActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50)

    // Mock active users count
    const activeUsers = Math.floor(Math.random() * 15) + 5

    return NextResponse.json({
      activities: allActivities,
      activeUsers,
      systemStatus: "healthy",
    })
  } catch (error: unknown) {
    // console.error("Real-time activity error:", error) // Commented out console.error
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}