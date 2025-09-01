"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Download, Play, Pause, Square, RotateCcw, FileText, Image as ImageIcon, Video, Mic, Calculator, Monitor, Sparkles, Zap, Bot, TrendingUp, FileSearch, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/src/core/utils'
import { Message } from '@/app/(chat)/chat/types/chat'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2, User, AlertTriangle, Info, Clock, Target, Edit } from "lucide-react"
import { VoiceInput } from "@/components/chat/tools/VoiceInput"
import { ROICalculator } from "@/components/chat/tools/ROICalculator"
// VideoToApp moved to dedicated workshop page - redirect users there
// import { VideoToApp } from "@/components/chat/tools/VideoToApp"
import { WebcamCapture } from "@/components/chat/tools/WebcamCapture"
import { ScreenShare } from "@/components/chat/tools/ScreenShare"
import { BusinessContentRenderer } from "@/components/chat/BusinessContentRenderer"
import { useToast } from "@/hooks/use-toast"
import { useVideoToAppDetection } from "@/hooks/use-video-to-app-detection"
import type { 
  VoiceTranscriptResult, 
  WebcamCaptureResult, 
  VideoAppResult, 
  ScreenShareResult 
} from "@/src/core/services/tool-service"
import type { ROICalculationResult } from "@/components/chat/tools/ROICalculator/ROICalculator.types";
import type { BusinessInteractionData, UserBusinessContext } from "@/types/business-content"

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  onVoiceTranscript: (transcript: string) => void
  onWebcamCapture: (imageData: string) => void
  onROICalculation: (result: ROICalculationResult) => void
  onVideoAppResult: (result: VideoAppResult) => void
  onScreenAnalysis: (analysis: string) => void
  onBusinessInteraction?: (data: BusinessInteractionData) => void
  userContext?: UserBusinessContext
}

