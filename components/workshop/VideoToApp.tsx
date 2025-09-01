"use client"

import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { cn } from '@/src/core/utils'
import { useToast } from '@/hooks/use-toast'
import {
  VideoToAppProps,
  ProgressStep,
  DEFAULT_PROGRESS_STEPS,
  validateYouTubeUrl,
  extractVideoInfo
} from './VideoToAppConstants'
import { InputSection } from './InputSection'
import { AppPreview } from './AppPreview'

export function VideoToApp({
  mode = 'card',
  videoUrl: initialVideoUrl = '',
  onVideoUrlChange,
  onAppGenerated,
  className
}: VideoToAppProps) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  // State management
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl)
  const [userPrompt, setUserPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAppUrl, setGeneratedAppUrl] = useState<string | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(DEFAULT_PROGRESS_STEPS)

  // Update parent when video URL changes
  useEffect(() => {
    if (onVideoUrlChange && videoUrl !== initialVideoUrl) {
      onVideoUrlChange(videoUrl)
    }
  }, [videoUrl, onVideoUrlChange, initialVideoUrl])

  // Progress step management
  const updateProgressStep = (stepId: string, status: ProgressStep['status']) => {
    setProgressSteps(prev =>
      prev.map(step =>
        step.id === stepId
          ? { ...step, status }
          : step
      )
    )
  }

  // Main generation handler
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

  // Reset handler
  const handleReset = () => {
    setGeneratedAppUrl(null)
    setGeneratedCode(null)
    setProgressSteps(prev =>
      prev.map(step => ({ ...step, status: 'pending' }))
    )
  }

  // State handlers for child components
  const handleVideoUrlChange = (url: string) => setVideoUrl(url)
  const handleUserPromptChange = (prompt: string) => setUserPrompt(prompt)

  // Different render modes
  if (mode === 'card') {
    return (
      <div className={cn("bg-surface rounded-lg border border-border p-6", className)}>
        <AnimatePresence mode="wait">
          {!generatedAppUrl ? (
            <InputSection
              ref={inputRef}
              videoUrl={videoUrl}
              userPrompt={userPrompt}
              isGenerating={isGenerating}
              progressSteps={progressSteps}
              onVideoUrlChange={handleVideoUrlChange}
              onUserPromptChange={handleUserPromptChange}
              onGenerate={handleGenerate}
            />
          ) : (
            <AppPreview
              videoUrl={videoUrl}
              generatedAppUrl={generatedAppUrl}
              generatedCode={generatedCode}
              onReset={handleReset}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Workshop and fullscreen modes
  return (
    <div className={cn("h-full", className)}>
      <AnimatePresence mode="wait">
        {!generatedAppUrl ? (
          <InputSection
            ref={inputRef}
            videoUrl={videoUrl}
            userPrompt={userPrompt}
            isGenerating={isGenerating}
            progressSteps={progressSteps}
            onVideoUrlChange={handleVideoUrlChange}
            onUserPromptChange={handleUserPromptChange}
            onGenerate={handleGenerate}
          />
        ) : (
          <AppPreview
            videoUrl={videoUrl}
            generatedAppUrl={generatedAppUrl}
            generatedCode={generatedCode}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
