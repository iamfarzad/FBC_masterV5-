import { handleChat } from '../chat/handler'
import { authService } from '@/src/core/auth'
import type { ChatRequest } from '@/src/core/types/chat'

export interface AdminChatOptions {
  userId?: string
  headers?: Record<string, string | null>
}

// Admin chat uses the same core service but with additional checks
export async function handleAdminChat(body: unknown, options?: AdminChatOptions) {
  // Verify admin authentication if headers provided
  if (options?.headers) {
    const authResult = await authService.authenticateRequest(options.headers)
    if (!authResult.success) {
      throw new Error('Unauthorized: ' + (authResult.error || 'Invalid credentials'))
    }
  }

  // Add admin-specific system message if not present
  const adminSystemMessage = {
    role: 'system' as const,
    content: `You are F.B/c AI Admin Assistant, a specialized business intelligence and management AI.

Your capabilities:
- Analyze lead data and provide actionable insights
- Draft professional emails for campaigns and follow-ups
- Suggest meeting scheduling strategies and optimizations
- Interpret analytics and performance metrics
- Provide business recommendations based on data
- Help with lead scoring and prioritization
- Monitor system health and performance
- Assist with cost optimization and budget management
- Generate reports and summaries
- Suggest improvements for business processes

Response Style:
- Be concise, actionable, and data-driven
- Provide specific recommendations with rationale
- Use the context data to support your suggestions
- Suggest next steps and priorities
- Maintain professional, business-focused tone`
  }

  // Parse and enhance the request
  const request = body as ChatRequest
  const hasSystemMessage = request.messages.some(msg => msg.role === 'system')
  const enhancedBody: ChatRequest = {
    ...request,
    messages: hasSystemMessage 
      ? request.messages 
      : [adminSystemMessage, ...request.messages]
  }

  // Reuse the same chat handler with enhanced context
  return handleChat(enhancedBody)
}