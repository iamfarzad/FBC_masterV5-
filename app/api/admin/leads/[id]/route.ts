import { getSupabaseService } from "@/src/lib/supabase";
import { getSupabaseStorage } from '@/src/services/storage/supabase'
import { type NextRequest, NextResponse } from "next/server"
import { adminAuthMiddleware } from '@/src/core/auth/index'
import { adminRateLimit } from "@/app/api-utils/rate-limiting"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // Validate input
    if (!status || !['new', 'contacted', 'qualified', 'converted'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: new, contacted, qualified, converted" },
        { status: 400 }
      );
    }

    // Update lead status
    const supabaseClient = getSupabaseService()
    const { data, error } = await supabaseClient
      .from("lead_summaries")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // console.error("Lead update error:", error); // Commented out console.error
      return NextResponse.json(
        { error: "Failed to update lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, lead: data });
  } catch (error: unknown) {
    // console.error("Admin lead update error:", error); // Commented out console.error
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    // Get lead details
    const supabaseClient = getSupabaseService()
    const { data, error } = await supabaseClient
      .from("lead_summaries")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      // console.error("Lead fetch error:", error); // Commented out console.error
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ lead: data });
  } catch (error: unknown) {
    // console.error("Admin lead fetch error:", error); // Commented out console.error
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
