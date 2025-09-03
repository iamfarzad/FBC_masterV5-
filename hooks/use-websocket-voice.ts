import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

// WebSocket URL will be configured in the connectWebSocket function

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
  // Callbacks for voice recorder integration
  onAudioChunk: (chunk: ArrayBuffer) => void
  onTurnComplete: () => void
  sendImageFrame: (dataUrl: string, type?: 'webcam' | 'screen' | 'upload') => void
}

export function useWebSocketVoice(): WebSocketVoiceHook {
  const { toast } = useToast()
  const VOICE_BY_LANG: Record<string, string> = {
    'en-US': 'Puck',
    'en-GB': 'Puck',
    'nb-NO': 'Puck',
    'sv-SE': 'Puck',
    'de-DE': 'Puck',
    'es-ES': 'Puck',
  }
  const [session, setSession] = useState<VoiceSession | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState<string>('')
  const transcriptRef = useRef<string>('')
  const [error, setError] = useState<string | null>(null)
  const [audioQueue, setAudioQueue] = useState<QueuedAudioItem[]>([])
  const [usageMetadata, setUsageMetadata] = useState<UsageMetadata | null>(null)
  const [currentTurn, setCurrentTurn] = useState<{ inputPartials: string[]; inputFinal?: string; outputText?: string; completed: boolean }>({ inputPartials: [], completed: false })
  
  const wsRef = useRef<WebSocket | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioStreamRef = useRef<MediaStream | null>(null)
  const reconnectingRef = useRef(false)
  const messageQueueRef = useRef<string[]>([])
  const preferredLanguageRef = useRef<string>('en-US')
  // Track whether we've issued a start message for the current socket
  const sentStartRef = useRef<boolean>(false)
  // Guard to avoid sending audio before Gemini session is active
  const sessionActiveRef = useRef<boolean>(false)

  function detectLangBCP47Client(s: string): string {
    if (/[æøå]/i.test(s)) return 'nb-NO'
    if (/[äöüß]/i.test(s)) return 'de-DE'
    if (/[áéíóúñ]/i.test(s)) return 'es-ES'
    return 'en-US'
  }

  // Keep a ref of the latest transcript for out-of-react event dispatch
  useEffect(() => {
    transcriptRef.current = transcript
  }, [transcript])

  // Log mount/unmount once (avoid logging on every render)
  useEffect(() => {
    // Action logged
    return () => {
      // Action logged ---')
    }
  }, [])

  async function maybeRotateLanguage(finalText: string) {
    const detected = detectLangBCP47Client(finalText)
    const current = session?.languageCode || preferredLanguageRef.current || 'en-US'
    if (detected !== current) {
      preferredLanguageRef.current = detected
      try { stopSession() } catch {}
      // Only reconnect if not already connected/connecting - prevent connection storm
      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        setTimeout(() => connectWebSocket(), 100) // Small delay to prevent rapid reconnections
      }
    }
  }

  // Audio playback context and playing state
  const audioContextRef = useRef<AudioContext | null>(null)
  const isPlayingRef = useRef(false)

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      })
    }
    
    // Resume context if suspended (needed for autoplay)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    return audioContextRef.current
  }, [])

  // Declare playAudio and playNextAudio functions as refs to ensure stable references across renders
  // This prevents them from being re-created constantly and breaking useEffect/useCallback dependencies
  const playAudioRef = useRef((base64Audio: string, mimeType: string) => {})
  const playNextAudioRef = useRef(() => {})

  // Play next audio from queue (defined first)
  playNextAudioRef.current = useCallback(() => {
    if (!isPlayingRef.current && audioQueue.length > 0) {
      const nextAudio = audioQueue[0]
      setAudioQueue(prev => prev.slice(1))
      
      // Handle both string (base64) and object formats
      if (typeof nextAudio === 'string') {
        // Legacy format - assume PCM at 24kHz
        playAudioRef.current(nextAudio, 'audio/pcm;rate=24000')
      } else if (nextAudio && typeof nextAudio === 'object' && 'data' in nextAudio) {
        // New format with mimeType
        playAudioRef.current((nextAudio as any).data, (nextAudio as any).mimeType || 'audio/pcm;rate=24000')
      }
    }
  }, [audioQueue]) // playAudioRef.current is stable, so not a dependency

  // Audio playback logic (depends on playNextAudio, so defined after it is stable)
  playAudioRef.current = useCallback(async (base64Audio: string, mimeType: string) => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      initAudioContext();
    }
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    try {
      isPlayingRef.current = true;

      const bytes = new Uint8Array(atob(base64Audio).split('').map(char => char.charCodeAt(0)));
      const float32 = new Float32Array(bytes.length / 2);
      const dataView = new DataView(bytes.buffer);

      for (let i = 0; i < bytes.length; i += 2) {
        float32[i / 2] = dataView.getInt16(i, true) / 32768;
      }

      const sampleRate = mimeType?.includes('rate=16000') ? 16000 : 24000;
      const audioBuffer = audioContextRef.current!.createBuffer(1, float32.length, sampleRate);
      audioBuffer.getChannelData(0).set(float32);

      const source = audioContextRef.current!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current!.destination);
      source.onended = () => {
        isPlayingRef.current = false;
        playNextAudioRef.current();
      };
      source.start(0);
    } catch (error) {
    console.error('Error playing PCM audio', error)
      isPlayingRef.current = false;
      playNextAudioRef.current();
    }
  }, [initAudioContext]);

  // Gemini Live API Direct Mode Configuration
  // Set NEXT_PUBLIC_GEMINI_DIRECT=1 to use direct Live API (bypasses proxy WS)
  // This enables full Gemini Live API compliance with proper VAD, token counting, and modalities
  const connectWebSocket = useCallback(() => {
    // FIRST check if already connected/connecting BEFORE setting reconnecting flag
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      console.log('🔍 [DEBUG] WebSocket already connected/connecting, skipping')
      return
    }
    
    if (reconnectingRef.current) {
      console.log('🔍 [DEBUG] Already reconnecting, skipping')
      return
    }
    reconnectingRef.current = true

    // Cleanup old WebSocket before creating a new one
    if (wsRef.current) {
      try {
        wsRef.current.onopen = null
        wsRef.current.onmessage = null
        wsRef.current.onerror = null
        wsRef.current.onclose = null
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          console.log('🔍 [DEBUG] Closing existing WebSocket before creating new one')
          wsRef.current.close(1000, 'Recreating connection')
        }
      } catch (e) {
        // Warning log removed - could add proper error handling here
      }
      wsRef.current = null
    }

    const useDirect = process.env.NEXT_PUBLIC_GEMINI_DIRECT === '1'
    if (useDirect) {
      // Direct Gemini path is handled by the startSession step; skip WS proxy creation here.
      reconnectingRef.current = false
      return
    }

    // Simplified WebSocket URL resolution - always use localhost:3001 for development
    let wsUrl: string
    try {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname
        const isReplit = hostname.includes('replit.dev')
        
        if (isReplit || hostname === 'localhost' || hostname === '127.0.0.1') {
          // For Replit: Use the external WebSocket endpoint through the proxy
          wsUrl = `wss://${hostname}/api/gemini-live`
        } else if (process.env.NEXT_PUBLIC_LIVE_SERVER_URL) {
          // Production mode: use environment variable
          wsUrl = process.env.NEXT_PUBLIC_LIVE_SERVER_URL
        } else {
          // Fallback
          wsUrl = `ws://${window.location.hostname}:5000`
        }
      } else {
        // SSR fallback - will be replaced client-side
        wsUrl = 'ws://localhost:5000'
      }
    } catch (e) {
      // Error fallback
      wsUrl = 'ws://localhost:5000'
    }
    console.log('🔍 [DEBUG] WebSocket URL:', wsUrl)
    
    // Set initial state to connecting
    setIsConnected(false)
    setError(null)
    setSession(null) // Clear previous session info

    let ws: WebSocket
    try {
      ws = new WebSocket(wsUrl)
      wsRef.current = ws
      // Action logged
      // Reset start flag for this fresh socket
      sentStartRef.current = false
      sessionActiveRef.current = false
    } catch (error) {
    console.error('❌ [useWebSocketVoice] Failed to create WebSocket', error)
      setError(`Failed to create WebSocket connection: ${error instanceof Error ? error.message : 'Unknown error'}`)
      reconnectingRef.current = false
      return
    }

    ws.onopen = () => {
      // Action logged
      setIsConnected(true)
      setError(null)
      reconnectingRef.current = false

      // Flush any queued non-audio messages immediately; defer audio until session is active
      if (messageQueueRef.current.length > 0) {
        const remaining: string[] = []
        while (messageQueueRef.current.length > 0) {
          const queuedMessage = messageQueueRef.current.shift()
          if (!queuedMessage) continue
          try {
            const parsed = JSON.parse(queuedMessage)
            // Defer 'user_audio' frames until we have session_started
            if (parsed?.type === 'user_audio') {
              remaining.push(queuedMessage)
            } else {
              ws.send(queuedMessage)
              // Action logged
            }
          } catch {
            // If parsing fails, send as-is
            ws.send(queuedMessage)
            // Action logged message')
          }
        }
        // Put back deferred audio frames
        messageQueueRef.current.push(...remaining)
      }
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        // Action logged
        // Action logged

        switch (message.type) {
          case 'connected':
            // Action logged
            break
          case 'session_started':
            // Action logged
            if (message.payload && message.payload.connectionId) {
              setSession({
                connectionId: message.payload.connectionId,
                isActive: true,
                languageCode: message.payload.languageCode,
                voiceName: message.payload.voiceName,
              })
            } else {
              console.error('Session started message missing payload or connectionId:', message)
              setSession({
                connectionId: 'fallback-connection',
                isActive: true,
                languageCode: 'en-US',
                voiceName: 'Puck',
              })
            }
            sessionActiveRef.current = true
            // Flush any queued audio frames now that session is active
            try {
              const toSend: string[] = []
              const keep: string[] = []
              while (messageQueueRef.current.length > 0) {
                const q = messageQueueRef.current.shift()!
                try {
                  const parsed = JSON.parse(q)
                  if (parsed?.type === 'user_audio') toSend.push(q)
                  else keep.push(q)
                } catch {
                  keep.push(q)
                }
              }
              for (const q of toSend) wsRef.current?.send(q)
              // Put back any non-audio messages that were not sent
              if (keep.length) messageQueueRef.current.push(...keep)
            } catch (e) {
              // Warning log removed - could add proper error handling here
            }
            break
          case 'session_ended':
            // Action logged
            setSession(prev => prev ? { ...prev, isActive: false } : null)
            sessionActiveRef.current = false
            break
          case 'transcript':
            // Action logged
            setTranscript(message.payload?.text || '')
            break
          case 'audio_response':
            // Handle Puck's voice response - exactly like Google AI Studio Live
            if (message.payload?.audioData) {
              const audioData = message.payload.audioData
              const mimeType = message.payload.mimeType || 'audio/wav'
              
              // Convert base64 audio to playable format
              const audioUrl = `data:${mimeType};base64,${audioData}`
              
              // Create and play audio element
              const audio = new Audio(audioUrl)
              audio.play().catch(error => {
                console.error('Failed to play Puck voice response:', error)
              })
              
              // Add to audio queue for UI feedback
              setAudioQueue(prev => [...prev, audioData])
            }
            break
          case 'text_response':
            // Handle text responses from Gemini Live
            if (message.payload?.text) {
              setTranscript(prev => prev + ' ' + message.payload.text)
            }
            break
          case 'session_closed':
            // Server notifies that the upstream Gemini session ended. Stop treating session as active.
            // Action logged
            sessionActiveRef.current = false
            setSession(prev => prev ? { ...prev, isActive: false } : null)
            // Do not flush queued audio until a new explicit start
            break
          case 'error':
            // Error: [useWebSocketVoice] Server error
            setError(message.payload.message || 'Unknown server error')
            break
          default:
            // Action logged
        }
      } catch (error) {
    console.error('[useWebSocketVoice] Failed to parse message', error)
      }
    }

    ws.onerror = (error) => {
      // Error: ❌ [useWebSocketVoice] WebSocket error
      setError('WebSocket connection error')
      reconnectingRef.current = false
    }

    ws.onclose = (event) => {
      console.log('🔍 [DEBUG] WebSocket closed:', { code: event.code, reason: event.reason })
      setIsConnected(false)
      setSession(null)
      reconnectingRef.current = false
      sessionActiveRef.current = false
      
      // Show error message for premature closes but DON'T auto-reconnect
      if (event.code !== 1000 && event.code !== 1001) {
        setError('❌ WebSocket connection failed. Please try again.')
        console.log('🔍 [DEBUG] Connection failed - auto-reconnect disabled to prevent loops')
        // No auto-reconnect - user must manually retry
      }
    }
  }, []) // Remove all dependencies to prevent infinite re-renders

  // Initial session setup (not auto-connect)
  const startSession = useCallback(async (leadContext?: unknown) => {
    try {
      setError(null)
      
      const useDirect = process.env.NEXT_PUBLIC_GEMINI_DIRECT === '1'
      if (useDirect) {
        // Direct Live API session using ephemeral token
        try {
          const res = await fetch('/api/live/token', { method: 'POST', cache: 'no-store' })
          if (!res.ok) throw new Error(`Token endpoint failed: ${res.status}`)
          const { token } = await res.json()
          if (!token) throw new Error('No token returned')

          const { GoogleGenAI, Modality } = await import('@google/genai')
          const ai = new GoogleGenAI({ apiKey: token })
          const model = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-live-2.5-flash-preview-native-audio'

          const responseQueue: unknown[] = []
          function onmessage(message: unknown) {
            responseQueue.push(message)

            // Handle usage metadata for token counting
            if (message?.usageMetadata) {
              const usage = message.usageMetadata
              setUsageMetadata({
                totalTokenCount: usage.totalTokenCount || 0,
                responseTokensDetails: usage.responseTokensDetails || []
              })
            }

            // Text stream
            const text = message?.serverContent?.modelTurn?.parts?.[0]?.text
            if (text) setTranscript(prev => prev + text)

            // Audio stream - AI can talk back
            const inline = message?.serverContent?.modelTurn?.parts?.find((p: unknown) => p.inlineData?.data)
            if (inline?.inlineData?.data) {
              setAudioQueue(prev => [...prev, { data: inline.inlineData.data, mimeType: 'audio/pcm;rate=24000' }])
              playNextAudioRef.current()
            }
          }

          const session = await (ai as any).live.connect({
            model,
            config: {
              responseModalities: [Modality.AUDIO], // Can only set ONE modality per session
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Puck'
                  }
                }
              },
              // Automatic Voice Activity Detection (VAD) configuration
              realtimeInputConfig: {
                automaticActivityDetection: {
                  disabled: false, // Enable automatic VAD
                  startOfSpeechSensitivity: 'START_SENSITIVITY_LOW', // More sensitive to speech start
                  endOfSpeechSensitivity: 'END_SENSITIVITY_LOW', // More sensitive to speech end
                  prefixPaddingMs: 20, // Add 20ms before detected speech
                  silenceDurationMs: 100, // 100ms silence to end speech
                }
              },
              // Media resolution for video input
              mediaResolution: 'MEDIA_RESOLUTION_LOW', // Low resolution for faster processing
            },
            callbacks: {
              onopen: () => {
                setIsConnected(true)
                setSession({ connectionId: 'direct', isActive: true })
              },
              onmessage,
              onerror: (e: unknown) => setError(`Gemini error: ${e?.message || 'unknown'}`),
              onclose: () => setIsConnected(false),
            },
          })

          // Stash the session instance on wsRef to reuse send paths
          // @ts-ignore
          wsRef.current = session as unknown as WebSocket
          setIsProcessing(true)
          return
        } catch (e: unknown) {
          setError(e?.message || 'Failed to start direct Gemini session')
          throw e
        }
      }

      // Proxy WS path
      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        // Action logged...')
        connectWebSocket()
      } else if (wsRef.current.readyState === WebSocket.CONNECTING) {
        // Action logged
      } else if (wsRef.current.readyState === WebSocket.OPEN) {
        // Action logged
      }

      // Wait for connection to open with better error handling
      const connectionStartTime = Date.now();
      const connectionTimeout = 10000; // Increased to 10 seconds
      let lastState = wsRef.current?.readyState;

      return new Promise<void>((resolve, reject) => {
        const checkConnection = () => {
          const currentState = wsRef.current?.readyState;
          
          // Log state changes for debugging
          if (currentState !== lastState) {
            const stateText = currentState !== undefined
              ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][currentState]
              : 'UNKNOWN';
            // Log removed
            lastState = currentState;
          }

          if (currentState === WebSocket.OPEN) {
            // If an immediate start was already sent on open, skip duplicate
            if (!sentStartRef.current) {
              // Action logged
              const message = { type: 'start', payload: { leadContext, languageCode: preferredLanguageRef.current } }
              wsRef.current!.send(JSON.stringify(message))
              sentStartRef.current = true
              setIsProcessing(true)
              // Action logged
            } else {
              // Action logged
            }
            resolve()
            return
          }

          if (currentState === WebSocket.CLOSED) {
            const errorMsg = 'WebSocket closed before connection could be established.'
            console.error(`❌ [useWebSocketVoice] ${errorMsg}`)
            setError(errorMsg)
            reject(new Error(errorMsg))
            return
          }

          if (Date.now() - connectionStartTime > connectionTimeout) {
            const errorMsg = `WebSocket connection timed out after ${connectionTimeout/1000}s. Current state: ${['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][currentState || 3]}`
            console.error(`❌ [useWebSocketVoice] ${errorMsg}`)
            setError('WebSocket connection timed out.')
            reject(new Error(errorMsg))
            return
          }

          // Continue checking
          setTimeout(checkConnection, 100)
        }

        checkConnection()
      })

    } catch (error) {
    console.error('❌ [useWebSocketVoice] Error in startSession', error)
      setIsConnected(false)
      setIsProcessing(false)
      
      if (error instanceof Error) {
        toast({
          title: "Session Start Failed",
          description: error.message,
          variant: "destructive"
        })
      }
      throw error
    }
  }, [toast])

  const stopSession = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      // Action logged
      wsRef.current.close(1000, "User initiated close") // Explicitly send normal closure code
      setSession(null)
      setIsConnected(false)
      setIsProcessing(false)
      setError(null)
      setAudioQueue([])
      setTranscript('')
      setUsageMetadata(null) // Clear usage metadata on session end
    }
  }, [])

  const sendMessage = useCallback(async (message: string) => {
    const payload = JSON.stringify({ type: 'user_message', payload: { message } })
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Action logged
      wsRef.current.send(payload)
    } else {
      // Warning log removed - could add proper error handling here
      messageQueueRef.current.push(payload)
      if (!reconnectingRef.current) {
        connectWebSocket() // Try reconnecting if not already doing so
      }
    }
  }, [connectWebSocket])

  // Callback for voice recorder - properly encode audio data as base64
  const onAudioChunk = useCallback((audioData: ArrayBuffer) => {
    // Convert ArrayBuffer to base64 string
    let binary = '';
    const bytes = new Uint8Array(audioData);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64Audio = btoa(binary);
    
    // If using direct Gemini Live session, send via session API instead of WS
    const isDirect = process.env.NEXT_PUBLIC_GEMINI_DIRECT === '1'
    const sessionLike: unknown = wsRef.current as unknown
    if (isDirect && sessionLike && typeof sessionLike.sendRealtimeInput === 'function') {
      try {
        sessionLike.sendRealtimeInput({
          audio: { data: base64Audio, mimeType: 'audio/pcm;rate=16000' },
        })
      } catch (e) {
    console.error('[useWebSocketVoice] Failed to send audio chunk via direct session', error)
      }
      return
    }
    
    const payload = JSON.stringify({
      type: 'user_audio',
      payload: { 
        audioData: base64Audio,
        mimeType: 'audio/pcm;rate=16000'
      }
    })
    
    const isOpen = wsRef.current?.readyState === WebSocket.OPEN
    const isReady = sessionActiveRef.current === true
    if (isOpen && isReady) {
      // Action logged
      wsRef.current!.send(payload)
    } else {
      const why = !isOpen ? 'WebSocket not open' : 'Session not ready (awaiting session_started)'
      // Warning log removed - could add proper error handling here
      messageQueueRef.current.push(payload)
      // Do not reconnect aggressively from audio-path; startSession will manage connection
    }
  }, []) // Remove connectWebSocket dependency

  // Callback for voice recorder - signal turn complete
  const onTurnComplete = useCallback(() => {
    // If using direct Gemini Live session, send turnComplete directly
    const isDirect = process.env.NEXT_PUBLIC_GEMINI_DIRECT === '1'
    const sessionLike: unknown = wsRef.current as any
    if (isDirect && sessionLike && typeof sessionLike.sendRealtimeInput === 'function') {
      try {
        sessionLike.sendRealtimeInput({ turnComplete: true })
      } catch (e) {
    console.error('[useWebSocketVoice] Failed to send TURN_COMPLETE via direct session', error)
      }
      return
    }
    
    const payload = JSON.stringify({
      type: 'TURN_COMPLETE',
      payload: {}
    })
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Action logged
      wsRef.current.send(payload)
    } else {
      // Warning log removed - could add proper error handling here
      messageQueueRef.current.push(payload)
      // Don't auto-reconnect here to prevent infinite loops
    }
  }, []) // Remove connectWebSocket dependency

  // Send an image frame over the same WS/live session (mock-friendly)
  const sendImageFrame = useCallback((dataUrl: string, type: 'webcam' | 'screen' | 'upload' = 'upload') => {
    try {
      if (!dataUrl || typeof dataUrl !== 'string') return
      const isDirect = process.env.NEXT_PUBLIC_GEMINI_DIRECT === '1'
      const base64 = dataUrl.startsWith('data:') ? dataUrl.split(',')[1] : dataUrl
      const mime = dataUrl.startsWith('data:') ? (dataUrl.substring(5, dataUrl.indexOf(';')) || 'image/jpeg') : 'image/jpeg'

      const sessionLike: unknown = wsRef.current as any
      if (isDirect && sessionLike && typeof sessionLike.sendRealtimeInput === 'function') {
        try {
          sessionLike.sendRealtimeInput({
            // Some SDKs require turning images into clientContent turns; this direct path is best-effort
            inlineData: { mimeType: mime, data: base64 }
          })
        } catch (e) {
          // Warning log removed - could add proper error handling here
        }
        return
      }

      const payload = JSON.stringify({ type: 'user_image', payload: { imageData: base64, mimeType: mime, sourceType: type } })
      const isOpen = wsRef.current?.readyState === WebSocket.OPEN
      const isReady = sessionActiveRef.current === true
      if (isOpen && isReady) wsRef.current!.send(payload)
      else messageQueueRef.current.push(payload)
    } catch (e) {
      // Warning log removed - could add proper error handling here
    }
  }, [])

  // Cleanup marker (do not auto-close socket to avoid StrictMode/FastRefresh loops)
  useEffect(() => {
    return () => {
      // Action logged ---')
    }
  }, [])

  return {
    session,
    isConnected,
    isProcessing,
    error,
    transcript,
    audioQueue,
    usageMetadata, // Token usage tracking
    startSession,
    stopSession,
    sendMessage,
    playNextAudio: playNextAudioRef.current, // Expose the stable ref
    // Callbacks for voice recorder integration
    onAudioChunk,
    onTurnComplete,
    sendImageFrame,
  }
}
