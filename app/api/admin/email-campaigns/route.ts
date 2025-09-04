import { getSupabaseService } from "@/src/lib/supabase";
import { getSupabaseStorage } from '@/src/services/storage/supabase'
import type { NextRequest } from "next/server"
import { adminAuthMiddleware } from '@/src/core/auth/index'
import { adminRateLimit } from "@/app/api-utils/rate-limiting"
import { NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // Check rate limiting
  const rateLimitResult = adminRateLimit(req);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  // Check admin authentication
  const authResponse = await adminAuthMiddleware({
    authorization: req.headers.get('authorization'),
    'x-admin-password': req.headers.get('x-admin-password')
  })
  if (authResponse) {
    return authResponse
  }
  try {
    const supabaseClient = getSupabaseService()

    const { data, error } = await supabaseClient.from("email_campaigns").select("*").order("created_at", { ascending: false })

    if (error) {
      // console.error("Supabase error:", error) // Commented out console.error
      return NextResponse.json({ error: "Failed to fetch email campaigns" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error: unknown) {
    // console.error("Email campaigns fetch error:", error) // Commented out console.error
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Check rate limiting
  const rateLimitResult = adminRateLimit(req);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  // Check admin authentication
  const authResponse = await adminAuthMiddleware({
    authorization: req.headers.get('authorization'),
    'x-admin-password': req.headers.get('x-admin-password')
  })
  if (authResponse) {
    return authResponse
  }
  try {
    const campaignData = await req.json()

    const supabaseClient = getSupabaseService()

    const { data, error } = await supabaseClient
      .from("email_campaigns")
      .insert({
        name: campaignData.name,
        subject: campaignData.subject,
        template: campaignData.template,
        target_segment: campaignData.targetSegment,
        status: "sent",
        sent_count: campaignData.sentCount || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      // console.error("Supabase error:", error) // Commented out console.error
      return NextResponse.json({ error: "Failed to create email campaign" }, { status: 500 })
    }

    return NextResponse.json({ success: true, campaign: data })
  } catch (error: unknown) {
    // console.error("Email campaign creation error:", error) // Commented out console.error
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
