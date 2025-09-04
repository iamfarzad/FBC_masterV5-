import { getSupabaseService } from "@/src/lib/supabase";
import { getSupabaseStorage } from '@/src/services/storage/supabase'
import { type NextRequest, NextResponse } from "next/server"
import { adminAuthMiddleware } from '@/src/core/auth/index'
import { adminRateLimit } from "@/app/api-utils/rate-limiting"

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
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "leads"
    const period = searchParams.get("period") || "7d"

    // Calculate date range
    const now = new Date()
    const daysBack = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    if (type === "leads") {
      const supabaseClient = getSupabaseService()
      interface LeadSummary {
        name: string;
        email: string;
        company_name?: string;
        lead_score: number;
        created_at: string;
        consultant_brief?: string;
        ai_capabilities_shown?: string[];
      }
      const { data: leads } = await supabaseClient
        .from("lead_summaries")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })

      // Convert to CSV
      const csvHeaders = "Name,Email,Company,Lead Score,Created At,Consultant Brief,AI Capabilities\n"
      const csvRows =
        leads
          ?.map(
            (lead: LeadSummary) =>
              `"${lead.name}","${lead.email}","${lead.company_name || ""}",${lead.lead_score},"${lead.created_at}","${lead.consultant_brief?.replace(/"/g, '""') || ""}","${(lead.ai_capabilities_shown || []).join("; ")}"`,
          )
          .join("\n") || ""

      const csvContent = csvHeaders + csvRows

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="leads-${period}.csv"`,
        },
      })
    }

    // Default fallback
    return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
  } catch (error: unknown) {
    // console.error("Export error:", error) // Commented out console.error
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
