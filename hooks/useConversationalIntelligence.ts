// NOTE: This file defines a single export below. Do not duplicate the hook.

import { useState, useCallback, useRef, useEffect } from 'react'

export interface IntelligenceContext {
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

// --- Client-side request de-dupe + TTL cache ---
// Prevents repeated fetches that inflate API cost when multiple components mount/rerender.
const INFLIGHT = new Map<string, Promise<void>>()
const LAST_FETCH_AT = new Map<string, number>()
const TTL_MS_DEFAULT = 30_000 // 30s; adjust via fetchContext({ ttlMs })

function jsonHash(o: unknown): string {
  try { return JSON.stringify(o) } catch { return '' }
}

export function useConversationalIntelligence() {
  const [context, setContext] = useState<IntelligenceContext | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastSessionIdRef = useRef<string | null>(null)
  const lastHashRef = useRef<string | null>(null)

  // Multimodal state tracking
  const [activeModalities, setActiveModalities] = useState<{
    voice: boolean
    webcam: boolean
    screen: boolean
    text: boolean
  }>({
    voice: false,
    webcam: false,
    screen: false,
    text: true // Text is always available
  })

  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('intelligence-session-id')
  }, [])

  /**
   * Fetch context once per TTL per session, with in-flight coalescing.
   * Pass { force: true } to ignore TTL. Pass { ttlMs } to override TTL.
   */
  const fetchContext = useCallback(
    async (
      sessionId: string,
      opts?: { force?: boolean; ttlMs?: number }
    ): Promise<void> => {
      if (!sessionId) return
      const ttlMs = opts?.ttlMs ?? TTL_MS_DEFAULT
      const now = Date.now()
      const lastAt = LAST_FETCH_AT.get(sessionId) || 0

      // TTL guard
      if (!opts?.force && now - lastAt < ttlMs) return

      // If a request is already in-flight for this session, reuse it
      const inflight = INFLIGHT.get(sessionId)
      if (inflight) return inflight

      setIsLoading(true)
      setError(null)

      const p = (async () => {
        try {
          // Always avoid browser cache for correctness; TTL handles throttling
          const response = await fetch(`/api/intelligence/context?sessionId=${sessionId}`, { cache: 'no-store' })
          if (!response.ok) throw new Error('Failed to fetch context')
          const raw = await response.json()
          const data = (raw?.output || raw) as IntelligenceContext

          // Skip state update if content is unchanged to avoid extra rerenders
          const h = jsonHash(data)
          if (lastHashRef.current !== h) {
            setContext(data)
            lastHashRef.current = h
          }

          LAST_FETCH_AT.set(sessionId, Date.now())
          lastSessionIdRef.current = sessionId
        } catch (err) {
          setError('Failed to fetch context')
          // Error: Context fetch error
        } finally {
          setIsLoading(false)
          INFLIGHT.delete(sessionId)
        }
      })()

      INFLIGHT.set(sessionId, p)
      return p
    },
    []
  )

  const generatePersonalizedGreeting = useCallback((ctx: IntelligenceContext | null): string => {
    if (!ctx) return "Hi! I'm here to help you explore AI capabilities. What would you like to work on today?"

    const { company, person, role, roleConfidence } = ctx
    const industry = company?.industry ? company.industry.toLowerCase() : undefined

    if (roleConfidence && roleConfidence >= 0.7 && company && person) {
      return `Hi ${person.fullName} at ${company.name}! As ${role}, I can help you explore AI capabilities for your ${industry ?? 'business'}. What would you like to work on today?`
    }
    if (company && person) {
      return `Hi ${person.fullName} at ${company.name}! I can help you explore AI capabilities for your ${industry ?? 'business'}. What would you like to work on today?`
    }
    if (person) {
      return `Hi ${person.fullName}! I'm here to help you explore AI capabilities. What would you like to work on today?`
    }
    return "Hi! I'm here to help you explore AI capabilities. What would you like to work on today?"
  }, [])

  /** Optional convenience: fetch once using stored session id with TTL **/
  const fetchContextFromLocalSession = useCallback(async (opts?: { force?: boolean; ttlMs?: number }) => {
    const sid = getSessionId()
    if (sid) await fetchContext(sid, opts)
  }, [getSessionId, fetchContext])

  /** Allow manual cache reset (e.g., after consent or stage change) **/
  const clearContextCache = useCallback((sessionId?: string) => {
    if (sessionId) {
      LAST_FETCH_AT.delete(sessionId)
      INFLIGHT.delete(sessionId)
    } else if (lastSessionIdRef.current) {
      LAST_FETCH_AT.delete(lastSessionIdRef.current)
      INFLIGHT.delete(lastSessionIdRef.current)
    }
  }, [])

  /** Update active modality state **/
  const setModalityActive = useCallback((modality: keyof typeof activeModalities, active: boolean) => {
    setActiveModalities(prev => ({
      ...prev,
      [modality]: active
    }))
  }, [])

  /** Send real-time voice input through unified multimodal system **/
  const sendRealtimeVoice = useCallback(async (
    transcription: string,
    audioData: string,
    duration: number,
    streamId?: string
  ): Promise<boolean> => {
    if (!getSessionId()) return false

    try {
      const response = await fetch('/api/multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modality: 'realtime-voice',
          content: transcription,
          metadata: {
            sessionId: getSessionId(),
            transcription,
            fileData: audioData, // base64 audio data
            duration,
            streamId,
            isStreaming: true
          }
        })
      })

      if (!response.ok) {
        console.error('Failed to send real-time voice')
        return false
      }

      const result = await response.json()
      console.log('Real-time voice sent successfully:', result)
      return true

    } catch (error) {
      console.error('Real-time voice send error:', error)
      return false
    }
  }, [getSessionId])

  /** Initialize real-time voice session **/
  const initializeRealtimeVoice = useCallback(async (
    leadContext?: IntelligenceContext['company']
  ): Promise<boolean> => {
    const sessionId = getSessionId()
    if (!sessionId) return false

    try {
      const response = await fetch('/api/gemini-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          sessionId,
          leadContext: leadContext ? {
            name: leadContext.name,
            email: leadContext && typeof leadContext === 'object' && 'email' in leadContext ? (leadContext as { email: string }).email : '',
            company: leadContext && typeof leadContext === 'object' && 'company' in leadContext ? (leadContext as { company: string }).company : '',
            role: leadContext && typeof leadContext === 'object' && 'role' in leadContext ? (leadContext as { role: string }).role : ''
          } : undefined
        })
      })

      if (!response.ok) {
        console.error('Failed to initialize real-time voice session')
        return false
      }

      const result = await response.json()
      console.log('Real-time voice session initialized:', result)
      return result.success === true

    } catch (error) {
      console.error('Real-time voice initialization error:', error)
      return false
    }
  }, [getSessionId])

  /** End real-time voice session **/
  const endRealtimeVoice = useCallback(async (): Promise<boolean> => {
    const sessionId = getSessionId()
    if (!sessionId) return false

    try {
      const response = await fetch('/api/gemini-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          sessionId
        })
      })

      const result = await response.json()
      console.log('Real-time voice session ended:', result)
      return result.success === true

    } catch (error) {
      console.error('Real-time voice end error:', error)
      return false
    }
  }, [getSessionId])

  /** Get multimodal status description **/
  const getMultimodalStatus = useCallback(() => {
    const active = Object.entries(activeModalities)
      .filter(([_, isActive]) => isActive)
      .map(([modality, _]) => modality)

    if (active.length === 0) return 'Text chat only'
    if (active.length === 1) return `${active[0]} active`
    if (active.length === 2) return `${active.join(' + ')} active`
    return `Full multimodal (${active.join(' + ')})`
  }, [activeModalities])

  /** Update multimodal capabilities in intelligence context **/
  const updateMultimodalCapabilities = useCallback(async (
    sessionId: string,
    modalities: {
      voice?: boolean
      webcam?: boolean
      screen?: boolean
      text?: boolean
    }
  ): Promise<void> => {
    try {
      const activeCapabilities: string[] = []

      // Add multimodal capabilities
      if (modalities.voice) activeCapabilities.push('voice')
      if (modalities.webcam) activeCapabilities.push('webcam')
      if (modalities.screen) activeCapabilities.push('screen-share')
      if (modalities.text) activeCapabilities.push('text-chat')

      // Add combined multimodal capabilities
      const activeModalities = Object.values(modalities).filter(Boolean)
      if (activeModalities.length > 1) {
        activeCapabilities.push('multimodal')
      }

      if (activeModalities.length === 3) {
        activeCapabilities.push('full-multimodal')
      }

      // Update context with new capabilities
      const currentContext = context
      if (currentContext) {
        const updatedContext = {
          ...currentContext,
          capabilities: activeCapabilities
        }
        setContext(updatedContext)
      }

      // Optionally persist to backend (for session continuity)
      // await fetch(`/api/intelligence/capabilities`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ sessionId, capabilities: activeCapabilities })
      // })

    } catch (error) {
      console.error('Failed to update multimodal capabilities:', error)
    }
  }, [context])

  // Auto-update capabilities when modalities change
  useEffect(() => {
    const sessionId = getSessionId()
    if (sessionId) {
      updateMultimodalCapabilities(sessionId, activeModalities)
    }
  }, [activeModalities, getSessionId, updateMultimodalCapabilities])

  return {
    context,
    isLoading,
    error,
    getSessionId,
    fetchContext,
    fetchContextFromLocalSession,
    clearContextCache,
    generatePersonalizedGreeting,
    updateMultimodalCapabilities,
    // Multimodal state management
    activeModalities,
    setModalityActive,
    getMultimodalStatus,
    // Real-time voice integration
    sendRealtimeVoice,
    initializeRealtimeVoice,
    endRealtimeVoice
  }
}
