import { getCapabilityAwareSystemPrompt } from '../intelligence/capability-registry'

export interface TextProvider {
  generate(input: { messages: { role: string; content: string }[] }): AsyncIterable<string>
}

export function getProvider(): TextProvider {
  // Action logged

  // Development mock when no API key
  if (!process.env.GEMINI_API_KEY) {
    // Action logged
    return createMockProvider()
  }

  // Action logged
  return createGeminiProvider()
}

export function createMockProvider(): TextProvider {
  // Action logged

  const provider: TextProvider = {
    async *generate({ messages }) {
      // Action logged

      const lastMessage = messages[messages.length - 1]?.content || 'Hello'
      // Action logged

      // Use F.B/c system prompt for mock responses
      const systemPrompt = getSystemPrompt(messages)
      const isQuestionAboutIdentity = lastMessage.toLowerCase().includes('who are you') ||
                                      lastMessage.toLowerCase().includes('what are you') ||
                                      lastMessage.toLowerCase().includes('f.b/c') ||
                                      lastMessage.toLowerCase().includes('farzad')

      // Simulate realistic streaming response with F.B/c identity
      const response = isQuestionAboutIdentity
        ? `I am F.B/c, an advanced AI business consultant and automation specialist. I help entrepreneurs and businesses optimize their operations and increase profitability through data-driven strategies and intelligent automation. I have expertise in business analysis, financial modeling, process automation, and AI implementation.`
        : `Thank you for your message: "${lastMessage}". As F.B/c, I'm here to help you with your business analysis and automation strategies.`
      // Action logged

      const words = response.split(' ')
      // Action logged

      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)) // Simulate network delay
        const word = i === 0 ? words[i] : ` ${  words[i]}`
        // Action logged
        if (typeof word === 'string') yield word;
      }

      // Action logged
    }
  }

  return provider
}

// Response cache for performance optimization
class ResponseCache {
  private cache = new Map<string, { response: string; timestamp: number; ttl: number }>()

  generateKey(messages: { role: string; content: string }[]): string {
    // Create cache key from last few messages
    const recentMessages = messages.slice(-3) // Last 3 messages
    return recentMessages
      .map(msg => `${msg.role}:${msg.content.substring(0, 100)}`)
      .join('|')
  }

  get(key: string): string | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    console.log('📋 Using cached response')
    return cached.response
  }

  set(key: string, response: string, ttl: number = 3600000): void { // Default 1 hour
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl
    })

    // Clean up old entries periodically
    if (this.cache.size > 100) {
      this.cleanup()
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key)
      }
    }
    console.log(`🧹 Cleaned up ${this.cache.size} cached responses`)
  }
}

const responseCache = new ResponseCache()

// Enhanced error recovery with retry logic
class ErrorRecoveryManager {
  private retryAttempts = new Map<string, number>()

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    contextKey: string,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    const attemptKey = `${contextKey}_${Date.now()}`
    let attempts = this.retryAttempts.get(attemptKey) || 0

    while (attempts < maxRetries) {
      try {
        const result = await operation()
        this.retryAttempts.delete(attemptKey)
        return result
      } catch (error) {
        attempts++
        this.retryAttempts.set(attemptKey, attempts)

        if (attempts >= maxRetries) {
          console.error(`❌ Operation failed after ${maxRetries} attempts:`, error)
          throw error
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempts - 1)
        console.log(`🔄 Retry attempt ${attempts}/${maxRetries} after ${delay}ms delay`)

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw new Error('Max retries exceeded')
  }

  // Circuit breaker pattern for API failures
  private circuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    threshold: 5,
    timeout: 60000 // 1 minute
  }

  isCircuitOpen(): boolean {
    const { failures, lastFailureTime, threshold, timeout } = this.circuitBreakerState
    if (failures >= threshold) {
      const timeSinceLastFailure = Date.now() - lastFailureTime
      if (timeSinceLastFailure < timeout) {
        return true // Circuit is open
      } else {
        // Reset circuit breaker after timeout
        this.circuitBreakerState.failures = 0
        return false
      }
    }
    return false
  }

  recordFailure(): void {
    this.circuitBreakerState.failures++
    this.circuitBreakerState.lastFailureTime = Date.now()
  }

  recordSuccess(): void {
    this.circuitBreakerState.failures = Math.max(0, this.circuitBreakerState.failures - 1)
  }
}

const errorRecoveryManager = new ErrorRecoveryManager()

