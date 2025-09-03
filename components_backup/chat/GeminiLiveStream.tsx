'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Camera, 
  Monitor,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  StopCircle,
  Loader2,
  Sparkles
} from 'lucide-react'

interface GeminiLiveStreamProps {
  onUpdate: (data: any) => void
}

export function GeminiLiveStream({ onUpdate }: GeminiLiveStreamProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [isScreenActive, setIsScreenActive] = useState(false)
  const [isMicActive, setIsMicActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  // Initialize Gemini Live connection using WebRTC
  const initializeGeminiLive = async () => {
    try {
      setIsProcessing(true)
      
      // Create WebSocket connection to Gemini Live API endpoint
      const ws = new WebSocket(process.env.NEXT_PUBLIC_LIVE_SERVER_URL || 'wss://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent')
      
      ws.onopen = () => {
        console.log('Connected to Gemini Live API')
        setIsConnected(true)
        
        // Send initial configuration
        ws.send(JSON.stringify({
          setup: {
            model: 'models/gemini-2.0-flash-exp',
            generation_config: {
              response_modalities: ['audio', 'text'],
              speech_config: {
                voice_config: {
                  prebuilt_voice_config: {
                    voice_name: 'Aoede'
                  }
                }
              }
            },
            system_instruction: {
              parts: [{
                text: 'You are a helpful AI assistant with live vision capabilities. You can see the user through their webcam or screen share in real-time. Describe what you see and provide helpful feedback.'
              }]
            },
            tools: []
          }
        }))
        
        onUpdate({
          type: 'gemini_connected',
          message: 'Connected to Gemini Live API'
        })
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.serverContent) {
          // Handle AI responses
          if (data.serverContent.modelTurn) {
            const parts = data.serverContent.modelTurn.parts
            parts.forEach((part: any) => {
              if (part.text) {
                onUpdate({
                  type: 'ai_response',
                  content: part.text,
                  timestamp: new Date().toISOString()
                })
              }
              if (part.inlineData) {
                // Audio response from AI
                onUpdate({
                  type: 'ai_audio',
                  audio: part.inlineData.data,
                  mimeType: part.inlineData.mimeType
                })
              }
            })
          }
        }
        
        if (data.toolCall) {
          // Handle tool calls from AI
          onUpdate({
            type: 'tool_call',
            tool: data.toolCall
          })
        }
      }

      ws.onerror = (error) => {
        console.error('Gemini Live error:', error)
        setIsConnected(false)
        onUpdate({
          type: 'error',
          message: 'Connection error with Gemini Live'
        })
      }

      ws.onclose = () => {
        console.log('Disconnected from Gemini Live')
        setIsConnected(false)
        onUpdate({
          type: 'gemini_disconnected',
          message: 'Disconnected from Gemini Live'
        })
      }

      wsRef.current = ws
      
      // Initialize WebRTC peer connection for media streaming
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })
      
      pc.onicecandidate = (event) => {
        if (event.candidate && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            candidate: event.candidate
          }))
        }
      }
      
      pcRef.current = pc
      
    } catch (error) {
      console.error('Failed to initialize Gemini Live:', error)
      onUpdate({
        type: 'error',
        message: 'Failed to connect to Gemini Live API'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Start webcam stream
  const startWebcamStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true 
      })
      
      mediaStreamRef.current = stream
      setIsWebcamActive(true)
      setIsMicActive(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Add tracks to WebRTC connection
      if (pcRef.current) {
        stream.getTracks().forEach(track => {
          pcRef.current!.addTrack(track, stream)
        })
      }

      // Send live video/audio to Gemini
      sendMediaToGemini(stream, 'webcam')
      
      onUpdate({
        type: 'webcam_started',
        message: 'Webcam and microphone are now live with Gemini'
      })
      
    } catch (error) {
      console.error('Failed to start webcam:', error)
      onUpdate({
        type: 'error',
        message: 'Failed to access webcam/microphone'
      })
    }
  }

  // Start screen share
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: false 
      })
      
      mediaStreamRef.current = stream
      setIsScreenActive(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Add video track to WebRTC
      if (pcRef.current) {
        const videoTrack = stream.getVideoTracks()[0]
        pcRef.current.addTrack(videoTrack, stream)
      }

      // Send screen to Gemini
      sendMediaToGemini(stream, 'screen')
      
      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopStream()
      }
      
      onUpdate({
        type: 'screen_started',
        message: 'Screen sharing with Gemini Live API'
      })
      
    } catch (error) {
      console.error('Failed to share screen:', error)
      onUpdate({
        type: 'error',
        message: 'Failed to share screen'
      })
    }
  }

  // Send media stream to Gemini Live
  const sendMediaToGemini = (stream: MediaStream, source: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return
    }

    // For video streams, capture frames and send
    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack) {
      const canvas = document.createElement('canvas')
      const video = document.createElement('video')
      video.srcObject = new MediaStream([videoTrack])
      video.play()

      const captureFrame = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0)
            
            // Convert to base64 and send to Gemini
            canvas.toBlob((blob) => {
              if (blob) {
                const reader = new FileReader()
                reader.onloadend = () => {
                  const base64 = reader.result?.toString().split(',')[1]
                  if (base64 && wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                      realtimeInput: {
                        mediaChunks: [{
                          mimeType: 'image/jpeg',
                          data: base64
                        }]
                      }
                    }))
                  }
                }
                reader.readAsDataURL(blob)
              }
            }, 'image/jpeg', 0.8)
          }
        }
      }

      // Send frames at 2 FPS
      const intervalId = setInterval(captureFrame, 500)
      
      // Store interval for cleanup
      videoTrack.onended = () => {
        clearInterval(intervalId)
      }
    }

    // For audio streams, send audio chunks
    const audioTrack = stream.getAudioTracks()[0]
    if (audioTrack) {
      const mediaRecorder = new MediaRecorder(new MediaStream([audioTrack]), {
        mimeType: 'audio/webm'
      })
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64 = reader.result?.toString().split(',')[1]
            if (base64 && wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                realtimeInput: {
                  mediaChunks: [{
                    mimeType: 'audio/webm',
                    data: base64
                  }]
                }
              }))
            }
          }
          reader.readAsDataURL(event.data)
        }
      }
      
      mediaRecorder.start(100) // Send audio chunks every 100ms
      
      audioTrack.onended = () => {
        mediaRecorder.stop()
      }
    }
  }

  // Stop all streams
  const stopStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    
    setIsWebcamActive(false)
    setIsScreenActive(false)
    setIsMicActive(false)
    
    onUpdate({
      type: 'stream_stopped',
      message: 'All streams stopped'
    })
  }

  // Disconnect from Gemini Live
  const disconnect = () => {
    stopStream()
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Live Preview */}
      <Card className="relative overflow-hidden bg-black">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-48 object-cover"
        />
        {!isWebcamActive && !isScreenActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/60 text-sm">No active stream</p>
          </div>
        )}
        {isConnected && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs">
            <Sparkles className="h-3 w-3" />
            Gemini Live
          </div>
        )}
      </Card>

      {/* Connection Control */}
      {!isConnected ? (
        <Button
          onClick={initializeGeminiLive}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Connect to Gemini Live
        </Button>
      ) : (
        <>
          {/* Stream Controls */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={isWebcamActive ? "destructive" : "default"}
              size="sm"
              onClick={isWebcamActive ? stopStream : startWebcamStream}
              disabled={isScreenActive}
            >
              {isWebcamActive ? (
                <>
                  <VideoOff className="h-4 w-4 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-1" />
                  Webcam
                </>
              )}
            </Button>

            <Button
              variant={isScreenActive ? "destructive" : "default"}
              size="sm"
              onClick={isScreenActive ? stopStream : startScreenShare}
              disabled={isWebcamActive}
            >
              {isScreenActive ? (
                <>
                  <StopCircle className="h-4 w-4 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <MonitorUp className="h-4 w-4 mr-1" />
                  Screen
                </>
              )}
            </Button>
          </div>

          {/* Disconnect Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={disconnect}
            className="w-full"
          >
            Disconnect from Gemini Live
          </Button>
        </>
      )}

      {/* Status */}
      {isConnected && (
        <Alert>
          <AlertDescription className="text-xs">
            <strong>Gemini Live Connected</strong>
            {isWebcamActive && ' • Webcam streaming'}
            {isScreenActive && ' • Screen sharing'}
            {isMicActive && ' • Microphone active'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}