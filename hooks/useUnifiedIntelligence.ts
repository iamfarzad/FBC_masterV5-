
import { useState, useCallback, useEffect, useRef } from 'react'
import { useCommonPatterns } from './useCommonPatterns'

interface IntelligenceContext {
  lead: { email: string; name: string }
  company?: {
    name: string
    size: string
    domain: string
    summary: string
    website: string
    industry: string
    linkedin: string
  }
  person?: {
    role: string
    company: string
    fullName: string
    seniority: string
    profileUrl: string
  }
  role?: string
  roleConfidence?: number
  intent?: { type: string; confidence: number; slots: unknown }
  capabilities: string[]
}

interface MultimodalCapabilities {
  voice: boolean
  webcam: boolean
  screen: boolean
  text: boolean
}

// Centralized cache with TTL
const INTELLIGENCE_CACHE = new Map<string, { data: IntelligenceContext; timestamp: number }>()
const CACHE_TTL = 30_000 // 30 seconds
const INFLIGHT_REQUESTS = new Map<string, Promise<IntelligenceContext | null>>()

export function useUnifiedIntelligence() {
  const [context, setContext] = useState<IntelligenceContext | null>(null)
  const [multimodalCapabilities, setMultimodalCapabilities] = useState<MultimodalCapabilities>({
    voice: false,
    webcam: false,
    screen: false,
    text: true
  })
  
  const { isLoading, error, startLoading, stopLoading } = useCommonPatterns.useLoadingState()
  const sessionIdRef = useRef<string | null>(null)
  const lastFetchedRef = useRef<string | null>(null)

  // Get session ID
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return null
    if (!sessionIdRef.current) {
      sessionIdRef.current = localStorage.getItem('intelligence-session-id')
    }
    return sessionIdRef.current
  }, [])

  // Check cache validity
  const getCachedContext = useCallback((sessionId: string): IntelligenceContext | null => {
    const cached = INTELLIGENCE_CACHE.get(sessionId)
    if (!cached) return null
    
    const now = Date.now()
    if (now - cached.timestamp > CACHE_TTL) {
      INTELLIGENCE_CACHE.delete(sessionId)
      return null
    }
    
    return cached.data
  }, [])

  // Set cache
  const setCachedContext = useCallback((sessionId: string, data: IntelligenceContext) => {
    INTELLIGENCE_CACHE.set(sessionId, {
      data,
      timestamp: Date.now()
    })
  }, [])

  // Fetch context with deduplication
  const fetchContext = useCallback(async (
    sessionId: string,
    options: { force?: boolean } = {}
  ): Promise<IntelligenceContext | null> => {
    if (!sessionId) return null

    // Check cache first
    if (!options.force) {
      const cached = getCachedContext(sessionId)
      if (cached) {
        setContext(cached)
        return cached
      }
    }

    // Check for inflight request
    const existingRequest = INFLIGHT_REQUESTS.get(sessionId)
    if (existingRequest && !options.force) {
      return existingRequest
    }

    // Create new request
    const request = (async () => {
      try {
        startLoading()
        
        const response = await fetch(
          `/api/intelligence/context?sessionId=${sessionId}`,
          { cache: 'no-store' }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch intelligence context')
        }
        
        const rawData = await response.json()
        const data = (rawData?.output || rawData) as IntelligenceContext
        
        // Update state and cache
        setContext(data)
        setCachedContext(sessionId, data)
        lastFetchedRef.current = sessionId
        
        return data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch context'
        stopLoading(errorMessage)
        throw err
      } finally {
        stopLoading()
        INFLIGHT_REQUESTS.delete(sessionId)
      }
    })()

    INFLIGHT_REQUESTS.set(sessionId, request)
    return request
  }, [getCachedContext, setCachedContext, startLoading, stopLoading])

  // Initialize session
  const initializeSession = useCallback(async (input: {
    sessionId: string
    email: string
    name?: string
    companyUrl?: string
  }) => {
    try {
      startLoading()
      
      const response = await fetch('/api/intelligence/session-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      
      if (!response.ok) {
        throw new Error('Failed to initialize session')
      }
      
      const context = await response.json()
      setContext(context)
      setCachedContext(input.sessionId, context)
      sessionIdRef.current = input.sessionId
      
      return context
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize session'
      stopLoading(errorMessage)
      throw err
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading, setCachedContext])

  // Update multimodal capability
  const setCapability = useCallback((capability: keyof MultimodalCapabilities, enabled: boolean) => {
    setMultimodalCapabilities(prev => ({
      ...prev,
      [capability]: enabled
    }))
  }, [])

  // Get capability status
  const getCapabilityStatus = useCallback(() => {
    const activeCapabilities = Object.entries(multimodalCapabilities)
      .filter(([_, enabled]) => enabled)
      .map(([capability, _]) => capability)

    if (activeCapabilities.length === 0) return 'Text only'
    if (activeCapabilities.length === 1) return `${activeCapabilities[0]} active`
    if (activeCapabilities.length === 2) return `${activeCapabilities.join(' + ')} active`
    return `Full multimodal (${activeCapabilities.join(' + ')})`
  }, [multimodalCapabilities])

  // Generate personalized greeting
  const generateGreeting = useCallback((ctx: IntelligenceContext | null = context): string => {
    if (!ctx) return "Hi! I'm here to help you explore AI capabilities. What would you like to work on today?"

    const { company, person, role, roleConfidence } = ctx

    if (roleConfidence && roleConfidence >= 0.7 && company && person) {
      return `Hi ${person.fullName} at ${company.name}! As ${role}, I can help you explore AI capabilities for your ${company.industry?.toLowerCase() || 'business'}. What would you like to work on today?`
    }
    
    if (company && person) {
      return `Hi ${person.fullName} at ${company.name}! I can help you explore AI capabilities for your ${company.industry?.toLowerCase() || 'business'}. What would you like to work on today?`
    }
    
    if (person) {
      return `Hi ${person.fullName}! I'm here to help you explore AI capabilities. What would you like to work on today?`
    }
    
    return "Hi! I'm here to help you explore AI capabilities. What would you like to work on today?"
  }, [context])

  // Clear cache
  const clearCache = useCallback((sessionId?: string) => {
    if (sessionId) {
      INTELLIGENCE_CACHE.delete(sessionId)
      INFLIGHT_REQUESTS.delete(sessionId)
    } else {
      INTELLIGENCE_CACHE.clear()
      INFLIGHT_REQUESTS.clear()
    }
  }, [])

  // Fetch context from stored session
  const fetchFromStoredSession = useCallback(async (options?: { force?: boolean }) => {
    const sessionId = getSessionId()
    if (sessionId) {
      return await fetchContext(sessionId, options)
    }
    return null
  }, [getSessionId, fetchContext])

  // Auto-fetch on mount
  useEffect(() => {
    fetchFromStoredSession()
  }, [fetchFromStoredSession])

  return {
    // State
    context,
    isLoading,
    error,
    multimodalCapabilities,
    
    // Session management
    getSessionId,
    initializeSession,
    fetchContext,
    fetchFromStoredSession,
    clearCache,
    
    // Multimodal capabilities
    setCapability,
    getCapabilityStatus,
    
    // Utilities
    generateGreeting,
    
    // Computed state
    hasContext: !!context,
    hasError: !!error,
    isMultimodal: Object.values(multimodalCapabilities).filter(Boolean).length > 1
  }
}
