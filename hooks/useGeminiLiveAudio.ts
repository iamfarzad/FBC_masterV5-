import { useState, useEffect, useRef, useCallback } from 'react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { connectLive } from '@/src/core/live/client'
import { logTokenUsage } from '@/src/core/token-usage-logger'
import { TokenCostCalculator } from '@/src/core/token-cost-calculator'
import { supabase } from '@/src/core/supabase/client'

// Helper function to estimate tokens (fallback implementation)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Helper function to estimate cost
function estimateCost(inputTokens: number, outputTokens: number): number {
  return TokenCostCalculator.estimateCost('gemini', 'gemini-2.5-flash', inputTokens, outputTokens)
}

interface UseGeminiLiveAudioOptions {
  apiKey: string
  modelName?: string
  onStatusChange?: (status: string) => void
  sessionId?: string
  userId?: string
}

interface AudioValidationResult {
  isValid: boolean
  error?: string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

export function useGeminiLiveAudio({
  apiKey = '', // Will be fetched from server if not provided
  modelName = 'gemini-2.5-flash-native-audio-preview-09-2025',
  onStatusChange,
  sessionId,
  userId
}: UseGeminiLiveAudioOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [correlationId, setCorrelationId] = useState<string>('')
  const sessionRef = useRef<any>(null)
  const audioPlayer = useAudioPlayer()
  const rateLimitRef = useRef<{ count: number; resetTime: number; failures: number }>({
    count: 0,
    resetTime: Date.now(),
    failures: 0
  })

  // Generate correlation ID for structured logging
  const generateCorrelationId = useCallback(() => {
    return `live-audio-${Date.now()}-${Math.random().toString(36).substring(7)}`
  }, [])

  // Validate audio chunk format and size
  const validateAudioChunk = useCallback((audioChunk: ArrayBuffer): AudioValidationResult => {
    try {
      // Check size limits (max 1MB per chunk)
      if (audioChunk.byteLength > 1024 * 1024) {
        return { isValid: false, error: 'Audio chunk too large (max 1MB)' }
      }

      // Check minimum size (at least 100 bytes)
      if (audioChunk.byteLength < 100) {
        return { isValid: false, error: 'Audio chunk too small' }
      }

      // Basic format validation (should be PCM-like data)
      const view = new Uint8Array(audioChunk)
      if (view.length === 0) {
        return { isValid: false, error: 'Empty audio chunk' }
      }

      return { isValid: true }
    } catch (e) {
      return { isValid: false, error: 'Invalid audio format' }
    }
  }, [])

  // Enhanced rate limiting check with circuit breaker
  const checkRateLimit = useCallback(async (): Promise<RateLimitResult> => {
    const now = Date.now()
    const windowMs = 60000 // 1 minute
    const maxRequests = 20
    const maxFailures = 5
    const circuitBreakerThreshold = 3
    const circuitBreakerTimeout = 30000 // 30 seconds

    const rateLimit = rateLimitRef.current

    // Circuit breaker: if too many failures, block requests temporarily
    if (rateLimit.failures >= circuitBreakerThreshold) {
      if (now - rateLimit.resetTime < circuitBreakerTimeout) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: rateLimit.resetTime + circuitBreakerTimeout
        }
      } else {
        // Reset circuit breaker after timeout
        rateLimit.failures = 0
        rateLimit.resetTime = now + windowMs
      }
    }

    // Reset counter if window has passed
    if (now > rateLimit.resetTime) {
      rateLimit.count = 0
      rateLimit.resetTime = now + windowMs
      rateLimit.failures = 0 // Reset failures on new window
    }

    // Check if limit exceeded
    if (rateLimit.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: rateLimit.resetTime
      }
    }

    // Increment counter
    rateLimit.count++

