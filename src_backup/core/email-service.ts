import { Resend } from 'resend'
import { config } from './config'

const resend = config.email.resendApiKey ? new Resend(config.email.resendApiKey) : null

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

export class EmailService {
  async sendEmail(options: EmailOptions) {
    if (!resend) {
      console.log('Email service not configured, skipping email:', options.subject)
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const result = await resend.emails.send({
        from: options.from || config.email.fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to send email:', error)
      return { success: false, error }
    }
  }

  async sendWelcomeEmail(email: string, name?: string) {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to F.B/c',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to F.B/c</h1>
          <p>Hi ${name || 'there'},</p>
          <p>Thank you for joining our AI platform. We're excited to have you on board.</p>
          <p>Get started by exploring our chat interface and tools.</p>
        </div>
      `
    })
  }
}

export const emailService = new EmailService()