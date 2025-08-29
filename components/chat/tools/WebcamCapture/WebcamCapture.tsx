"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Camera, CameraOff, Mic, MicOff, Circle, Square, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

import type { WebcamCaptureProps } from "./WebcamCapture.types"



export function WebcamCapture({
  mode: _mode = 'card',
  onCapture,
  onClose,
  onCancel: _onCancel,
  onAIAnalysis: _onAIAnalysis,
  onLog: _onLog,
}: WebcamCaptureProps) {
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

      // Send to AI for analysis if sessionId is available
      if (sessionId && _onAIAnalysis) {
        try {
          const response = await fetch('/api/intelligence/analyze-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-intelligence-session-id': sessionId,
            },
            body: JSON.stringify({
              imageData,
              context: 'webcam_screenshot',
              timestamp: Date.now(),
            }),
          })

          if (response.ok) {
            const analysis = await response.json()
            toast({
              title: "AI Analysis Complete",
              description: `Analysis: ${analysis.summary || 'Image processed successfully'}`,
            })
            _onAIAnalysis(analysis)
          }
        } catch (error) {
          console.error('AI analysis failed:', error)
        }
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
    <div className="h-full w-full bg-black relative overflow-hidden">
      {/* Enhanced Video Preview with Gradient Overlay */}
      {isVideoOn && stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {/* Subtle gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CameraOff className="w-20 h-20 mx-auto mb-6 text-gray-500 drop-shadow-lg" />
              <h3 className="text-xl font-semibold text-white mb-2">Camera is off</h3>
              <p className="text-gray-400">Enable camera to start capturing</p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Enhanced Recording Badge - Top-left corner */}
      {isRecording && (
        <motion.div
          className="absolute top-6 left-6 z-10"
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="glass-card px-4 py-2 flex items-center gap-2 border-red-500/30">
            <motion.div
              className="w-3 h-3 bg-error rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
            <span className="text-error font-semibold text-sm">
              🔴 Recording {formatTime(recordingTime)}
            </span>
          </div>
        </motion.div>
      )}

      {/* Enhanced Toolbar (Bottom Center) */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
      >
        <div className="glass-card px-6 py-4 flex items-center gap-3 shadow-luxe">
          {/* Mic Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isAudioOn ? "glass" : "destructive"}
              size="icon"
              onClick={toggleAudio}
              className="hover-scale rounded-full w-14 h-14 shadow-md"
            >
              <motion.div
                animate={isAudioOn ? { rotate: 0 } : { rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.3 }}
              >
                {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </motion.div>
            </Button>
          </motion.div>

          {/* Camera Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isVideoOn ? "glass" : "destructive"}
              size="icon"
              onClick={toggleVideo}
              className="hover-scale rounded-full w-14 h-14 shadow-md"
            >
              <motion.div
                animate={isVideoOn ? { rotate: 0 } : { rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.3 }}
              >
                {isVideoOn ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
              </motion.div>
            </Button>
          </motion.div>

          {/* Screenshot Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="luxe"
              size="icon"
              onClick={takeScreenshot}
              className="rounded-full w-14 h-14 shadow-glow hover:shadow-glow"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Camera className="w-6 h-6" />
              </motion.div>
            </Button>
          </motion.div>

          {/* Record / Stop Recording Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isRecording ? "destructive" : "luxe"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              className={`rounded-full w-16 h-16 shadow-lg ${isRecording ? 'animate-pulse shadow-red-500/50' : 'hover:shadow-glow'}`}
            >
              <motion.div
                animate={isRecording ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 1, repeat: isRecording ? Infinity : 0, ease: "easeInOut" }}
              >
                {isRecording ? <Square className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
              </motion.div>
            </Button>
          </motion.div>

          {/* Enhanced Close Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="hover-scale rounded-full w-14 h-14 border-border/50 hover:border-border hover:bg-surface-elevated/50 backdrop-blur-sm"
            >
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
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
