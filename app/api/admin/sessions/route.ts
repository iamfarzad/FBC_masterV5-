import { NextRequest, NextResponse } from 'next/server'
import { adminChatService } from '@/src/core/admin/admin-chat-service'

export async function GET(request: NextRequest) {
  // Soft-gate: Require Supabase env vars for admin access
  const hasAdminEnv = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!hasAdminEnv) {
    return NextResponse.json({ disabled: true, message: "Admin features require Supabase configuration" })
  }

  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')

    const sessions = await adminChatService.getAdminSessions(adminId || undefined)
    return NextResponse.json({ sessions })

  } catch (error) {
    console.error('Admin sessions GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, adminId, sessionName } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    const session = await adminChatService.getOrCreateSession(sessionId, adminId, sessionName)
    return NextResponse.json({ session })

  } catch (error) {
    console.error('Admin sessions POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Mark session as inactive (soft delete)
    const { getSupabaseService } = await import('@/src/lib/supabase')
    const supabase = getSupabaseService()
    await supabase
      .schema('admin')
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Admin sessions DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}