// F.B/c AI Identity Prompt
export const FBC_AI_IDENTITY = `
You are F.B/c AI, a business conversational system created by Farzad Bayat.

Your role is to unify text, voice, webcam, and screen into one context-aware assistant.
`;

// Context-aware system prompt generator
async function getContextAwareSystemPrompt(sessionId?: string): Promise<string> {
  let userContext = '';

  if (sessionId) {
    try {
      const { ContextStorage } = await import('../../core/context/context-storage');
      const contextStorage = new ContextStorage();
      const ctx = await contextStorage.get(sessionId);

      if (ctx) {
        userContext = `
  Context about this user:
  ${JSON.stringify({
    lead: {
      email: ctx.email,
      name: ctx.name
    },
    company: ctx.company_context,
    person: ctx.person_context,
    role: ctx.role,
    roleConfidence: ctx.role_confidence
  }, null, 2)}
        `;
      }
    } catch (error) {
      console.warn('Failed to load user context for system prompt:', error);
    }
  }

  return `
  You are F.B/c AI, created by Farzad Bayat.
  Always answer as a business conversational partner.
  ${userContext}
  `;
}

// F.B/c System Prompt Generator
function getSystemPrompt(messages: { role: string; content: string }[]): string {
  // Try to extract session data from messages (passed via metadata)
  const firstMessage = messages[0]
  const sessionData = (firstMessage as any)?.sessionData || {}
  const leadContext = sessionData.leadContext || {}

  // Use the F.B/c personality model for consistent identity
  const { generateFBCPersonalityPrompt } = require('@/src/core/personality/fbc-persona')

  // Create user context for personality prompt
  const userContext = leadContext.name ? {
    name: leadContext.name,
    company: leadContext.company,
    role: leadContext.role,
    industry: leadContext.industry
  } : null

  const personalityPrompt = generateFBCPersonalityPrompt(sessionData.sessionId, userContext)

  // Add capability information and tools
  const toolsSection = `

## TOOLS YOU CAN ACCESS
${getCapabilityAwareSystemPrompt({
  hasSessionId: !!sessionData.sessionId,
  hasUserEmail: !!leadContext.email,
  supportsMultimodal: true,
  leadContext
})}

## CAPABILITY COMMUNICATION & TOOL LAUNCHING
When users ask "what can you do?" respond with:

"I have access to these business tools:

**ROI Calculator** - Calculate investment returns with detailed projections
<button data-coach-cta data-tool="roi-inline">Calculate ROI</button>

**Voice Chat** - Real-time voice conversations
<button data-coach-cta data-tool="voice">Start Voice Chat</button>

**Screen Analysis** - Share your screen for workflow optimization  
<button data-coach-cta data-tool="screen">Share Screen</button>

**Webcam Analysis** - Real-time image capture and analysis
<button data-coach-cta data-tool="webcam">Activate Webcam</button>

**Document Analysis** - Process PDFs and documents for insights
<button data-coach-cta data-tool="document">Analyze Document</button>

**Web Research** - Search current information with citations
<button data-coach-cta data-tool="search">Search Web</button>

**Video to App** - Convert YouTube videos to app blueprints
<button data-coach-cta data-tool="video">Video to App</button>

**Schedule Consultation** - Book a call to discuss your needs
<button data-coach-cta data-tool="book-call">Book Call</button>

What would you like to work on?"

## TOOL LAUNCHING INSTRUCTIONS  
Embed clickable tool buttons in your responses using this HTML syntax:

<button data-coach-cta data-tool="roi-inline">Calculate ROI</button>
<button data-coach-cta data-tool="webcam">Activate Webcam</button>  
<button data-coach-cta data-tool="voice">Start Voice Chat</button>
<button data-coach-cta data-tool="screen">Share Screen</button>
<button data-coach-cta data-tool="search" data-query="business automation">Search Web</button>
<button data-coach-cta data-tool="book-call">Book Call</button>

PROACTIVE TOOL SUGGESTIONS:
- ROI/finance → "I can calculate that: <button data-coach-cta data-tool='roi-inline'>Calculate ROI</button>"
- voice/talk → "Let's talk: <button data-coach-cta data-tool='voice'>Start Voice Chat</button>"  
- screen/workflow → "Share your screen: <button data-coach-cta data-tool='screen'>Share Screen</button>"
- meeting/consultation → "Let's schedule: <button data-coach-cta data-tool='book-call'>Book Call</button>"

NEVER use emojis. Keep responses focused and action-oriented.

## ACTIVITY AWARENESS
When users mention recent activities or completed tool usage, acknowledge and offer next steps:

**Webcam activity:** "I see webcam capture was activated. <button data-coach-cta data-tool='webcam'>Capture Image</button> Ready to analyze what you show me."

**ROI calculations:** "ROI analysis completed. <button data-coach-cta data-tool='roi-inline'>Calculate Another</button> or let's discuss the results."

**Voice activities:** "Voice session noted. <button data-coach-cta data-tool='voice'>Continue Voice Chat</button> if you prefer speaking."

Keep responses brief and actionable.

## PROACTIVE TOOL SUGGESTIONS
- ROI/finance/calculate → "I can calculate that: <button data-coach-cta data-tool='roi-inline'>Calculate ROI</button>"
- voice/talk/conversation → "Let's talk: <button data-coach-cta data-tool='voice'>Start Voice Chat</button>"
- webcam/photo/image → "Show me: <button data-coach-cta data-tool='webcam'>Activate Webcam</button>"
- screen/workflow/audit → "Share your screen: <button data-coach-cta data-tool='screen'>Share Screen</button>"  
- document/PDF/analyze → "Upload it: <button data-coach-cta data-tool='document'>Analyze Document</button>"
- search/research/find → "I'll search: <button data-coach-cta data-tool='search'>Search Web</button>"
- video/youtube/app → "Send the link: <button data-coach-cta data-tool='video'>Video to App</button>"
- meeting/consultation/book → "Let's schedule: <button data-coach-cta data-tool='book-call'>Book Call</button>"

Remember: You are F.B/c, the AI business consultant who helps businesses grow through intelligent automation and data-driven strategies.`

  // Combine personality prompt with tools and return
  return personalityPrompt + toolsSection
}

