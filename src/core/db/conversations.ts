import { supabaseService } from '@/src/core/supabase/client'
import type { ConversationRecord } from '../types/conversations'
import type { Database } from '../database.types'

// Insert a new conversation record
export async function saveConversation(record: ConversationRecord) {
  const { data, error } = await supabaseService
    .from('conversations')
    .insert({
      name: record.name,
      email: record.email,
      summary: record.summary,
      lead_score: record.leadScore,
      research_json: record.researchJson,
      pdf_url: record.pdfUrl,
      email_status: record.emailStatus ?? 'pending',
      email_retries: record.emailRetries ?? 0
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving conversation:', error)
    throw error
  }
  return data
}

// Update only the PDF URL after generation
export async function updatePdfUrl(conversationId: string, pdfUrl: string) {
  const { data, error } = await supabaseService
    .from('conversations')
    .update({ pdf_url: pdfUrl })
    .eq('id', conversationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating PDF URL:', error)
    throw error
  }
  return data
}

// Update only the email status after sending
export async function updateEmailStatus(conversationId: string, status: 'pending' | 'sent' | 'failed') {
  const { data, error } = await supabaseService
    .from('conversations')
    .update({ email_status: status })
    .eq('id', conversationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating email status:', error)
    throw error
  }
  return data
}

// Increment email retry count
export async function incrementEmailRetries(conversationId: string) {
  const { data, error } = await supabaseService
    .from('conversations')
    .update({ email_retries: supabaseService.raw('email_retries + 1') })
    .eq('id', conversationId)
    .select()
    .single()

  if (error) {
    console.error('Error incrementing email retries:', error)
    throw error
  }
  return data
}

// Get conversation by ID
export async function getConversationById(id: string) {
  const { data, error } = await supabaseService
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Conversation not found
    }
    console.error('Get conversation error:', error)
    throw error
  }

  return data
}

// Log failed email attempt
export async function logFailedEmail(
  conversationId: string,
  recipientEmail: string,
  failureReason: string,
  retries: number,
  emailContent?: any
) {
  const { data, error } = await supabaseService
    .from('failed_emails')
    .insert({
      conversation_id: conversationId,
      recipient_email: recipientEmail,
      failure_reason: failureReason,
      retries,
      email_content: emailContent,
      failed_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error logging failed email:', error)
    throw error
  }

  return data
}

// Get failed conversations with full context
export async function getFailedConversations(limit: number = 50) {
  const { data, error } = await supabaseService
    .from('failed_conversations')
    .select('*')
    .limit(limit)
    .order('failed_at', { ascending: false })

  if (error) {
    console.error('Error fetching failed conversations:', error)
    throw error
  }

  return data || []
}

// Get failed conversations by conversation ID
export async function getFailedEmailsByConversation(conversationId: string) {
  const { data, error } = await supabaseService
    .from('failed_emails')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('failed_at', { ascending: false })

  if (error) {
    console.error('Error fetching failed emails:', error)
    throw error
  }

  return data || []
}

// Get conversations by email
export async function getConversationsByEmail(email: string) {
  const { data, error } = await supabaseService
    .from('conversations')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get conversations by email error:', error)
    throw error
  }

  return data || []
}

// Get failed conversations for retry
export async function getFailedConversationsForRetry(maxRetries: number = 3) {
  const { data, error } = await supabaseService
    .from('conversations')
    .select('id, email, pdf_url, email_retries')
    .eq('email_status', 'failed')
    .lt('email_retries', maxRetries)
    .not('pdf_url', 'is', null)
    .limit(10)

  if (error) {
    console.error('Error fetching failed conversations:', error)
    throw error
  }

  return data || []
}
