"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Monitor, X, Activity, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ScreenShareProps {
  onClose: () => void
  onAnalysis?: (analysis: string) => void
}

export function ScreenShare({ onClose, onAnalysis }: ScreenShareProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Intelligence context integration
  const sessionId = typeof window !== 'undefined' ? (localStorage?.getItem('intelligence-session-id') || '') : ''

  // Start screen share
  const startScreenShare = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) videoRef.current.srcObject = mediaStream

      // Stop when user manually ends share
      const videoTrack = mediaStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.addEventListener("ended", () => stopScreenShare())
      }
    } catch {
      onClose()
    }
  }, [onClose])

  // Stop screen share
  const stopScreenShare = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    onClose()
  }, [stream, onClose])

  // Send frame to analysis API
  const sendFrame = useCallback(async (imageData: string) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/tools/screen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionId ? { 'x-intelligence-session-id': sessionId } : {})
        },
        body: JSON.stringify({ image: imageData, type: "screen" }),
      })
      const result = await response.json()
      const analysisText =
        result?.output?.analysis || result?.analysis || "No analysis"
      onAnalysis?.(analysisText)
    } catch (err) {
      console.error("Screen analysis error", err)
    } finally {
      setIsAnalyzing(false)
    }
  }, [onAnalysis, sessionId])

  // Kick off auto-analysis loop
  useEffect(() => {
    if (stream && videoRef.current && canvasRef.current) {
      intervalRef.current = setInterval(() => {
        const video = videoRef.current!
        const canvas = canvasRef.current!
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(video, 0, 0)
            const data = canvas.toDataURL("image/jpeg", 0.7)
            void sendFrame(data)
          }
        }
      }, 15000) // every 15s
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [stream, sendFrame])

  // Start on mount
  useEffect(() => {
    void startScreenShare()
  }, [startScreenShare])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [stream])

  return (
    <div className="h-full w-full bg-black relative overflow-hidden">
      {/* Enhanced Screen Preview with Gradient Overlay */}
      {stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
          {/* Subtle gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Monitor className="w-20 h-20 mx-auto mb-6 text-gray-500 drop-shadow-lg" />
              <h3 className="text-xl font-semibold text-white mb-2">Select Screen to Share</h3>
              <p className="text-gray-400 max-w-sm mx-auto">
                Choose a window, tab, or entire screen to share with AI analysis
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Enhanced Status Indicators */}
      {stream && (
        <>
          {/* AI Analysis Status - Top-left */}
          <motion.div
            className="absolute top-6 left-6 z-10"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="glass-card px-4 py-2 flex items-center gap-2 border-info/30">
              <motion.div
                className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-warning' : 'bg-success'}`}
                animate={isAnalyzing ? { scale: [1, 1.3, 1] } : { scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: isAnalyzing ? 1 : 2, ease: "easeInOut" }}
              />
              <span className={`font-semibold text-sm ${isAnalyzing ? 'text-warning' : 'text-success'}`}>
                {isAnalyzing ? '🤖 AI Analyzing...' : '👁️ Live Analysis'}
              </span>
            </div>
          </motion.div>

          {/* Screen Share Indicator - Top-right */}
          <motion.div
            className="absolute top-6 right-6 z-10"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
          >
            <div className="glass-card px-3 py-2 border-green-500/30">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium text-sm">Screen Shared</span>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Enhanced Toolbar (Bottom Center) */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
      >
        <div className="glass-card px-6 py-4 flex items-center gap-3 shadow-luxe">
          {/* Enhanced Stop Sharing Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="destructive"
              size="lg"
              onClick={stopScreenShare}
              className="hover-scale rounded-full px-6 py-3 shadow-lg hover:shadow-red-500/30 transition-all duration-300"
            >
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ gap: 8 }}
                transition={{ duration: 0.2 }}
              >
                <Monitor className="w-5 h-5" />
                <span className="font-semibold">Stop Sharing</span>
              </motion.div>
            </Button>
          </motion.div>

          {/* AI Analysis Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="glass"
              size="icon"
              onClick={() => setIsAnalyzing(!isAnalyzing)}
              className={`hover-scale rounded-full w-14 h-14 shadow-md transition-all duration-300 ${
                isAnalyzing ? 'ring-2 ring-warning shadow-warning/30' : ''
              }`}
            >
              <motion.div
                animate={isAnalyzing ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" }}
              >
                <Activity className={`w-6 h-6 ${isAnalyzing ? 'text-warning' : 'text-text-muted'}`} />
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