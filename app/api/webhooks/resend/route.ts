import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseService } from "@/src/lib/supabase";
import { logServerActivity } from "@/src/core/server-activity-logger"
import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/core/database.types";

// Type definitions for Resend webhook payload
interface ResendWebhookData {
  email_id: string
  to: string | string[]
  subject?: string
  tags?: {
    campaign_id?: string
    [key: string]: any
  }
  bounce?: {
    reason?: string
  }
  link?: {
    url?: string
  }
  [key: string]: any
}

interface ResendWebhookEvent {
  type: string
  data: ResendWebhookData
}

// Webhook signature verification
async function verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!secret) {
    // Warning log removed - could add proper error handling here
    return true // Allow in development
  }

  try {
    const { createHmac } = await import("crypto")
    const expectedSignature = createHmac("sha256", secret).update(payload, "utf8").digest("hex")

    return signature === `sha256=${expectedSignature}`
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Webhook signature verification error', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("resend-signature") || ""
    const payload = await req.text()

    // Verify webhook signature
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET || "test-secret"
    if (!(await verifyWebhookSignature(payload, signature, webhookSecret))) {
      // eslint-disable-next-line no-console
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event: ResendWebhookEvent = JSON.parse(payload)
    // Action logged

    const supabase = getSupabaseService()

    // Process different event types
    switch (event.type) {
      case "email.sent":
        await handleEmailSent(supabase, event.data)
        break
      case "email.delivered":
        await handleEmailDelivered(supabase, event.data)
        break
      case "email.bounced":
        await handleEmailBounced(supabase, event.data)
        break
      case "email.complained":
        await handleEmailComplained(supabase, event.data)
        break
      case "email.opened":
        await handleEmailOpened(supabase, event.data)
        break
      case "email.clicked":
        await handleEmailClicked(supabase, event.data)
        break
      default:
        // Action logged
    }

    // Log the webhook event
    await logServerActivity({
      type: "webhook_received",
      title: `Resend webhook: ${event.type}`,
      description: `Resend webhook: ${event.type}`,
      metadata: {
        eventType: event.type,
        emailId: event.data?.email_id,
        to: event.data?.to,
        subject: event.data?.subject,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Webhook processing error', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

async function handleEmailSent(supabase: any, data: ResendWebhookData) {
  try {
    await supabase.from("email_events").insert({
      email_id: data.email_id,
      event_type: "sent",
      recipient: Array.isArray(data.to) ? data.to[0] : data.to,
      subject: data.subject,
      event_data: data,
      created_at: new Date().toISOString(),
    })

    // Update email campaign status if applicable
    if (data.tags?.campaign_id) {
      const { data: current } = await supabase
        .from("email_campaigns")
        .select("sent_count")
        .eq("id", data.tags.campaign_id)
        .single()

      const currentCount = current?.sent_count ?? 0

      await supabase
        .from("email_campaigns")
        .update({
          sent_count: currentCount + 1,
          last_sent_at: new Date().toISOString(),
        })
        .eq("id", data.tags.campaign_id)
    }
  } catch (error) {
          // eslint-disable-next-line no-console
      console.error('Error handling email.sent', error)
  }
}

async function handleEmailDelivered(supabase: any, data: ResendWebhookData) {
  try {
    await supabase.from("email_events").insert({
      email_id: data.email_id,
      event_type: "delivered",
      recipient: Array.isArray(data.to) ? data.to[0] : data.to,
      subject: data.subject,
      event_data: data,
      created_at: new Date().toISOString(),
    })

    // Update email campaign delivery stats
    if (data.tags?.campaign_id) {
      const { data: current } = await supabase
        .from("email_campaigns")
        .select("delivered_count")
        .eq("id", data.tags.campaign_id)
        .single()

      const currentCount = current?.delivered_count ?? 0

      await supabase
        .from("email_campaigns")
        .update({
          delivered_count: currentCount + 1,
        })
        .eq("id", data.tags.campaign_id)
    }
  } catch (error) {
          // eslint-disable-next-line no-console
      console.error('Error handling email.delivered', error)
  }
}

async function handleEmailBounced(supabase: any, data: ResendWebhookData) {
  try {
    await supabase.from("email_events").insert({
      email_id: data.email_id,
      event_type: "bounced",
      recipient: Array.isArray(data.to) ? data.to[0] : data.to,
      subject: data.subject,
      event_data: data,
      bounce_reason: data.bounce?.reason,
      created_at: new Date().toISOString(),
    })

    // Update email campaign bounce stats
    if (data.tags?.campaign_id) {
      const { data: current } = await supabase
        .from("email_campaigns")
        .select("bounced_count")
        .eq("id", data.tags.campaign_id)
        .single()

      const currentCount = current?.bounced_count ?? 0

      await supabase
        .from("email_campaigns")
        .update({
          bounced_count: currentCount + 1,
        })
        .eq("id", data.tags.campaign_id)
    }

    // Mark email as bounced in leads table if applicable
    if (data.to) {
      await supabase
        .from("leads")
        .update({
          email_status: "bounced",
          last_email_bounce: new Date().toISOString(),
        })
        .eq("email", Array.isArray(data.to) ? data.to[0] : data.to)
    }
  } catch (error) {
          // eslint-disable-next-line no-console
      console.error('Error handling email.bounced', error)
  }
}

async function handleEmailComplained(supabase: any, data: ResendWebhookData) {
  try {
    await supabase.from("email_events").insert({
      email_id: data.email_id,
      event_type: "complained",
      recipient: Array.isArray(data.to) ? data.to[0] : data.to,
      subject: data.subject,
      event_data: data,
      created_at: new Date().toISOString(),
    })

    // Update email campaign complaint stats
    if (data.tags?.campaign_id) {
      const { data: current } = await supabase
        .from("email_campaigns")
        .select("complained_count")
        .eq("id", data.tags.campaign_id)
        .single()

      const currentCount = current?.complained_count ?? 0

      await supabase
        .from("email_campaigns")
        .update({
          complained_count: currentCount + 1,
        })
        .eq("id", data.tags.campaign_id)
    }

    // Mark email as complained in leads table
    if (data.to) {
      await supabase
        .from("leads")
        .update({
          email_status: "complained",
          unsubscribed: true,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq("email", Array.isArray(data.to) ? data.to[0] : data.to)
    }
  } catch (error) {
          // eslint-disable-next-line no-console
      console.error('Error handling email.complained', error)
  }
}

async function handleEmailOpened(supabase: any, data: ResendWebhookData) {
  try {
    await supabase.from("email_events").insert({
      email_id: data.email_id,
      event_type: "opened",
      recipient: Array.isArray(data.to) ? data.to[0] : data.to,
      subject: data.subject,
      event_data: data,
      created_at: new Date().toISOString(),
    })

    // Update email campaign open stats
    if (data.tags?.campaign_id) {
      const { data: current } = await supabase
        .from("email_campaigns")
        .select("opened_count")
        .eq("id", data.tags.campaign_id)
        .single()

      const currentCount = current?.opened_count ?? 0

      await supabase
        .from("email_campaigns")
        .update({
          opened_count: currentCount + 1,
        })
        .eq("id", data.tags.campaign_id)
    }

    // Update lead engagement
    if (data.to) {
      const { data: current } = await supabase
        .from("leads")
        .select("email_engagement_score")
        .eq("email", Array.isArray(data.to) ? data.to[0] : data.to)
        .single()

      const currentScore = current?.email_engagement_score ?? 0

      await supabase
        .from("leads")
        .update({
          last_email_opened: new Date().toISOString(),
          email_engagement_score: currentScore + 1,
        })
        .eq("email", Array.isArray(data.to) ? data.to[0] : data.to)
    }
  } catch (error) {
          // eslint-disable-next-line no-console
      console.error('Error handling email.opened', error)
  }
}

async function handleEmailClicked(supabase: any, data: ResendWebhookData) {
  try {
    await supabase.from("email_events").insert({
      email_id: data.email_id,
      event_type: "clicked",
      recipient: Array.isArray(data.to) ? data.to[0] : data.to,
      subject: data.subject,
      event_data: data,
      click_url: data.link?.url,
      created_at: new Date().toISOString(),
    })

    // Update email campaign click stats
    if (data.tags?.campaign_id) {
      const { data: current } = await supabase
        .from("email_campaigns")
        .select("clicked_count")
        .eq("id", data.tags.campaign_id)
        .single()

      const currentCount = current?.clicked_count ?? 0

      await supabase
        .from("email_campaigns")
        .update({
          clicked_count: currentCount + 1,
        })
        .eq("id", data.tags.campaign_id)
    }

    // Update lead engagement (clicks are worth more than opens)
    if (data.to) {
      const { data: current } = await supabase
        .from("leads")
        .select("email_engagement_score")
        .eq("email", Array.isArray(data.to) ? data.to[0] : data.to)
        .single()

      const currentScore = current?.email_engagement_score ?? 0

      await supabase
        .from("leads")
        .update({
          last_email_clicked: new Date().toISOString(),
          email_engagement_score: currentScore + 3,
        })
        .eq("email", Array.isArray(data.to) ? data.to[0] : data.to)
    }
  } catch (error) {
          // eslint-disable-next-line no-console
      console.error('Error handling email.clicked', error)
  }
}