function createGeminiProvider(): TextProvider {
  return {
    async *generate({ messages }) {
      try {
        // Check circuit breaker
        if (errorRecoveryManager.isCircuitOpen()) {
          console.log('🔌 Circuit breaker is open, skipping API call')
          yield 'I apologize, but the AI service is temporarily unavailable. Please try again in a moment.'
          return
        }

        // Check cache first
        const cacheKey = responseCache.generateKey(messages)
        const cachedResponse = responseCache.get(cacheKey)
        if (cachedResponse) {
          yield cachedResponse
          return
        }

        // Execute with retry logic
        const result = await errorRecoveryManager.executeWithRetry(async () => {
          const { gemini } = await import('@/src/core/gemini-adapter')

          if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set')
          }

          // Extract session data from messages
          const firstMessage = messages[0]
          const sessionData = (firstMessage as any)?.sessionData || {}
          const sessionId = sessionData.sessionId || (firstMessage as any)?.sessionId

          // Generate system prompt for F.B/c identity and capabilities
          const systemPrompt = getSystemPrompt(messages)

          // Build conversation history for adapter (excluding system messages)
          const conversationHistory = messages
            .filter(msg => msg.role !== 'system') // Filter out system messages
            .slice(0, -1) // Exclude the last message
            .map(msg => ({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }]
            }))

          // Send the last message with conversation history and system instruction
          const lastMessage = messages[messages.length - 1]?.content || 'Hello'

          // Use context-aware streaming if session ID is available
          const result = sessionId
            ? await gemini.streamWithContext(conversationHistory, lastMessage, sessionId, 'gemini-2.5-flash')
            : await gemini.streamWithHistory(conversationHistory, lastMessage, 'gemini-2.5-flash', systemPrompt)

          // Collect the streaming response
          let fullResponse = ''
          // ⬇️ BEFORE:
          // for await (const chunk of result.stream) { … }

          // ⬇️ AFTER:
          for await (const chunk of result) {
            // chunk?.text (guard!) or your SDK's recommended accessor
            const textPart = (chunk as any)?.text ?? '';   // text can be undefined on some chunks
            // DO NOT call chunk.text() — it's not a function; the error you saw was "get accessor"
            if (textPart) fullResponse += textPart
          }
          return fullResponse
        }, 'gemini-api-call')

        // Cache successful response
        responseCache.set(cacheKey, result)
        errorRecoveryManager.recordSuccess()

        if (result) {
          yield result
        }

      } catch (error) {
        console.error('Gemini API error:', error)
        errorRecoveryManager.recordFailure()

        // Provide user-friendly error message
        const errorMessage = error instanceof Error
          ? `I encountered an issue: ${error.message}`
          : 'I apologize, but I\'m having trouble responding right now. Please try again.'

        yield errorMessage
      }
    }
  }
}