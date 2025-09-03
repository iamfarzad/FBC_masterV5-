'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react'
import { GeminiLiveClient } from '@/lib/gemini-live-client'

interface GeminiLiveChatProps {
  onUpdate: (data: any) => void
}

export function GeminiLiveChat({ onUpdate }: GeminiLiveChatProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [activeStreams, setActiveStreams] = useState({
    webcam: false,
    screen: false,
    microphone: false,
    audio: true
  })
  
  const clientRef = useRef<GeminiLiveClient | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Connect to Gemini Live API
  const connect = async () => {
    try {
      setIsConnecting(true)
      
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
      const client = new GeminiLiveClient(apiKey)
      
      // Set up event handlers
      client.onTextResponse = (text) => {
        onUpdate({
          type: 'ai_text',
          content: text,
          timestamp: new Date().toISOString()
        })
      }
      
      client.onAudioResponse = (audio, mimeType) => {
        if (activeStreams.audio) {
          // Audio is automatically played by the client
          onUpdate({
            type: 'ai_audio',
            message: 'AI is speaking...'
          })
        }
      }
      
      client.onToolCall = (tool) => {
        onUpdate({
          type: 'tool_call',
          tool
        })
      }
      
      client.onTurnComplete = () => {
        onUpdate({
          type: 'turn_complete',
          message: 'AI finished responding'
        })
      }
      
      // Connect to Gemini Live
      await client.connect({
        model: 'gemini-2.0-flash-exp',
        systemInstruction: `You are a helpful AI assistant with live vision and audio capabilities. 
          When the user shares their webcam or screen, you can see what they're showing you in real-time.
          Describe what you see, provide helpful feedback, and engage in natural conversation.
          Be conversational, friendly, and helpful.`,
        tools: [
          { googleSearch: {} }
        ]
      })
      
      clientRef.current = client
      setIsConnected(true)
      
      onUpdate({
        type: 'connected',
        message: 'Connected to Gemini Live API - Ready for real-time interaction!'
      })
      
    } catch (error) {
      console.error('Failed to connect:', error)
      onUpdate({
        type: 'error',
        message: 'Failed to connect to Gemini Live API. Check your API key.'
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // Start webcam with audio
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true 
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      // Start streaming video and audio to Gemini
      if (clientRef.current) {
        const videoCleanup = await clientRef.current.startVideoStream(stream)
        const audioCleanup = await clientRef.current.startAudioStream(stream)
        
        cleanupRef.current = () => {
          videoCleanup()
          audioCleanup()
        }
        
        // Tell AI what's happening
        clientRef.current.sendText("I'm sharing my webcam with you. You can now see and hear me. What do you see?")
      }
      
      setActiveStreams(prev => ({
        ...prev,
        webcam: true,
        microphone: true
      }))
      
      onUpdate({
        type: 'webcam_started',
        message: 'Webcam and microphone are live. AI can see and hear you!'
      })
      
    } catch (error) {
      console.error('Webcam error:', error)
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
          cursor: 'always'
        },
        audio: false 
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      // Start streaming screen to Gemini
      if (clientRef.current) {
        const cleanup = await clientRef.current.startVideoStream(stream)
        cleanupRef.current = cleanup
        
        // Tell AI what's happening
        clientRef.current.sendText("I'm sharing my screen with you. Please describe what you see and provide any helpful feedback.")
      }
      
      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopStream()
      }
      
      setActiveStreams(prev => ({
        ...prev,
        screen: true
      }))
      
      onUpdate({
        type: 'screen_started',
        message: 'Screen sharing is live. AI can see your screen!'
      })
      
    } catch (error) {
      console.error('Screen share error:', error)
      onUpdate({
        type: 'error',
        message: 'Failed to share screen'
      })
    }
  }

  // Stop all streams
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setActiveStreams(prev => ({
      ...prev,
      webcam: false,
      screen: false,
      microphone: false
    }))
    
    if (clientRef.current && isConnected) {
      clientRef.current.sendText("I've stopped sharing my camera/screen.")
    }
    
    onUpdate({
      type: 'stream_stopped',
      message: 'Stopped sharing'
    })
  }

  // Toggle audio output
  const toggleAudio = () => {
    setActiveStreams(prev => ({
      ...prev,
      audio: !prev.audio
    }))
  }

  // Disconnect
  const disconnect = () => {
    stopStream()
    
    if (clientRef.current) {
      clientRef.current.disconnect()
      clientRef.current = null
    }
    
    setIsConnected(false)
    
    onUpdate({
      type: 'disconnected',
      message: 'Disconnected from Gemini Live'
    })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream()
      if (clientRef.current) {
        clientRef.current.disconnect()
      }
    }
  }, [])

  return (
    <div className="space-y-3">
      {/* Live Preview */}
      <Card className="relative overflow-hidden bg-black">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-40 object-cover"
        />
        {!activeStreams.webcam && !activeStreams.screen && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/50 text-xs">No active stream</p>
          </div>
        )}
        
        {/* Status badges */}
        <div className="absolute top-1 right-1 flex gap-1">
          {isConnected && (
            <Badge variant="default" className="text-xs py-0 h-5">
              <Sparkles className="h-3 w-3 mr-1" />
              Live
            </Badge>
          )}
          {activeStreams.webcam && (
            <Badge variant="destructive" className="text-xs py-0 h-5">
              <Video className="h-3 w-3" />
            </Badge>
          )}
          {activeStreams.microphone && (
            <Badge variant="destructive" className="text-xs py-0 h-5">
              <Mic className="h-3 w-3" />
            </Badge>
          )}
        </div>
      </Card>

      {/* Controls */}
      {!isConnected ? (
        <Button
          onClick={connect}
          disabled={isConnecting}
          className="w-full h-8 text-xs"
          size="sm"
        >
          {isConnecting ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3 mr-1" />
          )}
          Connect Gemini Live
        </Button>
      ) : (
        <div className="space-y-2">
          {/* Stream buttons */}
          <div className="grid grid-cols-2 gap-1">
            <Button
              variant={activeStreams.webcam ? "destructive" : "default"}
              size="sm"
              onClick={activeStreams.webcam ? stopStream : startWebcam}
              disabled={activeStreams.screen}
              className="h-7 text-xs"
            >
              {activeStreams.webcam ? (
                <>
                  <VideoOff className="h-3 w-3 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Video className="h-3 w-3 mr-1" />
                  Webcam
                </>
              )}
            </Button>

            <Button
              variant={activeStreams.screen ? "destructive" : "default"}
              size="sm"
              onClick={activeStreams.screen ? stopStream : startScreenShare}
              disabled={activeStreams.webcam}
              className="h-7 text-xs"
            >
              {activeStreams.screen ? (
                <>
                  <StopCircle className="h-3 w-3 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <MonitorUp className="h-3 w-3 mr-1" />
                  Screen
                </>
              )}
            </Button>
          </div>

          {/* Audio toggle and disconnect */}
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAudio}
              className="flex-1 h-7 text-xs"
            >
              {activeStreams.audio ? (
                <>
                  <Volume2 className="h-3 w-3 mr-1" />
                  Audio On
                </>
              ) : (
                <>
                  <VolumeX className="h-3 w-3 mr-1" />
                  Audio Off
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={disconnect}
              className="h-7 text-xs px-2"
            >
              Disconnect
            </Button>
          </div>
        </div>
      )}

      {/* Help text */}
      {isConnected && (
        <p className="text-xs text-muted-foreground text-center">
          AI can {activeStreams.webcam ? 'see and hear you' : activeStreams.screen ? 'see your screen' : 'hear you'}
        </p>
      )}
    </div>
  )
}