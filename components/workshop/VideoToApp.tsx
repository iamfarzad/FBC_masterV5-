'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video, Sparkles, Loader2, Link, Play, Code, Wand2,
  Youtube, AlertCircle, CheckCircle, Clock, Zap
} from 'lucide-react'
import { cn } from '@/src/core/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'

interface VideoToAppProps {
  mode?: 'workshop' | 'fullscreen' | 'card'
  videoUrl?: string
  onVideoUrlChange?: (url: string) => void
  onAppGenerated?: (appUrl: string, videoUrl: string) => void
  className?: string
}

interface ProgressStep {
  id: string
  label: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'error'
  icon: React.ReactNode
}

export function VideoToApp({
  mode = 'card',
  videoUrl: initialVideoUrl = '',
  onVideoUrlChange,
  onAppGenerated,
  className
}: VideoToAppProps) {
  const { toast } = useToast()
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl)
  const [userPrompt, setUserPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAppUrl, setGeneratedAppUrl] = useState<string | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([
    {
      id: 'analyze',
      label: 'Analyzing Video',
      description: 'Extracting content and structure',
      status: 'pending',
      icon: <Youtube className="w-4 h-4" />
    },
    {
      id: 'spec',
      label: 'Generating Spec',
      description: 'Creating learning objectives',
      status: 'pending',
      icon: <Wand2 className="w-4 h-4" />
    },
    {
      id: 'code',
      label: 'Building App',
      description: 'Creating interactive experience',
      status: 'pending',
      icon: <Code className="w-4 h-4" />
    },
    {
      id: 'ready',
      label: 'App Ready',
      description: 'Your learning app is complete',
      status: 'pending',
      icon: <Sparkles className="w-4 h-4" />
    }
  ])

  const inputRef = useRef<HTMLInputElement>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Update parent when video URL changes
  useEffect(() => {
    if (onVideoUrlChange && videoUrl !== initialVideoUrl) {
      onVideoUrlChange(videoUrl)
    }
  }, [videoUrl, onVideoUrlChange, initialVideoUrl])

  const updateProgressStep = (stepId: string, status: ProgressStep['status']) => {
    setProgressSteps(prev =>
      prev.map(step =>
        step.id === stepId
          ? { ...step, status }
          : step
      )
    )
  }

  const validateYouTubeUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/.test(url)
    } catch {
      return false
    }
  }

  const extractVideoInfo = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
    return {
      videoId: videoIdMatch?.[1] || '',
      title: `Video ${videoIdMatch?.[1]?.substring(0, 8) || 'Content'}`
    }
  }

  const handleGenerate = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "Missing Video URL",
        description: "Please provide a YouTube video URL to continue.",
        variant: "destructive",
      })
      inputRef.current?.focus()
      return
    }

    if (!validateYouTubeUrl(videoUrl)) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please provide a valid YouTube video URL.",
        variant: "destructive",
      })
      inputRef.current?.focus()
      return
    }

    setIsGenerating(true)
    setGeneratedAppUrl(null)
    setGeneratedCode(null)

    // Reset progress
    setProgressSteps(prev =>
      prev.map(step => ({ ...step, status: 'pending' }))
    )

    try {
      const { videoId, title } = extractVideoInfo(videoUrl)

      // Step 1: Analyze video
      updateProgressStep('analyze', 'active')
      toast({
        title: "Analyzing Video",
        description: `Extracting content from "${title}"...`,
      })

      const specResponse = await fetch('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "generateSpec",
          videoUrl,
          userPrompt: userPrompt.trim() || undefined
        }),
      })

      if (!specResponse.ok) {
        const errorData = await specResponse.json()
        throw new Error(errorData.details || 'Failed to analyze video')
      }

      updateProgressStep('analyze', 'completed')
      updateProgressStep('spec', 'active')

      const specResult = await specResponse.json()
      if (specResult?.error) throw new Error(specResult.error)

      toast({
        title: "Generating Learning App",
        description: "Creating interactive learning experience...",
      })

      // Step 2: Generate code
      const codeResponse = await fetch('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "generateCode",
          spec: specResult.spec
        }),
      })

      if (!codeResponse.ok) {
        const errorData = await codeResponse.json()
        throw new Error(errorData.details || 'Failed to generate app')
      }

      updateProgressStep('spec', 'completed')
      updateProgressStep('code', 'active')

      const codeResult = await codeResponse.json()
      if (codeResult?.error) throw new Error(codeResult.error)

      updateProgressStep('code', 'completed')
      updateProgressStep('ready', 'completed')

      // Create blob URL for the generated app
      const blob = new Blob([codeResult.code], { type: 'text/html' })
      const appUrl = URL.createObjectURL(blob)

      setGeneratedAppUrl(appUrl)
      setGeneratedCode(codeResult.code)

      onAppGenerated?.(appUrl, videoUrl)

      toast({
        title: "Learning App Generated!",
        description: "Your interactive learning experience is ready to use.",
      })

    } catch (error) {
      const err = error as Error

      // Update progress to show error
      setProgressSteps(prev =>
        prev.map(step =>
          step.status === 'active' ? { ...step, status: 'error' } : step
        )
      )

      toast({
        title: "Generation Failed",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setGeneratedAppUrl(null)
    setGeneratedCode(null)
    setProgressSteps(prev =>
      prev.map(step => ({ ...step, status: 'pending' }))
    )
  }

  const renderProgressTracker = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Generation Progress
      </h3>
      <div className="space-y-3">
        {progressSteps.map((step, index) => (
          <motion.div
            key={step.id}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              step.status === 'completed' ? 'bg-success text-surface' :
              step.status === 'active' ? 'bg-brand text-surface animate-pulse' :
              step.status === 'error' ? 'bg-destructive text-surface' :
              'bg-surface-elevated text-muted-foreground'
            )}>
              {step.status === 'completed' ? (
                <CheckCircle className="w-4 h-4" />
              ) : step.status === 'active' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step.status === 'error' ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                step.icon
              )}
            </div>
            <div className="flex-1">
              <div className={cn(
                "font-medium text-sm",
                step.status === 'completed' ? 'text-success' :
                step.status === 'active' ? 'text-brand' :
                step.status === 'error' ? 'text-destructive' :
                'text-muted-foreground'
              )}>
                {step.label}
              </div>
              <div className="text-xs text-muted-foreground">{step.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderInputSection = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center">
          <Video className="w-8 h-8 text-brand" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Video to Learning App
        </h2>
        <p className="text-muted-foreground">
          Transform any YouTube video into an interactive learning experience
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            YouTube Video URL
          </label>
          <Input
            ref={inputRef}
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            disabled={isGenerating}
            className="w-full h-12 bg-surface-elevated/50 border-border/50 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            Learning Focus (Optional)
          </label>
          <Input
            placeholder="Describe what you want to focus on in the learning app..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            disabled={isGenerating}
            className="w-full h-12 bg-surface-elevated/50 border-border/50 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-300"
          />
        </div>
      </div>

      {(isGenerating || progressSteps.some(s => s.status !== 'pending')) && (
        <Card className="bg-surface-elevated/30">
          <CardContent className="p-6">
            {renderProgressTracker()}
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !videoUrl.trim()}
        size="lg"
        className="w-full h-14 text-lg font-semibold shadow-glow hover:shadow-glow"
      >
        {isGenerating ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Generating Your Learning App...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6" />
            <span>Generate Learning App</span>
          </div>
        )}
      </Button>
    </motion.div>
  )

  const renderAppPreview = () => (
    <motion.div
      key="app-preview"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Learning App Generated!
          </h3>
          <p className="text-sm text-muted-foreground">
            Your interactive learning experience is ready
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Create New App
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* App Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-0">
              <div className="aspect-video bg-surface-elevated rounded-t-lg overflow-hidden">
                {generatedAppUrl && (
                  <iframe
                    src={generatedAppUrl}
                    className="w-full h-full border-0"
                    title="Generated Learning App"
                    sandbox="allow-scripts allow-same-origin"
                  />
                )}
              </div>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generatedAppUrl && window.open(generatedAppUrl, '_blank')}
                    className="flex-1"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Open Full Screen
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (generatedCode) {
                        navigator.clipboard?.writeText(generatedCode)
                        toast({
                          title: "Copied!",
                          description: "HTML code copied to clipboard.",
                        })
                      }
                    }}
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Info & Actions */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-foreground mb-3">App Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source:</span>
                  <span className="text-foreground truncate max-w-32">
                    {extractVideoInfo(videoUrl).title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Generated:</span>
                  <span className="text-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="text-foreground">
                    {(generatedCode?.length || 0) / 1024}KB
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-foreground mb-3">Features</h4>
              <div className="space-y-2">
                <Badge variant="secondary" className="w-full justify-center">
                  Interactive Elements
                </Badge>
                <Badge variant="secondary" className="w-full justify-center">
                  Mobile Responsive
                </Badge>
                <Badge variant="secondary" className="w-full justify-center">
                  Self-Contained
                </Badge>
                <Badge variant="secondary" className="w-full justify-center">
                  AI-Generated
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-foreground mb-3">Share Options</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Download HTML
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Share Link
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Embed Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )

  // Different render modes
  if (mode === 'card') {
    return (
      <div className={cn("bg-surface rounded-lg border border-border p-6", className)}>
        <AnimatePresence mode="wait">
          {!generatedAppUrl ? renderInputSection() : renderAppPreview()}
        </AnimatePresence>
      </div>
    )
  }

  // Workshop and fullscreen modes
  return (
    <div className={cn("h-full", className)}>
      <AnimatePresence mode="wait">
        {!generatedAppUrl ? renderInputSection() : renderAppPreview()}
      </AnimatePresence>
    </div>
  )
}
