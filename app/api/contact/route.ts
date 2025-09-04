import { NextRequest } from "next/server"
import { z } from "zod"
import { withApiHandler, parseJson, api } from "@/src/core/api/api-utils"

// Input validation schema
const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  company: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required")
})

export const POST = withApiHandler(async (req: NextRequest, context?: { params?: Record<string, string> }) => {
  const body = await parseJson(req)
  const { name, email, company, subject, message } = ContactSchema.parse(body)

  // Log contact form submission (replace with actual email service later)
  console.log('Contact form submission:', { name, email, company, subject, message })

  // TODO: Integrate with actual email service (Resend, SendGrid, etc.)
  // const emailService = new EmailService()
  // await emailService.sendContactForm({ name, email, company, subject, message })

  return api.success(
    { submitted: true },
    "Contact form submitted successfully"
  )
})