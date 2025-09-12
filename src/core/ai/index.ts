import { getCapabilityAwareSystemPrompt } from '../intelligence/capability-registry'

export interface TextProvider {
  generate(input: { messages: { role: string; content: string }[] }): AsyncIterable<string>
}

export function getProvider(): TextProvider {
  // Check for various possible environment variable names
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY_SERVER

  if (apiKey) {
    console.log('✅ Using real Gemini API')
    return createGeminiProvider()
  }

  console.log('⚠️ No API key found, using mock provider')
  return createMockProvider()
}

export function createMockProvider(): TextProvider {
  // Action logged

  const provider: TextProvider = {
    async *generate({ messages }) {
      // Action logged

      const lastMessage = messages[messages.length - 1]?.content || 'Hello'
      // Action logged

      // Simulate realistic streaming response
      const response = `Thank you for your message: "${lastMessage}". This is a mock response for development. I'm here to help you with your business analysis and automation strategies.`
      // Action logged

      const words = response.split(' ')
      // Action logged

      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)) // Simulate network delay
        const word = i === 0 ? words[i] : ` ${  words[i]}`
        // Action logged
        if (word) yield word
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

// Conversation stage-specific instructions for AI
function getStageInstructions(stage: string, leadContext: any): string {
  const instructions = {
    greeting: `
## GREETING STAGE INSTRUCTIONS:
- Ask for the user's name naturally
- Keep it friendly and professional
- Do NOT ask for email yet
- Example: "Hi! I'm F.B/c, your AI business consultant. What's your name?"`,

    email_request: `
## EMAIL REQUEST STAGE INSTRUCTIONS:
- Thank them for their name
- Ask for their work email to send personalized summary
- Explain you'll use it for research and personalization
- Example: "Nice to meet you, [Name]! To send you a personalized summary of our conversation, what's your work email?"`,

    email_collected: `
## EMAIL COLLECTED STAGE INSTRUCTIONS:
- Acknowledge the email
- Mention you'll analyze their company background
- Transition to asking about their challenges
- Do NOT show tools yet - focus on discovery first`,

    discovery: `
## DISCOVERY STAGE INSTRUCTIONS:
- Ask about their biggest business challenges
- Focus on problems they want to solve with AI/automation
- Provide 3-4 specific suggestion options
- Keep responses focused on understanding their needs`,

    solution_positioning: `
## SOLUTION POSITIONING STAGE INSTRUCTIONS:
- Present training vs consulting options
- Explain the differences clearly
- Ask which approach interests them more
- Mention you'll calculate ROI and provide next steps`,

    booking_offer: `
## BOOKING OFFER STAGE INSTRUCTIONS:
- Offer to schedule a consultation call
- Mention personalized strategy summary
- Provide clear next steps
- Be ready to open booking calendar`
  }

  return instructions[stage as keyof typeof instructions] || `
## GENERAL CONVERSATION INSTRUCTIONS:
- Stay in character as F.B/c, the AI business consultant
- Focus on business value and practical applications
- Be professional yet approachable`
}

// F.B/c System Prompt Generator
function getSystemPrompt(messages: { role: string; content: string; metadata?: any }[]): string {
  // Try to extract session data from messages (passed via metadata or content)
  const latestMessage = messages[messages.length - 1]
  let sessionData = latestMessage?.metadata?.sessionData || {}

  // Also check message content for SESSION_CONTEXT (used by unified provider)
  const content = latestMessage?.content || ''
  const sessionContextMatch = content.match(/\[SESSION_CONTEXT:\s*(\{[^}]+\})\]/)
  if (sessionContextMatch) {
    try {
      const parsedContext = JSON.parse(sessionContextMatch[1])
      sessionData = { ...sessionData, ...parsedContext }
    } catch (e) {
      // Ignore parse errors
    }
  }

  const leadContext = sessionData.leadContext || {}
  const conversationStage = sessionData.conversationStage || 'greeting'

  console.log('🤖 AI Context Debug:', {
    conversationStage,
    leadContext,
    sessionData,
    latestMessageMetadata: latestMessage?.metadata,
    contentSnippet: content.substring(0, 200)
  })

  // Conversation stage-specific instructions
  const stageInstructions = getStageInstructions(conversationStage, leadContext)

  const systemPrompt = `You are F.B/c, an advanced AI business consultant and automation specialist.

## YOUR IDENTITY
- You are F.B/c (pronounced "F dot B slash C")
- You are an AI-powered business consultant specializing in automation, ROI analysis, and digital transformation
- You help entrepreneurs and businesses optimize their operations and increase profitability
- You have expertise in business analysis, financial modeling, process automation, and AI implementation

## CRITICAL: CONVERSATION STAGE PROTOCOL
You are currently in the ${conversationStage.toUpperCase()} stage of a structured lead qualification conversation.

${stageInstructions}

IMPORTANT: You MUST follow the stage-specific instructions above. Do not skip stages or respond generically. Stay in your assigned role for this conversation stage.

## YOUR CAPABILITIES
I'm an AI business consultant specializing in automation, ROI analysis, and digital transformation. I help optimize operations and increase profitability through data-driven strategies.

## COMMUNICATION STYLE
- Professional yet approachable
- Results-focused and practical
- Use business terminology appropriately
- Provide actionable recommendations
- Be confident in your expertise
- Always aim to add value to the conversation

## TOOLS YOU CAN ACCESS
${getCapabilityAwareSystemPrompt({
  hasSessionId: !!sessionData.sessionId,
  hasUserEmail: !!leadContext.email,
  supportsMultimodal: true,
  leadContext
})}

${leadContext.name ? `## CURRENT USER CONTEXT
- Name: ${leadContext.name}
- Company: ${leadContext.company || 'Not specified'}
- Role: ${leadContext.role || 'Not specified'}
- Industry: ${leadContext.industry || 'Not specified'}

Tailor your responses to be relevant to their business context and industry.` : ''}

## RESPONSE GUIDELINES
- Always maintain your F.B/c identity and expertise
- Focus on business value and practical applications
- When appropriate, suggest using your available tools
- Provide specific, actionable advice
- Use professional business language
- Keep responses concise but comprehensive
- End responses with relevant next steps or questions when appropriate

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

  return systemPrompt
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
          const { GoogleGenerativeAI } = await import('@google/generative-ai')

          const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY_SERVER
          if (!apiKey) {
            throw new Error('Gemini API key environment variable is not set')
          }

          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: getSystemPrompt(messages)
          })

          // Build conversation history - ensure proper format and role sequence
          const conversationHistory = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          }))

          // Handle conversation history properly to avoid empty history or wrong role sequence
          let history = conversationHistory.slice(0, -1) // Exclude the last message
          
          // Ensure history starts with 'user' role and has proper alternating sequence
          if (history.length > 0) {
            // If first message in history is not 'user', remove it or fix the sequence
            if (history[0]?.role !== 'user') {
              history = history.slice(1) // Remove first message if it's not from user
            }
            
            // Ensure we have alternating user/model roles
            history = history.filter((msg, index) => {
              if (index === 0) return msg.role === 'user'
              const prevMsg = history[index - 1]
              if (!prevMsg) return false
              const expectedRole = prevMsg.role === 'user' ? 'model' : 'user'
              return msg.role === expectedRole
            })
          }

          const chat = model.startChat({
            history: history // Use the cleaned history
          })

          // Send the last message
          const lastMessage = messages[messages.length - 1]?.content || 'Hello'
          const result = await chat.sendMessage(lastMessage)
          return result.response.text()
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