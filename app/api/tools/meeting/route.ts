import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withApiHandler, parseJson, api } from '@/src/core/api/api-utils'
import { MeetingScheduler } from '@/src/core/meeting-scheduler'
import { recordCapabilityUsed } from '@/src/core/context/capabilities'
import type { ToolRunResult } from '@/src/core/types/intelligence'

const MeetingInputSchema = z.object({
  action: z.enum(['get_available_slots', 'book_meeting', 'get_next_available']),
  date: z.string().optional(),
  booking: z.object({
    leadId: z.string(),
    name: z.string(),
    email: z.string().email(),
    company: z.string().optional(),
    preferredDate: z.string(),
    preferredTime: z.string(),
    timeZone: z.string(),
    message: z.string().optional()
  }).optional()
})

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await parseJson(req)
  const data = MeetingInputSchema.parse(body)

  let output: any = {}

  try {
    switch (data.action) {
      case 'get_available_slots':
        if (!data.date) {
          throw new Error('Date is required for getting available slots')
        }
        output.slots = await MeetingScheduler.getAvailableSlots(data.date)
        output.message = `Found ${output.slots.length} available slots for ${data.date}`
        break

      case 'book_meeting':
        if (!data.booking) {
          throw new Error('Booking details are required')
        }
        const bookingResult = await MeetingScheduler.bookMeeting(data.booking)
        output = bookingResult
        break

      case 'get_next_available':
        const nextSlot = await MeetingScheduler.getNextAvailableSlot()
        output.nextSlot = nextSlot
        output.message = nextSlot 
          ? `Next available slot: ${nextSlot.date} at ${nextSlot.time}` 
          : 'No available slots found in the next 30 days'
        break

      default:
        throw new Error(`Unknown action: ${data.action}`)
    }

    // Record capability usage (non-blocking)
    const sessionId = req.headers.get('x-intelligence-session-id')
    if (sessionId) {
      recordCapabilityUsed(String(sessionId), 'meeting', {
        input: data,
        output: { action: data.action, success: true }
      }).catch(() => {}) // Ignore errors
    }

    return api.success(output, 'Meeting operation completed successfully')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return api.error(errorMessage, 'MEETING_ERROR')
  }
})