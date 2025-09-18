"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Camera, CameraOff, Mic, MicOff, Circle, Square, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useUnifiedChatActionsContext } from '@/src/core/chat/unified-chat-context'

import type { WebcamCaptureProps } from "./WebcamCapture.types"



export function WebcamCapture({
  mode: _mode = 'card',
  onCapture,
  onClose,
  onCancel: _onCancel,
  onAIAnalysis: _onAIAnalysis,
  onLog: _onLog,
}: WebcamCaptureProps) {
  const chatActions = useUnifiedChatActionsContext()
  // Intelligence context integration
  const sessionId = typeof window !== 'undefined' ? (localStorage?.getItem('intelligence-session-id') || '') : ''
  const { toast } = useToast()
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const [stream, setStream] = useState<MediaStream | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsVideoOn(true)
      setIsAudioOn(true)
    } catch {
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }, [toast])

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsVideoOn(false)
    setIsAudioOn(false)
  }

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioOn(audioTrack.enabled)
      }
    }
  }



  const startRecording = () => {
    if (!stream) return

    const mediaRecorder = new MediaRecorder(stream)
    const chunks: BlobPart[] = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `recording-${Date.now()}.webm`
      a.click()
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
    setRecordingTime(0)

    recordingInterval.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
      }
    }
  }

  const takeScreenshot = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext("2d")

    if (ctx) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      // Get image data for AI analysis
      const imageData = canvas.toDataURL("image/jpeg", 0.8)

      // Send to AI for analysis using the direct API (working approach)
      if (sessionId) {
        try {
          const response = await fetch('/api/tools/webcam', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-intelligence-session-id': sessionId,
            },
            body: JSON.stringify({
              image: imageData,
              type: 'webcam',
            }),
          })

          if (response.ok) {
            const analysis = await response.json()
            const analysisText = analysis?.output?.analysis || 'Image analysis completed'
            toast({
              title: "AI Analysis Complete",
              description: analysisText.slice(0, 100) + (analysisText.length > 100 ? '...' : ''),
            })
            _onAIAnalysis?.(analysisText)
            chatActions?.addMessage({
              role: 'assistant',
              content: `📸 **Webcam Analysis**\\n\\n${analysisText}`,
              timestamp: new Date(),
              type: 'multimodal',
              metadata: { source: 'webcam-analysis' },
            })
          } else {
            // Handle API errors properly
            const errorText = await response.text()
            const errorMessage = `API Error ${response.status}: ${errorText}`
            console.error('Webcam API error:', errorMessage)
            
            toast({
              title: "Webcam Analysis Failed",
              description: `Error ${response.status}: ${response.statusText}`,
              variant: "destructive"
            })
            
            chatActions?.addMessage({
              role: 'assistant',
              content: `📸 **Webcam Analysis Failed**\\n\\n${errorMessage}`,
              timestamp: new Date(),
              type: 'multimodal',
              metadata: { source: 'webcam-analysis', error: true },
            })
          }
        } catch (error) {
          console.error('AI analysis failed:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          
          toast({
            title: "Webcam Analysis Failed",
            description: errorMessage,
            variant: "destructive"
          })
          
          chatActions?.addMessage({
            role: 'assistant',
            content: `📸 **Webcam Analysis Failed**\\n\\n${errorMessage}`,
            timestamp: new Date(),
            type: 'multimodal',
            metadata: { source: 'webcam-analysis', error: true },
          })
        }
      } else {
        // No session ID - show error
        toast({
          title: "Webcam Analysis Failed",
          description: "No session ID found. Please refresh the page.",
          variant: "destructive"
        })
        
        chatActions?.addMessage({
          role: 'assistant',
          content: `📸 **Webcam Analysis Failed**\\n\\nNo session ID found. Please refresh the page.`,
          timestamp: new Date(),
          type: 'multimodal',
          metadata: { source: 'webcam-analysis', error: true },
        })
      }

      // Download the screenshot
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `webcam-screenshot-${Date.now()}.png`
          a.click()

          // Trigger onCapture callback
          onCapture?.(imageData)
        }
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Auto-start camera on mount
  useEffect(() => {
    if (!stream) {
      void startCamera()
    }
  }, [stream, startCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
      }
    }
  }, [stream])

  return (
    <div className="relative size-full overflow-hidden bg-black">
      {/* Enhanced Video Preview with Gradient Overlay */}
      {isVideoOn && stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="size-full object-cover"
          />
          {/* Subtle gradient overlay for better text readability */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </>
      ) : (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CameraOff className="mx-auto mb-6 size-20 text-gray-500 drop-shadow-lg" />
              <h3 className="mb-2 text-xl font-semibold text-white">Camera is off</h3>
              <p className="text-gray-400">Enable camera to start capturing</p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Enhanced Recording Badge - Top-left corner */}
      {isRecording && (
        <motion.div
          className="absolute left-6 top-6 z-10"
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="glass-card flex items-center gap-2 border-red-500/30 px-4 py-2">
            <motion.div
              className="size-3 rounded-full bg-error"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
            <span className="text-sm font-semibold text-error">
              Recording {formatTime(recordingTime)}
            </span>
          </div>
        </motion.div>
      )}

      {/* Enhanced Toolbar (Bottom Center) */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 transform"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
      >
        <div className="glass-card shadow-luxe flex items-center gap-3 px-6 py-4">
          {/* Mic Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isAudioOn ? "glass" : "destructive"}
              size="icon"
              onClick={toggleAudio}
              className="hover-scale size-14 rounded-full shadow-md"
            >
              <motion.div
                animate={isAudioOn ? { rotate: 0 } : { rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.3 }}
              >
                {isAudioOn ? <Mic className="size-6" /> : <MicOff className="size-6" />}
              </motion.div>
            </Button>
          </motion.div>

          {/* Camera Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isVideoOn ? "glass" : "destructive"}
              size="icon"
              onClick={toggleVideo}
              className="hover-scale size-14 rounded-full shadow-md"
            >
              <motion.div
                animate={isVideoOn ? { rotate: 0 } : { rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.3 }}
              >
                {isVideoOn ? <Camera className="size-6" /> : <CameraOff className="size-6" />}
              </motion.div>
            </Button>
          </motion.div>

          {/* Screenshot Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="luxe"
              size="icon"
              onClick={takeScreenshot}
              className="size-14 rounded-full shadow-glow hover:shadow-glow"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Camera className="size-6" />
              </motion.div>
            </Button>
          </motion.div>

          {/* Record / Stop Recording Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isRecording ? "destructive" : "luxe"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              className={`size-16 rounded-full shadow-lg ${isRecording ? 'animate-pulse shadow-red-500/50' : 'hover:shadow-glow'}`}
            >
              <motion.div
                animate={isRecording ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 1, repeat: isRecording ? Infinity : 0, ease: "easeInOut" }}
              >
                {isRecording ? <Square className="size-7" /> : <Circle className="size-7" />}
              </motion.div>
            </Button>
          </motion.div>

          {/* Enhanced Close Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="hover-scale border-border/50 hover:bg-surface-elevated/50 size-14 rounded-full backdrop-blur-sm hover:border-border"
            >
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X className="size-6" />
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Hidden Canvas - For capturing screenshots */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
