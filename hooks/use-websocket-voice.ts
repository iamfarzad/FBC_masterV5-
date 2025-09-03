import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

interface VoiceSession {
  connectionId: string
  isActive: boolean
  languageCode?: string
  voiceName?: string
  leadContext?: {
    name?: string
    company?: string
    role?: string
    interests?: string
  }
}

type QueuedAudioItem = string | { data: string; mimeType?: string }

interface UsageMetadata {
  totalTokenCount: number
  responseTokensDetails: Array<{
    modality: string
    tokenCount: number
  }>
}

interface WebSocketVoiceHook {
  session: VoiceSession | null
  isConnected: boolean
  isProcessing: boolean
  error: string | null
  transcript: string
  audioQueue: QueuedAudioItem[]
  usageMetadata: UsageMetadata | null
  startSession: (leadContext?: unknown) => Promise<void>
  stopSession: () => void
  sendMessage: (message: string) => Promise<void>
  playNextAudio: () => void
  onAudioChunk: (chunk: ArrayBuffer) => void
  onTurnComplete: () => void
  sendImageFrame: (dataUrl: string, type?: 'webcam' | 'screen' | 'upload') => void
}

export function useWebSocketVoice(): WebSocketVoiceHook {
  const { toast } = useToast()
  
  // All useState hooks first - maintain consistent order
  const [session, setSession] = useState<VoiceSession | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [audioQueue, setAudioQueue] = useState<QueuedAudioItem[]>([])
  const [usageMetadata, setUsageMetadata] = useState<UsageMetadata | null>(null)
  
  // All useRef hooks second - maintain consistent order
  const sessionIdRef = useRef<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const isPlayingRef = useRef(false)
  
  // All useCallback hooks third - maintain consistent order
  const startSession = useCallback(async (leadContext?: unknown) => {
    try {
      setError(null)
      setIsConnected(false)
      
      const sessionId = `voice_${Date.now()}`
      sessionIdRef.current = sessionId
      
      const response = await fetch('/api/gemini-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          sessionId,
          leadContext
        })
      })

      if (!response.ok) {
        throw new Error(`Live API failed: ${response.status}`)
      }

      const result = await response.json()
      
      setIsConnected(true)
      setSession({
        connectionId: sessionId,
        isActive: true,
        languageCode: 'en-US',
        voiceName: 'Puck'
      })
      setIsProcessing(true)
      
    } catch (error: any) {
      setError(`Failed to start voice session: ${error.message}`)
      setIsConnected(false)
      setIsProcessing(false)
    }
  }, [])

  const stopSession = useCallback(() => {
    if (sessionIdRef.current) {
      fetch('/api/gemini-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          sessionId: sessionIdRef.current
        })
      }).catch(console.error)
    }
    
    setIsConnected(false)
    setSession(null)
    setIsProcessing(false)
    sessionIdRef.current = null
  }, [])

  const sendMessage = useCallback(async (message: string) => {
    if (!sessionIdRef.current) {
      throw new Error('No active session')
    }
    
    const response = await fetch('/api/gemini-live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        sessionId: sessionIdRef.current,
        message
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`)
    }
  }, [])

  const onAudioChunk = useCallback((chunk: ArrayBuffer) => {
    if (!sessionIdRef.current) return
    
    // Convert audio chunk to base64
    const uint8Array = new Uint8Array(chunk)
    const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('')
    const base64Audio = btoa(binaryString)
    
    // Send to Live API
    fetch('/api/gemini-live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        sessionId: sessionIdRef.current,
        audioData: base64Audio,
        mimeType: 'audio/wav'
      })
    }).catch(console.error)
  }, [])

  const onTurnComplete = useCallback(() => {
    // Signal end of user turn
    if (sessionIdRef.current) {
      fetch('/api/gemini-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          sessionId: sessionIdRef.current,
          message: '[TURN_COMPLETE]'
        })
      }).catch(console.error)
    }
  }, [])

  const playNextAudio = useCallback(() => {
    if (!isPlayingRef.current && audioQueue.length > 0) {
      const nextAudio = audioQueue[0]
      setAudioQueue(prev => prev.slice(1))
      
      if (typeof nextAudio === 'string') {
        // Play audio using Web Audio API
        try {
          const audio = new Audio(`data:audio/wav;base64,${nextAudio}`)
          audio.play().catch(console.error)
        } catch (error) {
          console.error('Failed to play audio:', error)
        }
      }
    }
  }, [audioQueue])

  const sendImageFrame = useCallback((dataUrl: string, type?: 'webcam' | 'screen' | 'upload') => {
    if (!sessionIdRef.current) return
    
    // Extract base64 data from data URL
    const base64Data = dataUrl.split(',')[1]
    const mimeType = dataUrl.split(';')[0].split(':')[1]
    
    fetch('/api/gemini-live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        sessionId: sessionIdRef.current,
        imageData: base64Data,
        mimeType
      })
    }).catch(console.error)
  }, [])

  // Single useEffect for cleanup
  useEffect(() => {
    return () => {
      if (sessionIdRef.current) {
        stopSession()
      }
    }
  }, [])

  return {
    session,
    isConnected,
    isProcessing,
    error,
    transcript,
    audioQueue,
    usageMetadata,
    startSession,
    stopSession,
    sendMessage,
    playNextAudio,
    onAudioChunk,
    onTurnComplete,
    sendImageFrame
  }
}