    return {
      allowed: true,
      remaining: maxRequests - rateLimit.count,
      resetTime: rateLimit.resetTime
    }
  }, [])

  // Track failures for circuit breaker
  const recordFailure = useCallback(() => {
    rateLimitRef.current.failures++
    logActivity('warn', 'Connection failure recorded', {
      failureCount: rateLimitRef.current.failures,
      circuitBreakerThreshold: 3
    })
  }, [logActivity])

  // Authentication check
  const authenticateUser = useCallback(async (): Promise<{ success: boolean; userId?: string; error?: string }> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return { success: false, error: 'Authentication required' }
      }

      return { success: true, userId: user.id }
    } catch (e) {
      return { success: false, error: 'Authentication service unavailable' }
    }
  }, [])

  // Fetch ephemeral API key from server with retry logic
  const fetchApiKey = useCallback(async (retryCount = 0): Promise<string> => {
    try {
      const response = await fetch('/api/live/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || response.statusText

        // Retry on rate limit or temporary server errors
        if (response.status === 429 || response.status >= 500) {
          if (retryCount < 2) {
            logActivity('warn', 'Token fetch failed, retrying...', { status: response.status, retryCount })
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
            return fetchApiKey(retryCount + 1)
          }
        }

        throw new Error(`Authentication failed: ${errorMessage}`)
      }

      const { token } = await response.json()
      if (!token) {
        throw new Error('No token returned from server')
      }

      logActivity('info', 'Successfully fetched ephemeral token', { expiresIn: '30 minutes' })
      return token
    } catch (error) {
      console.error('Failed to fetch API key:', error)
      throw error
    }
  }, [sessionId, userId, logActivity])

  // Structured logging
  const logActivity = useCallback((level: 'info' | 'error' | 'warn', message: string, metadata: any = {}) => {
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId,
      sessionId,
      userId,
      model: modelName,
      ...metadata
    }
    
    console.log(JSON.stringify(logData))
    
    // Also log to Supabase if available
    if (correlationId) {
      logTokenUsage({
        model: modelName,
        input_tokens: metadata.inputTokens || 0,
        output_tokens: metadata.outputTokens || 0,
        total_tokens: (metadata.inputTokens || 0) + (metadata.outputTokens || 0),
        estimated_cost: metadata.estimatedCost || 0,
        feature: 'voice-live',
        success: level !== 'error',
        error_message: level === 'error' ? metadata.error : undefined,
        usage_metadata: metadata
      })
    }
  }, [correlationId, sessionId, userId, modelName])

  // Initialize Gemini Live session with proper error handling
  const connect = useCallback(async () => {
    const newCorrelationId = generateCorrelationId()
    setCorrelationId(newCorrelationId)
    
    try {
      onStatusChange?.('connecting')
      logActivity('info', 'Starting Gemini Live session')

      // Secure context check
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        throw new Error('HTTPS required for live audio streaming')
      }

      // Authentication check (optional for demo sessions)
      const auth = await authenticateUser()
      const isAuthenticated = auth.success
      
      // For demo sessions, we don't require authentication
      if (!isAuthenticated && !sessionId) {
        throw new Error('Authentication required for voice features')
      }

      // Rate limiting check
      const rateLimit = await checkRateLimit()
      if (!rateLimit.allowed) {
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds`)
      }

      // Get API key - either from props or fetch from server
      let actualApiKey = apiKey
      if (!actualApiKey) {
        try {
          actualApiKey = await fetchApiKey()
          logActivity('info', 'Fetched ephemeral API key from server')
        } catch (error) {
          throw new Error('No API key available - authentication required')
        }
      }

      // Use the live adapter to connect to Gemini
      const session = await connectLive({
        apiKey: actualApiKey,
        model: modelName,
        config: {
          responseModalities: ['audio', 'text'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Puck' // Changed to Puck as per your server config
              }
            }
          },
          callbacks: {
            onopen: () => {
              setIsConnected(true)
              setError(null)
              onStatusChange?.('connected')
              logActivity('info', 'Gemini Live session connected')
            },
            onmessage: handleMessage,
            onerror: handleError,
            onclose: handleClose
          }
        }
      })
      
      sessionRef.current = session
      
    } catch (e: any) {
      let errorMessage = e.message || 'Failed to connect to Gemini Live'

      // Provide more specific error messages based on the type of error
      if (errorMessage.includes('Authentication failed')) {
        errorMessage = 'Authentication failed - please check your credentials'
        setError('Authentication required. Please sign in to use voice features.')
      } else if (errorMessage.includes('Rate limit exceeded')) {
        errorMessage = 'Rate limit exceeded - please try again later'
        setError('Too many requests. Please wait a moment before trying again.')
      } else if (errorMessage.includes('HTTPS required')) {
        errorMessage = 'Secure connection required for live audio'
        setError('Voice features require a secure HTTPS connection.')
      } else {
        setError(`Connection failed: ${errorMessage}`)
      }

      onStatusChange?.('error')
      logActivity('error', 'Gemini Live connection failed', { error: errorMessage })

      // Fallback to regular TTS endpoint
      logActivity('info', 'Falling back to regular TTS endpoint')
    }
  }, [apiKey, modelName, onStatusChange, authenticateUser, checkRateLimit, logActivity, generateCorrelationId, sessionId])

  // Handle incoming messages from Gemini
  const handleMessage = useCallback((event: any) => {
    try {
      const data = event.data
      if (data.audio) {
        // Convert Base64 to ArrayBuffer
        const binary = atob(data.audio)
        const len = binary.length
        const buffer = new ArrayBuffer(len)
        const view = new Uint8Array(buffer)
        for (let i = 0; i < len; i++) view[i] = binary.charCodeAt(i)
        
        // Play the audio using the audio player's playAudioData method
        audioPlayer.controls.playAudioData(data.audio)
        onStatusChange?.('playing')
        
        logActivity('info', 'Audio response received and playing', {
          audioSize: buffer.byteLength,
          outputTokens: estimateTokens(binary)
        })
      }
    } catch (e: any) {
      logActivity('error', 'Failed to handle audio message', { error: e.message })
      handleError(e)
    }
  }, [audioPlayer, onStatusChange, logActivity])

  // Handle errors with fallback and circuit breaker
  const handleError = useCallback((e: any) => {
    const errorMessage = e.message || 'Unknown error occurred'

    // Record failure for circuit breaker
    recordFailure()

    // Provide user-friendly error messages
    let userMessage = 'Connection error occurred'
    if (errorMessage.includes('quota')) {
      userMessage = 'API quota exceeded. Please try again later.'
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      userMessage = 'Network connection issue. Please check your internet connection.'
    } else if (errorMessage.includes('timeout')) {
      userMessage = 'Connection timed out. Please try again.'
    } else {
      userMessage = 'An unexpected error occurred. Please try again.'
    }

    setError(userMessage)
    onStatusChange?.('error')
    logActivity('error', 'Gemini Live session error', { error: errorMessage, userMessage })

    // Cleanup and fallback
    cleanup()
  }, [onStatusChange, logActivity, recordFailure])

  // Handle session close
  const handleClose = useCallback(() => {
    setIsConnected(false)
    setIsStreaming(false)
    onStatusChange?.('closed')
    logActivity('info', 'Gemini Live session closed')
  }, [onStatusChange, logActivity])

  // Send audio stream with validation and rate limiting
  const sendStream = useCallback(async (audioChunk: ArrayBuffer) => {
    if (!sessionRef.current) {
      logActivity('warn', 'Attempted to send audio without active session')
      return
    }

    try {
      // Validate audio chunk
      const validation = validateAudioChunk(audioChunk)
      if (!validation.isValid) {
        logActivity('error', 'Audio validation failed', { error: validation.error })
        return
      }

      // Rate limiting check
      const rateLimit = await checkRateLimit()
      if (!rateLimit.allowed) {
        logActivity('warn', 'Rate limit exceeded during streaming')
        return
      }

      setIsStreaming(true)
      onStatusChange?.('streaming')
      
      // Convert ArrayBuffer to Base64
      const bytes = new Uint8Array(audioChunk)
      let binary = ''
      for (const b of bytes) binary += String.fromCharCode(b)
      const b64 = btoa(binary)
      
      // Send to Gemini using the live session
      sessionRef.current.sendRealtimeInput({ audio: b64 })
      
      // Log usage
      const tokens = estimateTokens(binary)
      const cost = estimateCost(tokens, 0)
      
      logActivity('info', 'Audio chunk sent successfully', {
        chunkSize: audioChunk.byteLength,
        inputTokens: tokens,
        estimatedCost: cost
      })
      
    } catch (e: any) {
      logActivity('error', 'Failed to send audio stream', { error: e.message })
      handleError(e)
    }
  }, [validateAudioChunk, checkRateLimit, onStatusChange, logActivity, handleError])

  // Cleanup function
  const cleanup = useCallback(() => {
    try {
      if (sessionRef.current) {
        sessionRef.current.close()
        sessionRef.current = null
      }
      
      audioPlayer.controls.stop()
      setIsConnected(false)
      setIsStreaming(false)
      setError(null)
      
      logActivity('info', 'Gemini Live session cleaned up')
    } catch (e: any) {
      logActivity('error', 'Error during cleanup', { error: e.message })
    }
  }, [audioPlayer, logActivity])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    isConnected,
    isStreaming,
    error,
    correlationId,
    hasLiveFallback: !isConnected && error?.includes('HTTPS required'),
    connect,
    sendStream,
    cleanup
  }
}
