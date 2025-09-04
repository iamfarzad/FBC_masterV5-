import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseService } from "@/src/lib/supabase";
import { getSupabaseStorage } from '@/src/services/storage/supabase'

const Body = z.object({ leadId: z.string() })

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const artifactId = params.id
    const parsed = Body.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const { leadId } = parsed.data

    const supabaseClient = getSupabaseService()
    const { error } = await supabaseClient
      .from('artifacts')
      .update({ lead_id: leadId })
      .eq('id', artifactId)
    if (error) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('link-lead error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


