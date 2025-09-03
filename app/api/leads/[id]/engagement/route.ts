import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseStorage } from '@/src/services/storage/supabase'

const Body = z.object({ interactionType: z.string().min(1) })

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const parsed = Body.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    
    // Simple engagement tracking via Supabase
    const supabase = getSupabaseStorage()
    const { error } = await supabase
      .from('lead_summaries')
      .update({ 
        last_interaction: new Date().toISOString(),
        interaction_type: parsed.data.interactionType
      })
      .eq('id', params.id)
    
    if (error) {
      // Warning log removed - could add proper error handling here
    }
    
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('leads engagement error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


