import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

serve(async () => {
  try {
    // 1. Find failed conversations with < 3 retries using the view
    const { data: failedConversations, error: fetchError } = await supabase
      .from('failed_conversations')
      .select('*')
      .not('pdf_url', 'is', null)
      .order('failed_at', { ascending: false })
      .limit(10)

    if (fetchError) {
      console.error("Error fetching failed conversations:", fetchError)
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!failedConversations || failedConversations.length === 0) {
      console.log("No failed conversations to retry")
      return new Response("No failed conversations to retry", { status: 200 })
    }

    console.log(`Found ${failedConversations.length} failed conversations to retry`)

    let successCount = 0
    let failureCount = 0

    for (const failedConv of failedConversations) {
      try {
        // Check if we've already reached max retries for this specific failure
        if ((failedConv.retries || 0) >= 3) {
          console.log(`Skipping ${failedConv.conversation_id} - max retries reached`)
          continue
        }

        // Call email service again
        const success = await trySendEmail(failedConv.email, failedConv.pdf_url)

        if (success) {
          // Update conversation status
          await supabase
            .from('conversations')
            .update({ email_status: 'sent' })
            .eq('id', failedConv.conversation_id)

          successCount++
          console.log(`Email sent successfully for conversation ${failedConv.conversation_id}`)
        } else {
          // Log another failed attempt
          await supabase
            .from('failed_emails')
            .insert({
              conversation_id: failedConv.conversation_id,
              recipient_email: failedConv.email,
              failure_reason: 'Retry failed',
              retries: (failedConv.retries || 0) + 1,
              failed_at: new Date().toISOString()
            })

          failureCount++
          console.log(`Email retry failed for conversation ${failedConv.conversation_id}`)
        }
      } catch (err) {
        console.error(`Email retry failed for conversation ${failedConv.conversation_id}:`, err)

        // Log the error
        await supabase
          .from('failed_emails')
          .insert({
            conversation_id: failedConv.conversation_id,
            recipient_email: failedConv.email,
            failure_reason: err.message || 'Retry function error',
            retries: (failedConv.retries || 0) + 1,
            failed_at: new Date().toISOString()
          })

        failureCount++
      }
    }

    const result = {
      successCount,
      failureCount,
      totalProcessed: failedConversations.length,
      message: `Processed ${failedConversations.length} failed emails. ${successCount} sent, ${failureCount} still failed.`
    }

    console.log(result.message)
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error("Retry function error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function trySendEmail(email: string, pdfUrl: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "F.B/c <contact@farzadbayat.com>",
        to: [email],
        subject: "Your Personalized AI Strategy Summary - F.B/c",
        html: generateRetryEmailHtml(pdfUrl),
        attachments: pdfUrl ? [{
          filename: "AI_Strategy_Summary.pdf",
          content: await fetchPdfContent(pdfUrl)
        }] : undefined
      })
    })

    return response.ok
  } catch (error) {
    console.error("Email send error:", error)
    return false
  }
}

function generateRetryEmailHtml(pdfUrl: string): string {
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
          .btn { display: inline-block; background: hsl(21 100% 51%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your AI Strategy Summary</h1>
            <p>F.B/c - AI Consulting & Strategy</p>
          </div>

          <div class="content">
            <h2>We're resending your AI Strategy Summary</h2>

            <p>We noticed there was an issue delivering your personalized AI strategy summary. We're resending it now!</p>

            <p><strong>📄 Your AI Strategy Summary:</strong><br>
            <a href="${pdfUrl}" class="btn">Download PDF</a></p>

            <p>If you continue to have issues receiving our emails, please reply to this message and we'll be happy to assist you personally.</p>

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

async function fetchPdfContent(pdfUrl: string): Promise<string> {
  // In production, this would fetch the PDF from Supabase Storage or S3
  // For now, return empty string as placeholder
  try {
    const response = await fetch(pdfUrl)
    const arrayBuffer = await response.arrayBuffer()
    return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
  } catch (error) {
    console.error("Failed to fetch PDF content:", error)
    return ""
  }
}
