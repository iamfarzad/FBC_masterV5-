"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Monitor, X, Activity, Eye, Zap, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ScreenShareProps {
  onClose: () => void
  onAnalysis?: (analysis: string) => void
}

export function ScreenShare({ onClose, onAnalysis }: ScreenShareProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true) // Start with auto-analysis enabled
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null)
  const [analysisCount, setAnalysisCount] = useState(0)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const controlsRef = useRef<HTMLDivElement>(null)

  // 🔑 Accessibility: Keyboard Navigation Support
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Escape key to close
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
      // Space/Enter for manual analysis
      else if ((e.key === ' ' || e.key === 'Enter') && !isAnalyzing && stream) {
        e.preventDefault()
        triggerManualAnalysis()
      }
      // 'A' key to toggle auto-analysis
      else if (e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setIsAnalyzing(!isAnalyzing)
      }
      // 'S' key to stop sharing
      else if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        stopScreenShare()
      }
    }

    // 📢 Screen reader announcements
    const announceToScreenReader = (message: string) => {
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = message
      document.body.appendChild(announcement)
      setTimeout(() => document.body.removeChild(announcement), 1000)
    }

    document.addEventListener('keydown', handleKeyboard)
    
    // Announce screen share state changes
    if (stream && !isConnecting) {
      announceToScreenReader('Screen sharing active. AI analysis available.')
    } else if (isConnecting) {
      announceToScreenReader('Connecting to screen share...')
    }

    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [onClose, isAnalyzing, stream, isConnecting, triggerManualAnalysis, stopScreenShare])

  // Intelligence context integration
  const sessionId = typeof window !== 'undefined' ? (localStorage?.getItem('intelligence-session-id') || '') : ''

  // 🚀 ENHANCED SCREEN SHARE START - Professional UX with feedback
  const startScreenShare = useCallback(async () => {
    setIsConnecting(true)
    
    try {
      // 🔄 Professional loading feedback
      await new Promise(resolve => setTimeout(resolve, 300)) // Brief loading for UX
      
      // 🚀 PERFORMANCE-OPTIMIZED MEDIA CONSTRAINTS
      const getOptimalConstraints = () => {
        // Detect device performance characteristics
        const isHighPerformance = navigator.hardwareConcurrency > 4
        const isHighBandwidth = (navigator as any).connection?.downlink > 10 || true // Default to high
        
        return {
          video: { 
            width: { 
              ideal: isHighPerformance ? 1920 : 1280, 
              max: 1920 
            }, 
            height: { 
              ideal: isHighPerformance ? 1080 : 720,
              max: 1080 
            },
            frameRate: { 
              ideal: isHighBandwidth ? 30 : 15,
              max: isHighPerformance ? 60 : 30
            },
            // Performance optimizations
            aspectRatio: 16/9,
            resizeMode: 'crop-and-scale' as const
          },
          audio: false, // Disable audio for performance
        }
      }

      const mediaStream = await navigator.mediaDevices.getDisplayMedia(getOptimalConstraints())
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // 📊 ADVANCED PERFORMANCE MONITORING
        videoRef.current.onloadeddata = () => {
          const video = videoRef.current!
          const quality = video.videoWidth >= 1920 ? 'excellent' : 
                         video.videoWidth >= 1280 ? 'good' : 'poor'
          setConnectionQuality(quality)
          
          // Performance metrics logging
          console.log(`🎥 Stream Performance: ${video.videoWidth}x${video.videoHeight} @ ${quality} quality`)
        }
        
        // Performance optimization: Reduce unnecessary redraws
        videoRef.current.style.imageRendering = 'optimizeSpeed'
        videoRef.current.style.transform = 'translateZ(0)' // Hardware acceleration
      }

      // 🛑 Graceful shutdown when user ends share
      const videoTrack = mediaStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.addEventListener("ended", () => {
          // Professional shutdown with feedback
          setIsAnalyzing(false)
          onAnalysis?.(`**📊 Screen Share Session Ended**\n\nSession completed. Total analyses: ${  analysisCount}`)
          stopScreenShare()
        })
      }
      
      // 🎉 Success feedback
      onAnalysis?.("**🖥️ Screen Share Connected**\n\nAI analysis will begin automatically every 15 seconds. Use 'Analyze Now' for instant feedback.")
      
    } catch (error) {
      console.error("Screen share failed:", error)
      onAnalysis?.("**⚠️ Screen Share Failed**\n\nUnable to access screen. Please check permissions and try again.")
      onClose()
    } finally {
      setIsConnecting(false)
    }
  }, [onClose, onAnalysis, analysisCount])

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

  // 🤖 INTELLIGENT ANALYSIS SYSTEM - Context-aware screen analysis
  const sendFrame = useCallback(async (imageData: string, context?: { trigger?: 'auto' | 'manual' | 'conversation'; priority?: 'high' | 'normal' | 'low' }) => {
    setIsAnalyzing(true)
    
    try {
      // 🔍 Smart Context Detection - What's the user working on?
      const intelligenceContext = sessionId ? localStorage.getItem(`intelligence-context-${sessionId}`) : null
      const conversationHistory = sessionId ? localStorage.getItem(`chat-history-${sessionId}`) : null
      
      // 🎯 Context-Aware Analysis Prompt
      const contextPrompt = intelligenceContext 
        ? `Previous conversation context: ${intelligenceContext.slice(-500)}. Focus analysis on relevant details.`
        : 'Provide comprehensive screen analysis focusing on productivity, development, or business context.'

      const response = await fetch("/api/tools/screen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionId ? { 'x-intelligence-session-id': sessionId } : {})
        },
        body: JSON.stringify({ 
          image: imageData, 
          type: "screen",
          context: {
            prompt: contextPrompt,
            trigger: context?.trigger || 'auto',
            priority: context?.priority || 'normal',
            timestamp: new Date().toISOString(),
            session: sessionId
          }
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      const analysisText = result?.output?.analysis || result?.analysis || "Analysis completed"
      
      // 🔄 Intelligent Response Routing with Enhanced UX
      if (analysisText && analysisText.length > 10) {
        // 📊 Update analysis metrics for UX feedback
        setAnalysisCount(prev => prev + 1)
        setLastAnalysisTime(new Date())
        
        // Store analysis for conversation context
        if (sessionId) {
          const contextKey = `screen-analysis-${sessionId}`
          const existingContext = localStorage.getItem(contextKey) || '[]'
          const contextArray = JSON.parse(existingContext)
          contextArray.push({
            timestamp: new Date().toISOString(),
            analysis: analysisText.slice(0, 200), // Truncate for context
            trigger: context?.trigger || 'auto',
            quality: connectionQuality
          })
          // Keep only last 5 analyses for context
          if (contextArray.length > 5) contextArray.shift()
          localStorage.setItem(contextKey, JSON.stringify(contextArray))
        }
        
        // 💬 Professional chat integration with rich formatting
        const triggerEmoji = context?.trigger === 'manual' ? '⚡' : '🔄'
        const qualityBadge = connectionQuality === 'excellent' ? '🔥' : connectionQuality === 'good' ? '✅' : '⚠️'
        
        const enhancedAnalysis = `**${triggerEmoji} Screen Analysis #${analysisCount + 1}** ${qualityBadge}\n\n${analysisText}\n\n*${context?.trigger === 'manual' ? 'Manual analysis' : 'Auto-analysis'} • ${new Date().toLocaleTimeString()} • Quality: ${connectionQuality}*`
        onAnalysis?.(enhancedAnalysis)
        
        // 🎵 Subtle success feedback (visual only)
        if (context?.trigger === 'manual') {
          // Brief visual feedback for manual triggers
          setTimeout(() => {
            // Could add subtle visual success state here
          }, 100)
        }
      }
      
    } catch (err) {
      console.error("Screen analysis error:", err)
      // Intelligent error recovery
      onAnalysis?.(`**⚠️ Analysis Error:** Unable to analyze screen content. ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }, [onAnalysis, sessionId])

  // 🚀 PERFORMANCE-OPTIMIZED AUTO-ANALYSIS LOOP - Adaptive & Smart
  useEffect(() => {
    if (stream && videoRef.current && canvasRef.current && isAnalyzing) {
      // 📊 Adaptive interval based on performance and activity
      const getAdaptiveInterval = () => {
        const baseInterval = 15000 // 15s base
        const performanceFactor = connectionQuality === 'excellent' ? 1 : 
                                connectionQuality === 'good' ? 1.2 : 1.5
        return Math.round(baseInterval * performanceFactor)
      }

      intervalRef.current = setInterval(() => {
        const video = videoRef.current!
        const canvas = canvasRef.current!
        
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          // 🎯 SMART CANVAS OPTIMIZATION
          const targetWidth = Math.min(video.videoWidth, 1280) // Max 1280px for efficiency
          const targetHeight = Math.round(targetWidth * (video.videoHeight / video.videoWidth))
          
          canvas.width = targetWidth
          canvas.height = targetHeight
          
          const ctx = canvas.getContext("2d", { 
            alpha: false, // Disable alpha for performance
            willReadFrequently: false // Optimize for writing
          })
          
          if (ctx) {
            // Performance optimization: Disable smoothing for speed
            ctx.imageSmoothingEnabled = false
            
            // Smart scaling for performance
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight)
            
            // 📈 ADAPTIVE COMPRESSION - Lower quality for auto, higher for manual
            const compressionQuality = connectionQuality === 'excellent' ? 0.8 : 
                                     connectionQuality === 'good' ? 0.7 : 0.6
            
            const data = canvas.toDataURL("image/jpeg", compressionQuality)
            
            // Enhanced context for auto-analysis with performance metadata
            void sendFrame(data, { 
              trigger: 'auto', 
              priority: 'normal'
            })
          }
        }
      }, getAdaptiveInterval()) // Smart adaptive intervals
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [stream, sendFrame, isAnalyzing, connectionQuality])

  // ⚡ PERFORMANCE-OPTIMIZED MANUAL ANALYSIS - High quality instant feedback
  const triggerManualAnalysis = useCallback(async () => {
    if (!stream || !videoRef.current || !canvasRef.current || isAnalyzing) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      // 📸 HIGH-QUALITY CAPTURE for manual analysis
      const targetWidth = Math.min(video.videoWidth, 1920) // Full resolution for manual
      const targetHeight = Math.round(targetWidth * (video.videoHeight / video.videoWidth))
      
      canvas.width = targetWidth
      canvas.height = targetHeight
      
      const ctx = canvas.getContext("2d", { 
        alpha: false,
        willReadFrequently: false
      })
      
      if (ctx) {
        // 🎨 HIGH-QUALITY rendering for manual analysis
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight)
        
        // 💎 PREMIUM QUALITY for manual analysis
        const data = canvas.toDataURL("image/jpeg", 0.92) // High quality
        
        await sendFrame(data, { 
          trigger: 'manual', 
          priority: 'high' 
        })
      }
    }
  }, [stream, sendFrame, isAnalyzing])

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
    <div 
      className="relative size-full overflow-hidden bg-surface"
      role="application"
      aria-label="Screen Share with AI Analysis"
      aria-describedby="screen-share-description"
    >
      {/* Hidden description for screen readers */}
      <div id="screen-share-description" className="sr-only">
        Screen sharing application with AI-powered analysis. Use keyboard shortcuts: 
        Space or Enter for manual analysis, A to toggle auto-analysis, S to stop sharing, Escape to close.
      </div>
      
      {/* Professional Grid Layout with Visual Hierarchy */}
      <div className="absolute inset-0 grid h-full grid-rows-[auto_1fr_auto]">
        
        {/* 📊 RESPONSIVE TOP STATUS BAR - Adaptive Professional Dashboard */}
        <div className="bg-surface/95 border-b border-border p-3 backdrop-blur-lg md:p-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            {/* Left Side - Always Visible Core Status */}
            <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <motion.div 
                  className={`size-2 rounded-full md:size-3 ${isConnecting ? 'animate-pulse bg-yellow-500' : 'bg-brand'}`}
                  animate={stream ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="truncate text-sm font-semibold text-text md:text-base">
                  {isConnecting ? 'Connecting...' : stream ? 'Active' : 'Ready'}
                </span>
              </div>
              
              {/* Hide details on mobile, show on tablet+ */}
              <div className="hidden items-center gap-4 sm:flex">
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Eye className="size-3 text-text-muted md:size-4" />
                  <span className="text-xs text-text-muted md:text-sm">
                    {stream ? `${analysisCount} analyses` : 'AI Ready'}
                  </span>
                </div>
                {stream && connectionQuality && (
                  <>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                      <div className={`size-2 rounded-full ${
                        connectionQuality === 'excellent' ? 'bg-green-500' :
                        connectionQuality === 'good' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs capitalize text-text-muted">{connectionQuality}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Right Side - Responsive Badges */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* Only show essential badges on mobile */}
              <Badge variant={isAnalyzing ? "default" : "secondary"} className={`text-xs ${isAnalyzing ? "bg-brand text-surface" : ""}`}>
                {isConnecting ? "Connecting..." : isAnalyzing ? "AI ON" : "Ready"}
              </Badge>
              
              {/* Show detailed info on larger screens */}
              <div className="hidden items-center gap-3 md:flex">
                {lastAnalysisTime && (
                  <Badge variant="outline" className="border-border bg-surface text-xs text-text">
                    Last: {lastAnalysisTime.toLocaleTimeString()}
                  </Badge>
                )}
                <Badge variant="outline" className="border-border bg-surface text-text">
                  Auto: 15s
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* 🖥️ MAIN CONTENT AREA - Professional Video Container */}
        <div className="via-surface-elevated/30 relative flex-1 bg-gradient-to-br from-surface to-surface">
      {stream ? (
        <>
              {/* Responsive Professional Video Frame */}
              <div className="absolute inset-2 overflow-hidden rounded-lg border border-border bg-surface shadow-2xl md:inset-4 md:rounded-xl lg:inset-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
                  className="size-full bg-black object-contain"
                  aria-label="Screen share video stream"
                  aria-describedby="video-status"
                />
                
                {/* Professional Analysis Overlay */}
                {isAnalyzing && (
            <motion.div
                    className="bg-brand/5 absolute inset-0 flex items-center justify-center backdrop-blur-[1px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="bg-surface/90 rounded-2xl border border-border p-6 shadow-lg backdrop-blur-lg">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="size-5 rounded-full border-2 border-brand border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="font-medium text-text">AI is analyzing your screen...</span>
          </div>
        </div>
                  </motion.div>
                )}
              </div>

              {/* 📊 RESPONSIVE ANALYTICS DASHBOARD - Adaptive Position */}
              <motion.div
                className="absolute left-4 top-4 z-20 md:left-8 md:top-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                                <div className="bg-surface/95 max-w-xs overflow-hidden rounded-lg border border-border shadow-lg backdrop-blur-lg md:rounded-xl">
                  {/* Responsive Primary Status Row */}
                  <div className="border-b border-border px-3 py-2 md:px-4 md:py-3">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className={`size-2 rounded-full md:size-3 ${isAnalyzing ? 'animate-pulse bg-brand' : 'bg-green-500'}`} />
                      <span className="text-xs font-semibold text-text md:text-sm">
                        {isAnalyzing ? 'AI Processing' : 'Live Monitor'}
                      </span>
                      <Badge variant="outline" className="border-border bg-surface text-xs">
                        #{analysisCount}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Responsive Analytics Metrics - Collapsible on mobile */}
                  <div className="space-y-1 px-3 py-2 md:space-y-2 md:px-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Quality</span>
                      <span className={`font-medium ${
                        connectionQuality === 'excellent' ? 'text-green-600' :
                        connectionQuality === 'good' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {connectionQuality}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Count</span>
                      <span className="font-medium text-text">{analysisCount}</span>
                    </div>
                    
                    {/* Hide detailed timing on mobile */}
                    <div className="hidden sm:block">
                      {lastAnalysisTime && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-muted">Last</span>
                          <span className="font-medium text-text">
                            {Math.floor((new Date().getTime() - lastAnalysisTime.getTime()) / 1000)}s ago
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Auto</span>
                      <span className={`font-medium ${isAnalyzing ? 'text-green-600' : 'text-text-muted'}`}>
                        {isAnalyzing ? 'ON' : 'OFF'}
              </span>
            </div>
                  </div>
                  
                  {/* Responsive Quick Actions */}
                  <div className="bg-surface-elevated/50 border-t border-border p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={triggerManualAnalysis}
                      disabled={isAnalyzing}
                      className="hover:bg-brand/10 h-7 w-full rounded-md px-2 text-xs hover:text-brand md:h-8 md:px-3"
                    >
                      <Target className="mr-1 size-3" />
                      {isAnalyzing ? 'Processing...' : 'Quick Scan'}
                    </Button>
              </div>
            </div>
          </motion.div>
            </>
          ) : (
            /* Professional Empty State with Loading Feedback */
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="p-8 text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.div 
                  className="mx-auto mb-6 w-fit rounded-full border border-border bg-surface-elevated p-6 shadow-lg"
                  animate={isConnecting ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{ duration: 1, repeat: isConnecting ? Infinity : 0 }}
                >
                  <Monitor className={`size-12 ${isConnecting ? 'animate-pulse text-brand' : 'text-brand'}`} />
                </motion.div>
                
                <h3 className="mb-3 text-2xl font-semibold text-text">
                  {isConnecting ? 'Connecting to Screen...' : 'Screen Share Ready'}
                </h3>
                
                <p className="mx-auto max-w-md leading-relaxed text-text-muted">
                  {isConnecting 
                    ? 'Please select a window, tab, or screen to share from the dialog'
                    : 'Select any window, application, or your entire screen to begin AI-powered analysis'
                  }
                </p>
                
                <div className="mt-6 flex items-center justify-center gap-2">
                  {isConnecting ? (
                    <motion.div
                      className="size-6 rounded-full border-2 border-brand border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <>
                      <div className="size-2 animate-bounce rounded-full bg-brand" />
                      <div className="size-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: '0.1s' }} />
                      <div className="size-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: '0.2s' }} />
        </>
      )}
                </div>
                
                {/* Professional tip for first-time users */}
                {!isConnecting && (
                  <motion.div
                    className="bg-brand/5 border-brand/10 mt-8 rounded-xl border p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <p className="text-sm text-text-muted">
                      💡 <strong>Pro Tip:</strong> Choose "Entire Screen" for comprehensive analysis, or specific windows for focused insights
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </div>

                {/* 🎛️ RESPONSIVE BOTTOM CONTROL PANEL - Adaptive Professional Toolbar */}
        <div className="bg-surface/95 border-t border-border p-3 backdrop-blur-lg md:p-4">
          <div className="mx-auto flex max-w-6xl items-center justify-center">
      <motion.div
              className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated p-2 shadow-lg md:gap-4 md:rounded-2xl md:p-3"
              initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
      >
                            {/* Stop Sharing - Always Primary Action */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="destructive"
                  className="rounded-lg bg-red-500 px-3 py-2 text-white shadow-md transition-all duration-200 hover:bg-red-600 hover:shadow-lg sm:px-4 md:rounded-xl md:px-6 md:py-3"
              onClick={stopScreenShare}
                  aria-label="Stop screen sharing"
                  aria-describedby="stop-sharing-desc"
                  aria-keyshortcuts="s"
                >
                  <Monitor className="size-4 sm:mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">Stop Sharing</span>
                  <span id="stop-sharing-desc" className="sr-only">
                    Press S or click to stop screen sharing. This will end the session and close the interface.
                  </span>
                </Button>
              </motion.div>

              {/* Hide dividers on mobile */}
              <div className="hidden h-6 w-px bg-border sm:block md:h-8" aria-hidden="true" />

              {/* Manual Analysis - Responsive Sizing */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="default"
                  onClick={triggerManualAnalysis}
                  disabled={isAnalyzing || !stream}
                  className="rounded-lg bg-brand px-3 py-2 text-surface shadow-md transition-all duration-200 hover:bg-brand-hover disabled:opacity-50 sm:px-4 md:rounded-xl md:px-5 md:py-3"
                  aria-label={isAnalyzing ? "Analysis in progress" : "Trigger manual AI analysis"}
                  aria-describedby="manual-analysis-desc"
                  aria-keyshortcuts="space enter"
                  aria-disabled={isAnalyzing || !stream}
                >
                  <Zap className="size-4 sm:mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {isAnalyzing ? 'Processing...' : 'Analyze Now'}
                  </span>
                  <span id="manual-analysis-desc" className="sr-only">
                    Press Space or Enter to trigger immediate AI analysis of current screen content.
                  </span>
            </Button>
          </motion.div>

              {/* Analysis Toggle - Responsive Text */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
                  variant={isAnalyzing ? "default" : "outline"}
              onClick={() => setIsAnalyzing(!isAnalyzing)}
                  className={`rounded-lg px-3 py-2 transition-all duration-200 sm:px-4 md:rounded-xl md:px-5 md:py-3 ${
                    isAnalyzing 
                      ? 'bg-green-600 text-white shadow-md hover:bg-green-700' 
                      : 'border-border hover:bg-surface-elevated'
                  }`}
                  aria-label={`Auto-analysis is currently ${isAnalyzing ? 'enabled' : 'disabled'}`}
                  aria-describedby="auto-analysis-desc"
                  aria-keyshortcuts="a"
                  aria-pressed={isAnalyzing}
            >
              <motion.div
                animate={isAnalyzing ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" }}
              >
                    <Activity className="size-4 sm:mr-2" aria-hidden="true" />
                  </motion.div>
                  <span className="hidden font-medium sm:inline">
                    Auto {isAnalyzing ? 'ON' : 'OFF'}
                  </span>
                  <span id="auto-analysis-desc" className="sr-only">
                    Press A to toggle automatic AI analysis every 15 seconds. Currently {isAnalyzing ? 'enabled' : 'disabled'}.
                  </span>
                </Button>
          </motion.div>

              {/* Close - Always Visible */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
                  variant="ghost"
              size="icon"
              onClick={onClose}
                  className="size-10 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-text md:size-12 md:rounded-xl"
                  aria-label="Close screen sharing interface"
                  aria-keyshortcuts="escape"
                >
                  <X className="size-4 md:size-5" aria-hidden="true" />
                </Button>
              </motion.div>
          </motion.div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas - For capturing screenshots */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}