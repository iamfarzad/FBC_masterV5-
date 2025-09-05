import { handleChat } from '../chat/handler'
import type { UnifiedMessage, UnifiedChatRequest } from '@/src/core/chat/unified-types'

// ⬇️ imports at top (NodeNext)
// Restricted imports removed - using unified types instead

// ⬇️ if there's a random global `socket`, guard it or remove:
const socket: unknown = (globalThis as any)?.socket ?? undefined;

export interface AdminChatOptions {
  userId?: string
  headers?: Record<string, string | null>
}

interface AuthResult {
  success: boolean
  userId?: string
  error?: string
}

class AuthService {
  async authenticateRequest(headers: Record<string, string | null>): Promise<AuthResult> {
    const authHeader = headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' }
    }

    const token = authHeader.slice(7) // Remove 'Bearer '

    // Simple token validation for demo
    if (!token || token.length < 10) {
      return { success: false, error: 'Invalid token format' }
    }

    return { success: true, userId: `admin-user-${  Math.random().toString(36).substring(7)}` }
  }
}

const authService = new AuthService()

// Admin chat uses the same core service but with additional checks
export async function handleAdminChat(body: unknown, options?: AdminChatOptions) {
  // Verify admin authentication if headers provided
  if (options?.headers) {
    const authResult = await authService.authenticateRequest(options.headers)
    if (!authResult.success) {
      throw new Error(`Unauthorized: ${  authResult.error || 'Invalid credentials'}`)
    }
  }

  // Add admin-specific system message if not present
  const adminSystemMessage: UnifiedMessage = {
    id: crypto.randomUUID(),
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
- Maintain professional, business-focused tone`,
    timestamp: new Date(),
    type: 'text'
  }

  // Parse and enhance the request
  const request = body as ChatRequest
  // ⬇️ add parameter types to silence implicit any
  const hasSystemMessage = request.messages.some((msg: ChatMessage) => msg.role === 'system')

  // Convert to UnifiedChatRequest format
  const enhancedBody: UnifiedChatRequest = {
    ...request,
    messages: hasSystemMessage
      ? request.messages.map(msg => ({ ...msg, id: crypto.randomUUID(), timestamp: new Date() }))
      : [adminSystemMessage, ...request.messages.map(msg => ({ ...msg, id: crypto.randomUUID(), timestamp: new Date() }))]
  }

  // Reuse the same chat handler with enhanced context
  return handleChat(enhancedBody)
}