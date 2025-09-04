import { saveConversation, updatePdfUrl, updateEmailStatus, logFailedEmail } from "../db/conversations"
import { generatePdfWithPuppeteer, generatePdfPath } from "../pdf-generator-puppeteer"
import { EmailService } from "../email-service"
import type { LeadContext } from "../types/conversations"
import { logger } from "../../lib/logger"

export async function finalizeLeadSession(ctx: LeadContext) {
  let conversation: unknown

  try {
    // Step 1: Save base conversation
    conversation = await saveConversation({
      name: ctx.name,
      email: ctx.email,
      summary: ctx.summary,
      leadScore: ctx.leadScore,
      researchJson: ctx.researchJson,
      emailStatus: "pending"
    })

    logger.info('Conversation saved:', (conversation as any).id)

    // Step 2: Generate PDF
    let pdfUrl: string | null = null
    try {
      pdfUrl = await generateLeadPdf(ctx)
      await updatePdfUrl((conversation as any).id, pdfUrl)
      logger.info('PDF generated and linked:', pdfUrl)
    } catch (err) {
      logger.error('PDF generation failed:', err)
      throw new Error('Stopped pipeline: PDF generation failed')
    }

    // Step 3: Send email (with retry)
    try {
      const emailSent = await trySendLeadEmail(ctx.email, pdfUrl, (conversation as any).id, 2) // 2 retries max
      await updateEmailStatus((conversation as any).id, emailSent ? 'sent' : 'failed')
      logger.info('Email status updated:', emailSent ? 'sent' : 'failed')
    } catch (err) {
      logger.error('Email sending failed permanently:', err)
      await updateEmailStatus((conversation as any).id, 'failed')
    }

    return conversation

  } catch (err) {
    logger.error('finalizeLeadSession failed:', err)
    throw err
  }
}

// Generate PDF for lead
async function generateLeadPdf(ctx: LeadContext): Promise<string> {
  const pdfPath = generatePdfPath(ctx.researchJson.session?.id || 'unknown', ctx.name)

  const summaryData = {
    leadInfo: {
      name: ctx.name,
      email: ctx.email,
      company: ctx.researchJson.company?.name || 'Unknown Company',
      role: ctx.researchJson.person?.role || 'Unknown Role'
    },
    conversationHistory: [
      {
        role: 'assistant' as const,
        content: ctx.summary,
        timestamp: new Date().toISOString()
      }
    ],
    leadResearch: {
      conversation_summary: ctx.summary,
      consultant_brief: generateConsultantBrief(ctx),
      lead_score: ctx.leadScore,
      ai_capabilities_shown: extractCapabilities(ctx.researchJson)
    },
    sessionId: ctx.researchJson.session?.id || 'unknown'
  }

  await generatePdfWithPuppeteer(summaryData, pdfPath, 'internal', 'en')

  // In production, you would upload this to Supabase Storage or S3
  // For now, return the local path
  return pdfPath
}

// Generate consultant brief from research data
function generateConsultantBrief(ctx: LeadContext): string {
  const company = ctx.researchJson.company
  const person = ctx.researchJson.person
  const intelligence = ctx.researchJson.intelligence

  return `Lead: ${person?.fullName || ctx.name} at ${company?.name || 'Unknown Company'}
Industry: ${company?.industry || 'Unknown'}
Company Size: ${intelligence?.headcount ? `${intelligence.headcount} employees` : 'Unknown'}
HQ: ${intelligence?.hq || 'Unknown'}
Current Stage: ${ctx.researchJson.session?.stage || 'Unknown'}
Lead Score: ${ctx.leadScore}/100

Key Findings:
- Company focuses on: ${company?.summary || 'Unknown'}
- Decision maker: ${person?.role || 'Unknown role'}
- Pain points identified in conversation
- Ready for personalized AI strategy consultation

Recommended Next Steps:
1. Schedule discovery call within 24 hours
2. Prepare customized AI implementation roadmap
3. Share relevant case studies from ${company?.industry || 'similar industries'}`
}

