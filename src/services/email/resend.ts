export interface EmailTemplate {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

export class EmailService {
  private apiKey: string

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    this.apiKey = apiKey
  }

  static isConfigured(): boolean {
    return !!process.env.RESEND_API_KEY
  }

  async sendEmail(template: EmailTemplate): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(this.apiKey)

      const result = await resend.emails.send({
        from: template.from || 'F.B/c <noreply@yourdomain.com>',
        to: template.to,
        subject: template.subject,
        html: template.html,
        replyTo: template.replyTo,
        attachments: template.attachments?.map(a => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType
        }))
      })

      if (result.error) {
        // Email send error occurred
        return { success: false, error: result.error.message }
      }

      // Email sent successfully
      return { success: true, id: result.data?.id }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown email error'
      // Email service error occurred
      return { success: false, error: errorMessage }
    }
  }

  async sendLeadNotification(lead: { email: string; name?: string; company?: string; message?: string }): Promise<boolean> {
    const template: EmailTemplate = {
      to: 'admin@yourdomain.com', // Configure this
      subject: `New Lead: ${lead.name || lead.email}`,
      html: `
        <h2>New Lead Captured</h2>
        <p><strong>Email:</strong> ${lead.email}</p>
        ${lead.name ? `<p><strong>Name:</strong> ${lead.name}</p>` : ''}
        ${lead.company ? `<p><strong>Company:</strong> ${lead.company}</p>` : ''}
        ${lead.message ? `<p><strong>Message:</strong> ${lead.message}</p>` : ''}
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    }

    const result = await this.sendEmail(template)
    return result.success
  }
}

// Export singleton instance
export const emailService = new EmailService()