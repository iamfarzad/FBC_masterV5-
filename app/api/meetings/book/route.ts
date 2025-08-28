import { getSupabaseStorage } from '@/src/services/storage/supabase'
import { EmailService } from '@/src/core/email-service'
import { MeetingScheduler } from "@/src/core/meeting-scheduler"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { recordCapabilityUsed } from "@/src/core/context/capabilities"
const rl = new Map<string, { count: number; reset: number }>()
const idem = new Map<string, { expires: number; body: unknown }>()
function checkRate(key: string, max: number, windowMs: number) {
  const now = Date.now(); const rec = rl.get(key)
  if (!rec || rec.reset < now) { rl.set(key, { count: 1, reset: now + windowMs }); return true }
  if (rec.count >= max) return false
  rec.count++; return true
}

export async function POST(req: NextRequest) {
  try {
    const bookingData = await req.json()

    const supabase = getSupabaseStorage()

    // Check if slot is still available
    const { data: existingMeeting } = await supabase
      .from("meetings")
      .select("id")
      .eq("meeting_date", bookingData.preferredDate)
      .eq("meeting_time", bookingData.preferredTime)
      .eq("status", "scheduled")
      .single()

    if (existingMeeting) {
      return NextResponse.json({ error: "Time slot is no longer available" }, { status: 409 })
    }

    // Generate meeting link
    const meetingId = crypto.randomUUID()
    const meetingLink = MeetingScheduler.generateMeetingLink(meetingId)

    // Create meeting
    const { data: meeting, error } = await supabase
      .from("meetings")
      .insert({
        id: meetingId,
        lead_id: bookingData.leadId,
        name: bookingData.name,
        email: bookingData.email,
        company: bookingData.company,
        meeting_date: bookingData.preferredDate,
        meeting_time: bookingData.preferredTime,
        time_zone: bookingData.timeZone,
        status: "scheduled",
        meeting_link: meetingLink,
        notes: bookingData.message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      // Error: Supabase error
      return NextResponse.json({ error: "Failed to book meeting" }, { status: 500 })
    }

    // Send confirmation email
    const emailSent = await EmailService.sendMeetingConfirmationEmail({
      attendeeName: bookingData.name,
      attendeeEmail: bookingData.email,
      date: bookingData.preferredDate,
      time: bookingData.preferredTime,
      duration: 30,
      meetingLink,
    })

    const sessionId = req.headers.get('x-intelligence-session-id') || undefined
    const idemKey = req.headers.get('x-idempotency-key') || undefined
    const rlKey = `meeting:${sessionId || 'anon'}`
    if (!checkRate(rlKey, 6, 60_000)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'meeting', { meetingId, date: bookingData.preferredDate, time: bookingData.preferredTime }) } catch {}
    }

    return NextResponse.json({
      success: true,
      meeting,
      emailSent,
    })
  } catch (error: unknown) {
    console.error('Meeting booking error', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
