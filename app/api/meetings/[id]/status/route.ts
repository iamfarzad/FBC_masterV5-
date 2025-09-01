import { getSupabaseStorage } from '@/src/services/storage/supabase'
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status, notes } = await req.json()
    const meetingId = params.id

    const supabase = getSupabaseStorage()

    const { data, error } = await supabase
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
