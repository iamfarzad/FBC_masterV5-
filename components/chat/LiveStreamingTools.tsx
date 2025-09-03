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
  Eye,
  EyeOff
} from 'lucide-react'

interface LiveStreamingToolsProps {
  onStreamUpdate: (data: any) => void
  conversationId: string
}

export function LiveStreamingTools({ onStreamUpdate, conversationId }: LiveStreamingToolsProps) {
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [isScreenActive, setIsScreenActive] = useState(false)
  const [isAIWatching, setIsAIWatching] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Connect to WebSocket for live streaming
  useEffect(() => {
    if (isAIWatching) {
      const ws = new WebSocket(`ws://localhost:3001`)
      
      ws.onopen = () => {
        console.log('Connected to live streaming server')
        ws.send(JSON.stringify({
          type: 'join',
          conversationId,
          mode: 'vision'
        }))
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'analysis') {
          onStreamUpdate({
            type: 'ai_vision',
            analysis: data.content,
            timestamp: data.timestamp
          })
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      wsRef.current = ws

      return () => {
        ws.close()
      }
    }
  }, [isAIWatching, conversationId, onStreamUpdate])

  // Start webcam live stream
  const startWebcamStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false 
      })
      
      setWebcamStream(stream)
      setIsWebcamActive(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Start sending frames to AI
      startFrameCapture(stream, 'webcam')
      
      onStreamUpdate({
        type: 'webcam_started',
        message: 'Webcam is now live. AI can see you in real-time.'
      })
      
    } catch (error) {
      console.error('Failed to start webcam:', error)
      onStreamUpdate({
        type: 'error',
        message: 'Failed to access webcam'
      })
    }
  }

  // Start screen share live stream
  const startScreenStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: false 
      })
      
      setScreenStream(stream)
      setIsScreenActive(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Start sending frames to AI
      startFrameCapture(stream, 'screen')
      
      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopScreenStream()
      }
      
      onStreamUpdate({
        type: 'screen_started',
        message: 'Screen sharing is live. AI can see your screen in real-time.'
      })
      
    } catch (error) {
      console.error('Failed to start screen share:', error)
      onStreamUpdate({
        type: 'error',
        message: 'Failed to share screen'
      })
    }
  }

  // Capture and send frames continuously
  const startFrameCapture = (stream: MediaStream, source: 'webcam' | 'screen') => {
    if (!canvasRef.current || !videoRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Send frame every 500ms (2 FPS for AI analysis)
    frameIntervalRef.current = setInterval(async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        
        const frameData = canvas.toDataURL('image/jpeg', 0.7)
        
        // Send to AI for analysis
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'frame',
            source,
            data: frameData,
            timestamp: Date.now()
          }))
        }

        // Also send to backend API for processing
        fetch('/api/tools/live-vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source,
            frame: frameData,
            conversationId
          })
        }).then(res => res.json()).then(data => {
          if (data.analysis) {
            onStreamUpdate({
              type: 'frame_analysis',
              source,
              analysis: data.analysis
            })
          }
        }).catch(console.error)
      }
    }, 500) // Send 2 frames per second
  }

  // Stop webcam stream
  const stopWebcamStream = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop())
      setWebcamStream(null)
      setIsWebcamActive(false)
      
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current)
      }
      
      onStreamUpdate({
        type: 'webcam_stopped',
        message: 'Webcam stream ended'
      })
    }
  }

  // Stop screen stream
  const stopScreenStream = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop())
      setScreenStream(null)
      setIsScreenActive(false)
      
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current)
      }
      
      onStreamUpdate({
        type: 'screen_stopped',
        message: 'Screen sharing ended'
      })
    }
  }

  // Toggle AI watching
  const toggleAIWatching = () => {
    setIsAIWatching(!isAIWatching)
    onStreamUpdate({
      type: 'ai_watching',
      enabled: !isAIWatching,
      message: !isAIWatching ? 'AI is now watching the stream' : 'AI stopped watching'
    })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcamStream()
      stopScreenStream()
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Live Preview */}
      <Card className="relative overflow-hidden">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-48 object-cover bg-black"
        />
        <canvas 
          ref={canvasRef}
          className="hidden"
        />
        {!isWebcamActive && !isScreenActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-white text-sm">No active stream</p>
          </div>
        )}
        {isAIWatching && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs">
            <Eye className="h-3 w-3" />
            AI Watching
          </div>
        )}
      </Card>

      {/* Stream Controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={isWebcamActive ? "destructive" : "default"}
          size="sm"
          onClick={isWebcamActive ? stopWebcamStream : startWebcamStream}
          className="justify-start gap-2"
        >
          {isWebcamActive ? (
            <>
              <VideoOff className="h-4 w-4" />
              Stop Webcam
            </>
          ) : (
            <>
              <Video className="h-4 w-4" />
              Start Webcam
            </>
          )}
        </Button>

        <Button
          variant={isScreenActive ? "destructive" : "default"}
          size="sm"
          onClick={isScreenActive ? stopScreenStream : startScreenStream}
          className="justify-start gap-2"
        >
          {isScreenActive ? (
            <>
              <StopCircle className="h-4 w-4" />
              Stop Screen
            </>
          ) : (
            <>
              <MonitorUp className="h-4 w-4" />
              Share Screen
            </>
          )}
        </Button>
      </div>

      {/* AI Control */}
      <Button
        variant={isAIWatching ? "secondary" : "outline"}
        size="sm"
        onClick={toggleAIWatching}
        className="w-full justify-center gap-2"
        disabled={!isWebcamActive && !isScreenActive}
      >
        {isAIWatching ? (
          <>
            <EyeOff className="h-4 w-4" />
            AI Stop Watching
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            Enable AI Vision
          </>
        )}
      </Button>

      {/* Status */}
      {(isWebcamActive || isScreenActive) && (
        <Alert>
          <AlertDescription className="text-xs">
            {isWebcamActive && 'Webcam is streaming live to AI. '}
            {isScreenActive && 'Screen is being shared with AI. '}
            {isAIWatching && 'AI is analyzing frames in real-time.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}