// Extract AI capabilities shown from research
function extractCapabilities(researchJson: any): string {
  const capabilities = []

  if (researchJson.intelligence?.keywords) {
    capabilities.push(...researchJson.intelligence.keywords)
  }

  if (researchJson.company?.industry) {
    capabilities.push(`${researchJson.company.industry} AI solutions`)
  }

  return capabilities.length > 0
    ? capabilities.slice(0, 5).join(', ')
    : 'AI consultation, strategy development'
}

// Send lead email with retry logic and failure logging
async function trySendLeadEmail(email: string, pdfUrl: string | null, conversationId: string, retries: number): Promise<boolean> {
  const subject = 'Your Personalized AI Strategy Summary - F.B/c'
  const html = generateLeadEmailHtml(email, pdfUrl)
  const emailContent = {
    subject,
    html,
    attachments: pdfUrl ? [{ filename: 'AI_Strategy_Summary.pdf', contentType: 'application/pdf' }] : []
  }

  for (let i = 0; i <= retries; i++) {
    try {
      await EmailService.sendEmail({
        to: email,
        subject,
        html,
        ...(pdfUrl ? {
          attachments: [{
            filename: 'AI_Strategy_Summary.pdf',
            content: pdfUrl, // In production, this would be the actual PDF content
            contentType: 'application/pdf'
          }]
        } : {})
      })

      return true
    } catch (err: any) {
      const failureReason = err?.message || `Email service error: ${err?.toString() || 'Unknown error'}`

      // Log the failed attempt
      try {
        await logFailedEmail(
          conversationId,
          email,
          failureReason,
          i + 1,
          emailContent
        )
      } catch (logErr) {
        logger.error('Failed to log email failure:', logErr)
      }

      logger.warn(`Email attempt ${i + 1} failed:`, err)
      if (i === retries) return false
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  return false
}

// Generate lead email HTML
function generateLeadEmailHtml(email: string, pdfUrl: string | null): string {
  const pdfSection = pdfUrl
    ? `<p><strong>📄 Your AI Strategy Summary PDF:</strong><br>
       <a href="${pdfUrl}" style="background: #ff5b04; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download PDF</a></p>`
    : ''

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your AI Strategy Summary - F.B/c</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: hsl(203 23% 18%); }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, hsl(21 100% 51%) 0%, hsl(21 100% 45%) 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid hsl(0 0% 85%); }
          .footer { background: hsl(108 13% 85%); padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: hsl(0 0% 40%); }
          .highlight { background: hsl(108 13% 85%); padding: 15px; border-left: 4px solid hsl(21 100% 51%); margin: 20px 0; }
          .btn { display: inline-block; background: hsl(21 100% 51%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your AI Strategy Summary</h1>
            <p>Personalized insights from your F.B/c consultation</p>
          </div>

          <div class="content">
            <h2>Thank you for your interest in AI transformation!</h2>

            <p>Thank you for taking the time to explore how AI can transform your business with F.B/c. Based on our conversation, I've prepared a personalized AI strategy summary just for you.</p>

            <div class="highlight">
              <h3>📋 What's Included:</h3>
              <ul>
                <li>Analysis of your current situation and goals</li>
                <li>Recommended AI implementation roadmap</li>
                <li>Potential ROI projections</li>
                <li>Next steps for your AI journey</li>
              </ul>
            </div>

            ${pdfSection}

            <p><strong>Ready to take the next step?</strong></p>
            <a href="https://www.farzadbayat.com/contact" class="btn">Schedule a Call</a>

            <p>If you have any immediate questions or would like to discuss your AI strategy in more detail, please don't hesitate to reply to this email.</p>

            <p>Best regards,<br>
            <strong>Farzad Bayat</strong><br>
            Founder, F.B/c<br>
            AI Strategy & Implementation</p>
          </div>

          <div class="footer">
            <p>F.B/c - AI Consulting & Strategy</p>
            <p>www.farzadbayat.com | contact@farzadbayat.com</p>
          </div>
        </div>
      </body>
    </html>
  `
}
