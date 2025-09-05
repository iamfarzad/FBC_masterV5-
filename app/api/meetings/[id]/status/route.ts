import { getSupabaseService } from "@/src/lib/supabase";
import { getSupabaseStorage } from '@/src/services/storage/supabase'
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status, notes } = await req.json()
    const meetingId = params.id

    const supabaseClient = getSupabaseService()

    const { data, error } = await supabaseClient
      .from("meetings")
      .update({
        status,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", meetingId)
      .select()
      .single()

    if (error) {
      // Error: Supabase error
      return NextResponse.json({ error: "Failed to update meeting status" }, { status: 500 })
    }

    return NextResponse.json({ success: true, meeting: data })
  } catch (error: unknown) {
    console.error('Meeting status update error', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