export function ChatArea({
  messages,
  isLoading,
  messagesEndRef,
  onVoiceTranscript,
  onWebcamCapture,
  onROICalculation,
  onVideoAppResult,
  onScreenAnalysis,
  onBusinessInteraction,
  userContext
}: ChatAreaProps) {
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [videoToAppCards, setVideoToAppCards] = useState<Record<string, any>>({})
  const [visibleMessages, setVisibleMessages] = useState<Set<string>>(new Set())
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  // Video-to-App detection and handling
  const handleVideoDetected = useCallback((messageId: string, videoUrl: string, videoToAppCard: any) => {
    setVideoToAppCards(prev => ({
      ...prev,
      [messageId]: videoToAppCard
    }))
  }, [])

  const handleVideoToAppStart = useCallback(async (messageId: string, videoUrl: string) => {
    // Update the card status to analyzing
    setVideoToAppCards(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        status: 'analyzing',
        progress: 25
      }
    }))

    try {
      // Start the video analysis
      const response = await fetch('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateSpec',
          videoUrl,
          userPrompt: '',
          sessionId: messageId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze video')
      }

      const specResult = await response.json()

      // Update progress to spec generation
      setVideoToAppCards(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          status: 'generating',
          progress: 50,
          spec: specResult.spec || ''
        }
      }))

      // Generate the code
      const codeResponse = await fetch('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateCode',
          spec: specResult.spec
        })
      })

      if (!codeResponse.ok) {
        throw new Error('Failed to generate app')
      }

      const codeResult = await codeResponse.json()

      // Complete the generation
      setVideoToAppCards(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          status: 'completed',
          progress: 100,
          code: codeResult.code || '',
          artifactId: codeResult.artifactId
        }
      }))

    } catch (error) {
      console.error('Video-to-app generation failed:', error)
      setVideoToAppCards(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          status: 'error',
          error: error instanceof Error ? error.message : 'Generation failed'
        }
      }))
    }
  }, [setVideoToAppCards])

  // Use the video detection hook
  const { startVideoToAppGeneration } = useVideoToAppDetection({
    messages,
    onVideoDetected: handleVideoDetected,
    onVideoToAppStart: handleVideoToAppStart,
    sessionId: 'chat_session'
  })

  const formatMessageContent = (content: string): string => {
    if (!content) return ''
    // Enhanced markdown formatting with better styling
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-foreground/90">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted/60 text-accent px-2 py-1 rounded-md text-sm font-mono border border-border/30">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted/40 border border-border/30 rounded-lg p-4 my-3 whitespace-pre-wrap break-words overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>')
  }

  const detectMessageType = (content: string): { type: string; icon?: React.ReactNode; badge?: string; color?: string } => {
    if (!content) return { type: 'default' }
    
    if (content.includes('```') || content.toLowerCase().includes('code')) {
      return {
        type: 'code',
        icon: <FileText className="w-3 h-3 mr-1" />,
        badge: 'Code',
        color: 'bg-purple-50 text-purple-700 border-purple-200'
      }
    }
    
    if (content.includes('![') || content.includes('<img') || content.toLowerCase().includes('image')) {
      return {
        type: 'image',
        icon: <ImageIcon className="w-3 h-3 mr-1" />,
        badge: 'Visual',
        color: 'bg-blue-50 text-blue-700 border-blue-200'
      }
    }

    if (content.toLowerCase().includes('roi') || content.toLowerCase().includes('calculation')) {
      return {
        type: 'analysis',
        icon: <TrendingUp className="w-3 h-3 mr-1" />,
        badge: 'Analysis',
        color: 'bg-green-50 text-green-700 border-green-200'
      }
    }
    
    if (content.length > 300) {
      return {
        type: 'long',
        icon: <FileText className="w-3 h-3 mr-1" />,
        badge: 'Detailed',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
      }
    }
    
    return { type: 'default' }
  }

  const detectToolType = (content: string): string | null => {
    if (!content) return null
    if (content.includes('VOICE_INPUT')) return 'voice_input'
    if (content.includes('WEBCAM_CAPTURE')) return 'webcam_capture'
    if (content.includes('ROI_CALCULATOR')) return 'roi_calculator'
    if (content.includes('VIDEO_TO_APP')) return 'video_to_app'
    if (content.includes('SCREEN_SHARE')) return 'screen_share'
    return null
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    }
    
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100)
    }
  }, [messages])

  // Intersection Observer for message animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleMessages(prev => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1 }
    )

    const messageElements = document.querySelectorAll('[data-message-id]')
    messageElements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [messages])

  const renderToolCard = (toolType: string | null, messageId: string) => {
    const handleCancel = () => {
      // Handle tool cancellation
    }

    switch (toolType) {
      case 'voice_input':
        return <VoiceInput mode="card" onCancel={handleCancel} onTranscript={(transcript: string) => onVoiceTranscript(transcript)} />
      case 'webcam_capture':
        return <WebcamCapture mode="card" onCancel={handleCancel} onCapture={(imageData: string) => onWebcamCapture(imageData)} />
      case 'roi_calculator':
        return <ROICalculator mode="card" onCancel={handleCancel} onComplete={(result: ROICalculationResult) => onROICalculation(result)} />
      case 'video_to_app':
        // Redirect to dedicated workshop page
        React.useEffect(() => {
          const workshopUrl = '/workshop/video-to-app'
          window.location.href = workshopUrl
        }, [])

        return (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand/10 flex items-center justify-center">
              <Video className="w-8 h-8 text-brand" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Redirecting to Video-to-App Workshop
            </h3>
            <p className="text-muted-foreground">
              Opening the dedicated workshop page for a better experience...
            </p>
          </div>
        )
      case 'screen_share':
        return <ScreenShare mode="card" onCancel={handleCancel} onAnalysis={(analysis: string) => onScreenAnalysis(analysis)} />
      default:
        return null
    }
  }

  const EmptyState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center py-20 px-6 flex flex-col items-center justify-center min-h-[60vh]"
    >
      <motion.div 
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-accent/20 via-primary/10 to-accent/30 flex items-center justify-center shadow-2xl"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-inner">
          <Sparkles className="w-12 h-12 text-accent-foreground" />
        </div>
      </motion.div>
      
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-bold mb-4 text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
      >
        Welcome to F.B/c AI
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed text-lg"
      >
        I'm your intelligent AI assistant, ready to help with business analysis, automation strategies, and comprehensive consultation. 
        Let's start building something amazing together.
      </motion.p>
      
      {/* Enhanced Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mx-auto"
      >
        {[
          { 
            icon: Brain, 
            title: "Ask about AI automation", 
            desc: "Get insights on process optimization", 
            color: "from-orange-500 to-red-500",
            action: () => {
              // Add a sample AI automation question
              const sampleQuestions = [
                "How can AI automate my customer service processes?",
                "What are the best AI tools for workflow automation?",
                "How do I implement chatbots for my business?",
                "What processes in my company can benefit from AI automation?"
              ];
              const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
              // Trigger input with sample question
              document.querySelector('textarea')?.focus();
              document.querySelector('textarea')?.setAttribute('placeholder', randomQuestion);
            }
          },
          { 
            icon: Sparkles, 
            title: "Upload a document", 
            desc: "Analyze files and extract insights", 
            color: "from-green-500 to-emerald-600",
            action: () => {
              // Trigger file upload
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              fileInput?.click();
            }
          },
          { 
            icon: Zap, 
            title: "Business analysis", 
            desc: "Strategic planning and ROI calculations", 
            color: "from-purple-500 to-indigo-600",
            action: () => {
              // Trigger ROI calculator or business analysis
              const analysisPrompts = [
                "I need help analyzing my business performance",
                "Can you help me calculate ROI for a new project?",
                "I want to optimize my business processes",
                "Help me create a strategic plan for growth"
              ];
              const randomPrompt = analysisPrompts[Math.floor(Math.random() * analysisPrompts.length)];
              document.querySelector('textarea')?.focus();
              document.querySelector('textarea')?.setAttribute('placeholder', randomPrompt);
            }
          }
        ].map((action, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={action.action}
                    className="h-auto min-h-[120px] sm:min-h-[140px] p-4 sm:p-6 w-full flex flex-col items-center gap-3 sm:gap-4 hover:bg-accent/5 transition-all duration-300 border-border/30 rounded-xl group bg-card/50 backdrop-blur-sm hover:shadow-lg"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center space-y-1 flex-1 flex flex-col justify-center">
                      <div className="font-semibold text-foreground">{action.title}</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">{action.desc}</div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.desc}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main chat area with single scroll container */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto overscroll-contain chat-scroll-container"
      >
        <div 
          className={cn(
            "mx-auto space-y-6 px-4 sm:px-6 py-6",
            "max-w-3xl", // Consistent width - no jumping
            "pb-8" // Reduced bottom padding
          )} 
          data-testid="messages-container"
        >
          {messages.length === 0 && !isLoading ? (
            <EmptyState />
          ) : (
            <>
              <AnimatePresence>
                {messages.map((message, index) => {
                  if (!message?.id) return null
                  
                  const messageType = message.role === "assistant" ? detectMessageType(message.content || '') : { type: 'default' }
                  const toolType = detectToolType(message.content || '')
                  const isVisible = visibleMessages.has(message.id)
                  
                  // Render VideoToApp card if present
                  if (message.videoToAppCard) {
                    return (
                      <motion.div 
                        key={message.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="space-y-4"
                      >
                        {/* Regular message content */}
                        <div className="flex gap-3 justify-start">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="w-3 h-3 text-accent" />
                          </div>
                          <div className="flex flex-col max-w-[85%] min-w-0 items-start">
                            <div className="relative group/message transition-all duration-200 bg-transparent text-foreground">
                              <div className="prose prose-sm max-w-none leading-relaxed break-words dark:prose-invert prose-slate text-foreground">
                                {message.content}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Video-to-App Inline Card */}
                        {videoToAppCards[message.id] && (
                          <div className="mt-3">
                            <div className="bg-surface rounded-lg border border-border overflow-hidden">
                              {/* Header with video preview */}
                              <div className="p-4 bg-surface-elevated/50 border-b border-border">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                                    <Video className="w-5 h-5 text-brand" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-foreground text-sm">
                                      Video-to-Learning App
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {videoToAppCards[message.id].videoUrl}
                                    </p>
                                  </div>
                                  <div className={cn(
                                    'px-2 py-1 rounded text-xs font-medium',
                                    videoToAppCards[message.id].status === 'completed' ? 'bg-success/10 text-success' :
                                    videoToAppCards[message.id].status === 'analyzing' ? 'bg-info/10 text-info' :
                                    videoToAppCards[message.id].status === 'generating' ? 'bg-warning/10 text-warning' :
                                    videoToAppCards[message.id].status === 'error' ? 'bg-destructive/10 text-destructive' :
                                    'bg-muted/10 text-muted-foreground'
                                  )}>
                                    {videoToAppCards[message.id].status}
                                  </div>
                                </div>
                              </div>

                              {/* Progress indicator */}
                              {(videoToAppCards[message.id].status === 'analyzing' || videoToAppCards[message.id].status === 'generating') && (
                                <div className="px-4 py-3 border-b border-border">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                      <div className="text-xs text-muted-foreground mb-1">
                                        {videoToAppCards[message.id].status === 'analyzing'
                                          ? 'Analyzing video content...'
                                          : 'Generating interactive app...'}
                                      </div>
                                      {videoToAppCards[message.id].progress && (
                                        <div className="w-full bg-surface-elevated rounded-full h-1.5">
                                          <div
                                            className="bg-brand h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${videoToAppCards[message.id].progress}%` }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {videoToAppCards[message.id].progress}%
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* App preview or action button */}
                              <div className="p-4">
                                {videoToAppCards[message.id].status === 'completed' && videoToAppCards[message.id].code ? (
                                  <div className="space-y-3">
                                    <div className="aspect-video bg-surface-elevated rounded border overflow-hidden">
                                      <iframe
                                        srcDoc={videoToAppCards[message.id].code}
                                        className="w-full h-full border-0"
                                        title="Generated Learning App"
                                        sandbox="allow-scripts allow-same-origin"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                          const workshopUrl = `/workshop/video-to-app?url=${encodeURIComponent(videoToAppCards[message.id].videoUrl)}`
                                          window.open(workshopUrl, '_blank')
                                        }}
                                      >
                                        <Play className="w-3 h-3 mr-1" />
                                        Open Full Workshop
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          if (videoToAppCards[message.id].code) {
                                            navigator.clipboard?.writeText(videoToAppCards[message.id].code)
                                            toast({
                                              title: "Copied!",
                                              description: "App HTML copied to clipboard.",
                                            })
                                          }
                                        }}
                                      >
                                        <Code className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : videoToAppCards[message.id].status === 'error' ? (
                                  <div className="text-center py-4">
                                    <div className="text-sm text-destructive mb-2">
                                      Generation failed
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-3">
                                      {videoToAppCards[message.id].error || 'Something went wrong'}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const workshopUrl = `/workshop/video-to-app?url=${encodeURIComponent(videoToAppCards[message.id].videoUrl)}`
                                        window.open(workshopUrl, '_blank')
                                      }}
                                    >
                                      Try in Workshop
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="text-center py-4">
                                    <div className="text-sm text-muted-foreground mb-3">
                                      Ready to create an interactive learning app from this video?
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => startVideoToAppGeneration(message.id, videoToAppCards[message.id].videoUrl)}
                                    >
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      Generate App
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  }

                  // Render Business Content if present
                  if (message.businessContent) {
                    return (
                      <motion.div 
                        key={message.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="space-y-4"
                      >
                        {/* Regular message content */}
                        {message.content && (
                          <div className="flex gap-3 justify-start">
                            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                              <Bot className="w-3 h-3 text-accent" />
                            </div>
                            <div className="flex flex-col max-w-[85%] min-w-0 items-start">
                              <div className="relative group/message transition-all duration-200 bg-transparent text-foreground">
                                <div className="prose prose-sm max-w-none leading-relaxed break-words dark:prose-invert prose-slate text-foreground">
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: formatMessageContent(message.content),
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Business Content Renderer */}
                        <div className="flex justify-center">
                          <BusinessContentRenderer
                            htmlContent={message.businessContent.htmlContent}
                            onInteract={onBusinessInteraction || (() => {})}
                            userContext={userContext}
                            isLoading={false}
                          />
                        </div>
                      </motion.div>
                    )
                  }
                  
                  if (toolType) {
                    return (
                      <motion.div 
                        key={message.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex justify-center"
                      >
                        {renderToolCard(toolType, message.id)}
                      </motion.div>
                    )
                  }
                  
                  return (
                    <motion.div
                      key={message.id}
                      data-message-id={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ 
                        opacity: isVisible ? 1 : 0.7, 
                        y: 0, 
                        scale: 1 
                      }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.05,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      className="group relative"
                    >
                      <div className={cn(
                        "flex gap-3 w-full",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}>
                        {/* AI Avatar - Small and minimal */}
                        {message.role === "assistant" && (
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="w-3 h-3 text-accent" />
                          </div>
                        )}

                        <div className={cn(
                          "flex flex-col max-w-[85%] min-w-0",
                          message.role === "user" ? "items-end" : "items-start"
                        )}>
                          {/* Message Content - Minimal styling like ChatGPT */}
                          <div className={cn(
                            "relative group/message transition-all duration-200",
                            message.role === "user"
                              ? "bg-muted/20 text-foreground border border-border/10 rounded-2xl px-4 py-3"
                              : "bg-transparent text-foreground" // No background for AI messages
                          )}>
                            {message.imageUrl && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="mb-3"
                              >
                                <div className="relative group/image rounded-xl overflow-hidden">
                                  <img
                                    src={message.imageUrl || "/placeholder.svg"}
                                    alt="Uploaded image"
                                    className="max-w-full h-auto border border-border/20 max-h-96 object-contain rounded-xl"
                                    loading="lazy"
                                  />
                                  <div className="absolute top-3 right-3 opacity-0 group-hover/image:opacity-100 transition-opacity">
                                    <Button
                                      variant="secondary"
                                      size="icon"
                                      className="w-8 h-8 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
                                      onClick={() => message.imageUrl && window.open(message.imageUrl, "_blank")}
                                    >
                                      <ImageIcon className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            <div
                              className={cn(
                                "prose prose-sm max-w-none leading-relaxed break-words",
                                "dark:prose-invert prose-slate text-foreground",
                                "prose-headings:mt-4 prose-headings:mb-2 prose-p:mb-3 prose-li:mb-1",
                                "prose-strong:text-current prose-em:text-current"
                              )}
                              dangerouslySetInnerHTML={{
                                __html: formatMessageContent(message.content || ''),
                              }}
                            />

                            {/* Sources */}
                            {message.sources && message.sources.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-4"
                              >
                                <Separator className="my-4 opacity-30" />
                                <div className="space-y-3">
                                  <p className="text-xs font-medium opacity-70 flex items-center gap-2">
                                    <Info className="w-3 h-3" />
                                    Sources & References:
                                  </p>
                                  <div className="space-y-2">
                                    {message.sources.map((src, idx) => (
                                      <motion.a
                                        key={`${message.id}-source-${idx}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + idx * 0.1 }}
                                        href={src.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-xs hover:underline opacity-80 hover:opacity-100 transition-all p-3 bg-muted/30 rounded-lg border border-border/20 hover:border-accent/30 hover:bg-accent/5"
                                      >
                                        <div className="font-medium">{src.title || 'Source'}</div>
                                        <div className="text-muted-foreground mt-1 truncate">{src.url}</div>
                                      </motion.a>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* Message Actions - ChatGPT style */}
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 hover:bg-accent/10 transition-colors"
                              onClick={() => copyToClipboard(message.content || '', message.id)}
                            >
                              <motion.div
                                animate={copiedMessageId === message.id ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.2 }}
                              >
                                {copiedMessageId === message.id ? 
                                  <Check className="w-3 h-3 text-green-600" /> : 
                                  <Copy className="w-3 h-3" />
                                }
                              </motion.div>
                            </Button>
                            
                            {message.role === "user" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 hover:bg-accent/10 transition-colors"
                                onClick={() => {
                                  // TODO: Implement edit functionality
                                  console.log('Edit message:', message.id)
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            )}
                          </motion.div>
                        </div>

                        {/* User Avatar - Small and minimal */}
                        {message.role === "user" && (
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Enhanced Loading State */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-3 w-full justify-start"
                >
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-accent" />
                  </div>
                  <div className="p-3 bg-muted/20 rounded-2xl border border-border/10 max-w-xs">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4 text-accent" />
                      </motion.div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">AI is thinking...</span>
                        <div className="flex items-center gap-1 mt-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ 
                                opacity: [0.3, 1, 0.3],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{ 
                                duration: 1.5, 
                                repeat: Infinity,
                                delay: i * 0.2
                              }}
                              className="w-1.5 h-1.5 bg-accent rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Scroll anchor with proper spacing */}
              <div 
                ref={messagesEndRef} 
                className="h-4 w-full" 
                style={{ scrollMarginBottom: '16px' }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
