"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Camera, Upload, X, Brain, Video, VideoOff, Eye, EyeOff, Loader2, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/src/core/utils"
import type { WebcamCaptureProps, WebcamState, InputMode } from "./WebcamCapture.types"

interface AnalysisResult {
  id: string
  text: string
  timestamp: number
  imageData?: string
}

export function WebcamCapture({ 
  mode = 'card',
  onCapture, 
  onClose,
  onCancel,
  onAIAnalysis 
}: WebcamCaptureProps) {
  const { toast } = useToast()
  const [webcamState, setWebcamState] = useState<WebcamState>("initializing")
  const [inputMode, setInputMode] = useState<InputMode>("camera")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [captureCount, setCaptureCount] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  
  // Real-time analysis states
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([])
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true)
  const [analysisCount, setAnalysisCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoAnalysisInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionIdRef = useRef<string>(`webcam-session-${Date.now()}`)

  // Start real-time analysis session
  const startAnalysisSession = useCallback(async () => {
    try {
      const response = await fetch('/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          sessionId: sessionIdRef.current,
          enableAudio: false,
          analysisMode: 'video'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start analysis session')
      }

      console.log('📹 Analysis session started')
    } catch (error) {
      console.error('❌ Failed to start analysis session:', error)
      setError('Failed to start analysis session')
    }
  }, [])

  // Send video frame for analysis
  const sendVideoFrame = useCallback(async (imageData: string) => {
    try {
      setIsAnalyzing(true)
      
      const response = await fetch('/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          sessionId: sessionIdRef.current,
          type: 'video_frame',
          analysisMode: 'video'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze video frame')
      }

      const result = await response.json()
      
      const analysis: AnalysisResult = {
        id: Date.now().toString(),
        text: result.response || result.text || 'No analysis available',
        timestamp: Date.now(),
        imageData
      }
      
      setAnalysisHistory(prev => [...prev, analysis])
      setCurrentAnalysis(analysis.text)
      setAnalysisCount(prev => prev + 1)
      
      onAIAnalysis?.(analysis.text)
      
    } catch (error) {
      console.error('❌ Failed to analyze video frame:', error)
      setError('Failed to analyze video frame')
    } finally {
      setIsAnalyzing(false)
    }
  }, [onAIAnalysis])

  // Auto-analysis interval with throttling and cost awareness
  useEffect(() => {
    if (isAutoAnalyzing && webcamState === "active") {
      let analysisCount = 0;
      const maxAnalysisPerSession = 15; // Limit webcam analysis more strictly
      
      autoAnalysisInterval.current = setInterval(async () => {
        // Check if we've exceeded the analysis limit
        if (analysisCount >= maxAnalysisPerSession) {
          console.warn('🚨 Webcam auto-analysis limit reached to prevent excessive API costs');
          setIsAutoAnalyzing(false);
          return;
        }

        if (videoRef.current && canvasRef.current && !isAnalyzing) {
          const canvas = canvasRef.current
          const video = videoRef.current
          
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0)
            const imageData = canvas.toDataURL('image/jpeg', 0.8)
            analysisCount++;
            console.log(`📹 Webcam auto-analysis ${analysisCount}/${maxAnalysisPerSession}`);
            await sendVideoFrame(imageData)
          }
        }
      }, 20000) // Increased to 20 seconds for webcam (more frequent than screen)
    } else {
      if (autoAnalysisInterval.current) {
        clearInterval(autoAnalysisInterval.current)
        autoAnalysisInterval.current = null
      }
    }

    return () => {
      if (autoAnalysisInterval.current) {
        clearInterval(autoAnalysisInterval.current)
      }
    }
  }, [isAutoAnalyzing, webcamState, sendVideoFrame])

  const handleCapture = async (imageData: string) => {
    onCapture(imageData)
    
    // Send for AI analysis
    await sendVideoFrame(imageData)
  }

  const handleClose = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (autoAnalysisInterval.current) {
      clearInterval(autoAnalysisInterval.current)
    }
    setWebcamState("stopped")
    setIsAutoAnalyzing(false)
    onClose?.()
    onCancel?.()
  }, [stream, onClose, onCancel])

  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      setWebcamState("initializing")
      
      // Start analysis session
      await startAnalysisSession()
      
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
          ...(deviceId && { deviceId: deviceId }),
        },
        audio: false,
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setWebcamState("active")
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      
      toast({
        title: "Camera Started",
        description: "Webcam is now active and ready for analysis."
      })
    } catch (error) {
      console.error("Camera access failed:", error)
      setWebcamState("error")
      setError('Camera access failed')
      toast({
        title: "Camera Access Failed",
        description: "Please check permissions and try again.",
        variant: "destructive",
      })
    }
  }, [toast, startAnalysisSession])

  const checkAndInitCamera = useCallback(async () => {
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setWebcamState("error")
        setError('Camera not supported')
        toast({
          title: "Camera Not Supported",
          description: "Camera requires a secure connection (HTTPS) and a supported browser.",
          variant: "destructive",
        })
        return
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setPermissionGranted(true)
      mediaStream.getTracks().forEach((track) => track.stop())

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((d) => d.kind === "videoinput")
      setAvailableDevices(videoDevices)

      const currentDeviceId = videoDevices[0]?.deviceId
      if (currentDeviceId) {
        setSelectedDeviceId(currentDeviceId)
        await startCamera(currentDeviceId)
      }
    } catch (error) {
      console.error("Camera initialization failed:", error)
      setWebcamState("error")
      setError('Camera initialization failed')
    }
  }, [startCamera, toast])

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      setIsCapturing(true)
      const canvas = canvasRef.current
      const video = videoRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.8)
        handleCapture(imageData)
        setCaptureCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Capture failed:", error)
      setError('Capture failed')
    } finally {
      setIsCapturing(false)
    }
  }, [handleCapture])

  const handleDeviceChange = useCallback(async (deviceId: string) => {
    setSelectedDeviceId(deviceId)
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    await startCamera(deviceId)
  }, [stream, startCamera])

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose()
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  useEffect(() => {
    if (inputMode === "camera" && !stream) {
      checkAndInitCamera()
    }
  }, [inputMode, stream, checkAndInitCamera])

  const WebcamUI = () => (
    <div className="flex flex-col gap-4">
      {/* Status and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            webcamState === "active" ? "bg-green-500" : "bg-gray-400"
          )} />
          <span className="text-sm">
            {webcamState === "active" ? "Camera Active" : "Camera Inactive"}
          </span>
          {isAnalyzing && (
            <Badge variant="secondary">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Analyzing
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            checked={isAutoAnalyzing}
            onCheckedChange={setIsAutoAnalyzing}
            disabled={webcamState !== "active"}
          />
          <span className="text-xs">Auto Analysis</span>
        </div>
      </div>

      {/* Video Display */}
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-lg border"
        />
        
        {/* Capture Button Overlay */}
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={captureImage}
            disabled={webcamState !== "active" || isCapturing}
            className="w-12 h-12 rounded-full bg-white/90 hover:bg-white"
          >
            {isCapturing ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            ) : (
              <Camera className="w-6 h-6 text-gray-600" />
            )}
          </Button>
        </div>
        
        {/* Analysis Panel Toggle */}
        <Button
          onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
        >
          {showAnalysisPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>

      {/* Analysis Panel */}
      <AnimatePresence>
        {showAnalysisPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Current Analysis */}
            {currentAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Live Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{currentAnalysis}</p>
                </CardContent>
              </Card>
            )}

            {/* Analysis History */}
            {analysisHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Analysis History ({analysisCount})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-40 overflow-y-auto">
                  {analysisHistory.slice(-3).map((analysis) => (
                    <div
                      key={analysis.id}
                      className="p-3 rounded-lg bg-gray-50 border-l-4 border-blue-500"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">AI</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(analysis.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{analysis.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )

  if (mode === 'modal') {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Webcam Capture
            </DialogTitle>
          </DialogHeader>
          <WebcamUI />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <ToolCardWrapper
      title="Webcam Capture"
      description="Real-time video capture with AI analysis"
      icon={Camera}
    >
      <WebcamUI />
    </ToolCardWrapper>
  )
}
