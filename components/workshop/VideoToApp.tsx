'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Video, Code, Wand2, ExternalLink, Download, Play, ArrowRight, CheckCircle, Clock, Sparkles, Monitor, Tablet, Smartphone, Maximize2, FileText, FileCode, Share2, Bookmark, History, Copy, Brain, BookOpen, Presentation, HelpCircle } from 'lucide-react'
import { cn } from '@/src/core/utils'

interface VideoToAppProps {
  mode?: 'workshop' | 'chat' | 'standalone'
  videoUrl?: string
  onVideoUrlChange?: (url: string) => void
  onAppGenerated?: (result: any) => void
  className?: string
}

export function VideoToApp({
  mode = 'standalone',
  videoUrl = '',
  onVideoUrlChange,
  onAppGenerated,
  className
}: VideoToAppProps) {
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl)
  const [userPrompt, setUserPrompt] = useState('')
  const [currentStep, setCurrentStep] = useState<'input' | 'spec' | 'code' | 'preview'>('input')
  const [generatedSpec, setGeneratedSpec] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false)
  const [exportFormat, setExportFormat] = useState<'html' | 'json' | 'pdf'>('html')
  const [selectedTemplate, setSelectedTemplate] = useState<'quiz' | 'flashcard' | 'interactive' | 'general'>('general')
  const [appHistory, setAppHistory] = useState<Array<{
    id: string
    videoUrl: string
    spec: string
    code: string
    timestamp: Date
    title: string
  }>>([])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [analytics, setAnalytics] = useState({
    totalGenerated: 0,
    successRate: 100,
    avgProcessingTime: 0,
    lastGenerated: null as Date | null
  })

  const handleVideoUrlChange = (url: string) => {
    setCurrentVideoUrl(url)
    onVideoUrlChange?.(url)
    setError(null)
  }

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    return youtubeRegex.test(url)
  }

  const generateSpec = async () => {
    if (!validateYouTubeUrl(currentVideoUrl)) {
      setError('Please enter a valid YouTube URL')
      return
    }

    const startTime = Date.now()
    setIsLoading(true)
    setError(null)

    try {
      // 📊 Analytics: Track generation attempt with template info
      const templateInstructions = {
        quiz: 'Focus heavily on creating quiz questions, multiple choice, and knowledge testing elements.',
        flashcard: 'Emphasize flashcard creation with key terms, definitions, and memory reinforcement.',
        interactive: 'Create interactive elements like drag-and-drop, clickable demos, and hands-on activities.',
        general: 'Create a balanced learning app with various educational components.'
      }
      
      const enhancedPrompt = userPrompt.trim() 
        ? `${userPrompt.trim()} Template preference: ${templateInstructions[selectedTemplate]}`
        : templateInstructions[selectedTemplate]

      const response = await fetch('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateSpec',
          videoUrl: currentVideoUrl,
          userPrompt: enhancedPrompt,
          template: selectedTemplate
        })
      })

      if (!response.ok) {
        // 📉 Analytics: Track failure
        setAnalytics(prev => ({
          ...prev,
          successRate: Math.max(0, prev.successRate - 5) // Reduce success rate on failure
        }))
        throw new Error(`Failed to generate spec: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.spec) {
        setGeneratedSpec(data.spec)
        setCurrentStep('spec')
        
        // 📈 Analytics: Track successful spec generation
        const processingTime = Date.now() - startTime
        setAnalytics(prev => ({
          totalGenerated: prev.totalGenerated + 1,
          successRate: Math.min(100, prev.successRate + 1),
          avgProcessingTime: (prev.avgProcessingTime + processingTime) / 2,
          lastGenerated: new Date()
        }))
      } else {
        throw new Error('No spec generated')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate app specification')
      // 📉 Analytics: Track failure
      setAnalytics(prev => ({
        ...prev,
        successRate: Math.max(0, prev.successRate - 2)
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const generateCode = async () => {
    if (!generatedSpec) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateCode',
          spec: generatedSpec
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to generate code: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.code) {
        setGeneratedCode(data.code)
        setCurrentStep('code')
        onAppGenerated?.({
          spec: generatedSpec,
          code: data.code,
          videoUrl: currentVideoUrl
        })
      } else {
        throw new Error('No code generated')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate app code')
    } finally {
      setIsLoading(false)
    }
  }

  // 📁 ENHANCED EXPORT SYSTEM - Multiple formats and options
  const downloadCode = (format: 'html' | 'json' | 'pdf' = exportFormat) => {
    if (!generatedCode) return
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    switch (format) {
      case 'html':
        const htmlBlob = new Blob([generatedCode], { type: 'text/html' })
        const htmlUrl = URL.createObjectURL(htmlBlob)
        const htmlLink = document.createElement('a')
        htmlLink.href = htmlUrl
        htmlLink.download = `learning-app-${timestamp}.html`
        htmlLink.click()
        URL.revokeObjectURL(htmlUrl)
        break
        
      case 'json':
        // Extract app structure as JSON
        const appData = {
          videoUrl: currentVideoUrl,
          spec: generatedSpec,
          code: generatedCode,
          generated: new Date().toISOString(),
          metadata: {
            userPrompt,
            format: 'html',
            size: generatedCode.length
          }
        }
        const jsonBlob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' })
        const jsonUrl = URL.createObjectURL(jsonBlob)
        const jsonLink = document.createElement('a')
        jsonLink.href = jsonUrl
        jsonLink.download = `learning-app-data-${timestamp}.json`
        jsonLink.click()
        URL.revokeObjectURL(jsonUrl)
        break
        
      case 'pdf':
        // For now, download HTML and suggest PDF conversion
        // In the future, could implement server-side PDF generation
        downloadCode('html')
        alert('PDF export coming soon! For now, open the HTML file and use your browser\'s "Print to PDF" feature.')
        break
    }
  }

  const previewApp = () => {
    if (generatedCode) {
      setCurrentStep('preview')
      
      // 🔖 Auto-save to history for collaboration
      const appEntry = {
        id: Math.random().toString(36).substring(7),
        videoUrl: currentVideoUrl,
        spec: generatedSpec,
        code: generatedCode,
        timestamp: new Date(),
        title: `Learning App - ${new Date().toLocaleDateString()}`
      }
      setAppHistory(prev => [appEntry, ...prev.slice(0, 9)]) // Keep last 10
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem('video-app-history', JSON.stringify([appEntry, ...appHistory.slice(0, 9)]))
      } catch (e) {
        console.warn('Failed to save app history:', e)
      }
    }
  }

  // 🔗 COLLABORATION FUNCTIONS
  const shareApp = async () => {
    if (!generatedCode) return
    
    try {
      // Create shareable link using blob URL
      const blob = new Blob([generatedCode], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      if (navigator.share && navigator.canShare?.({ url })) {
        await navigator.share({
          title: 'Interactive Learning App',
          text: 'Check out this AI-generated learning app!',
          url
        })
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(url)
        alert('Shareable link copied to clipboard!')
      }
    } catch (error) {
      console.error('Sharing failed:', error)
      // Final fallback: Download and share manually
      downloadCode('html')
    }
  }

  const bookmarkApp = () => {
    setIsBookmarked(!isBookmarked)
    const action = !isBookmarked ? 'bookmarked' : 'removed bookmark from'
    alert(`Successfully ${action} this learning app!`)
  }

  const copyAppCode = async () => {
    if (!generatedCode) return
    
    try {
      await navigator.clipboard.writeText(generatedCode)
      alert('App code copied to clipboard!')
    } catch (error) {
      console.error('Copy failed:', error)
      downloadCode('html') // Fallback to download
    }
  }

  // 📊 Step Configuration with Professional Styling
  const steps = [
    { id: 'input', label: 'Video Input', icon: Video, description: 'Provide YouTube URL and requirements' },
    { id: 'spec', label: 'App Specification', icon: Wand2, description: 'AI generates detailed app blueprint' },
    { id: 'code', label: 'Code Generation', icon: Code, description: 'Create interactive learning application' },
    { id: 'preview', label: 'Live Preview', icon: ExternalLink, description: 'Test and download your app' }
  ]
  
  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100

  return (
    <div className={cn('space-y-8', className)}>
      {/* 🎯 PROFESSIONAL PROGRESS HEADER */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-text">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand">
                <Video className="size-5 text-surface" />
              </div>
              Video to Learning App
            </h2>
            <p className="mt-1 text-text-muted">Transform YouTube videos into interactive learning experiences</p>
          </div>
          <Badge variant="outline" className="border-border bg-surface text-text">
            Step {currentStepIndex + 1} of {steps.length}
          </Badge>
        </div>
        
        {/* 📈 Visual Progress Indicator with Analytics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Progress</span>
            <div className="flex items-center gap-4">
              {selectedTemplate !== 'general' && (
                <Badge variant="outline" className="bg-brand/5 border-brand/20 text-xs text-brand">
                  {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template
                </Badge>
              )}
              {analytics.totalGenerated > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="border-border bg-surface text-text">
                    {analytics.totalGenerated} generated
                  </Badge>
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                    {analytics.successRate}% success
                  </Badge>
                </div>
              )}
              <span className="font-medium text-text">{Math.round(progressPercentage)}% Complete</span>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              const StepIcon = step.icon
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <motion.div
                    className={`flex size-10 items-center justify-center rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-green-600 text-white' :
                      isCurrent ? 'bg-brand text-surface' : 'border border-border bg-surface-elevated text-text-muted'
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isCompleted ? <CheckCircle className="size-5" /> : <StepIcon className="size-5" />}
                  </motion.div>
                  <div className="text-center">
                    <div className={`text-xs font-medium ${isCurrent ? 'text-text' : 'text-text-muted'}`}>
                      {step.label}
                    </div>
                    <div className="max-w-20 truncate text-xs text-text-muted">
                      {step.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 🎬 STEP CONTENT WITH ANIMATIONS */}
      <AnimatePresence mode="wait">
        {/* Input Step */}
        {currentStep === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-l-4 border-l-brand">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-brand/10 flex size-8 items-center justify-center rounded-lg">
                    <Video className="size-4 text-brand" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">YouTube Video Input</div>
                    <div className="text-sm font-normal text-text-muted">Provide the video URL and any specific requirements</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="video-url" className="text-sm font-medium">YouTube Video URL</Label>
                  <Input
                    id="video-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    value={currentVideoUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    className="h-12 border-border focus:border-brand"
                  />
                  {currentVideoUrl && validateYouTubeUrl(currentVideoUrl) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-green-600"
                    >
                      <CheckCircle className="size-4" />
                      Valid YouTube URL detected
                    </motion.div>
                  )}
                </div>
                
                {/* 🎨 TEMPLATE SELECTION SYSTEM */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">App Template Type</Label>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      { id: 'quiz', label: 'Quiz App', icon: Brain, description: 'Question-focused learning', color: 'blue' },
                      { id: 'flashcard', label: 'Flashcards', icon: BookOpen, description: 'Memory reinforcement', color: 'green' },
                      { id: 'interactive', label: 'Interactive', icon: Presentation, description: 'Hands-on activities', color: 'purple' },
                      { id: 'general', label: 'General', icon: HelpCircle, description: 'Balanced approach', color: 'gray' }
                    ].map((template) => {
                      const Icon = template.icon
                      const isSelected = selectedTemplate === template.id
                      return (
                        <motion.div
                          key={template.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedTemplate(template.id as any)}
                            className={`w-full rounded-lg border p-3 text-left transition-all duration-200 ${
                              isSelected 
                                ? 'bg-brand/5 border-brand shadow-md' 
                                : 'hover:border-brand/50 border-border bg-surface hover:bg-surface-elevated'
                            }`}
                          >
                            <div className="mb-1 flex items-center gap-2">
                              <Icon className={`size-4 ${isSelected ? 'text-brand' : 'text-text-muted'}`} />
                              <span className={`text-sm font-medium ${isSelected ? 'text-brand' : 'text-text'}`}>
                                {template.label}
                              </span>
                            </div>
                            <div className="text-xs text-text-muted">
                              {template.description}
                            </div>
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-2"
                              >
                                <CheckCircle className="size-4 text-brand" />
                              </motion.div>
                            )}
                          </button>
                        </motion.div>
                      )
                    })}
                  </div>
                  <div className="text-xs text-text-muted">
                    Choose the learning style that best fits your needs. The AI will optimize the app accordingly.
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-prompt" className="text-sm font-medium">Additional Instructions (Optional)</Label>
                  <Textarea
                    id="user-prompt"
                    placeholder="e.g., 'Focus on creating quiz questions about React hooks' or 'Make it suitable for beginners'"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    rows={3}
                    className="resize-none border-border focus:border-brand"
                  />
                  <div className="text-xs text-text-muted">
                    Combine with your chosen template for best results
                  </div>
                </div>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20"
                  >
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <ExternalLink className="size-4" />
                      <span className="font-medium">Error</span>
                    </div>
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={generateSpec}
                    disabled={isLoading || !currentVideoUrl.trim()}
                    size="lg"
                    className="h-12 w-full rounded-xl bg-brand text-surface shadow-lg hover:bg-brand-hover disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="size-4 rounded-full border-2 border-white border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Analyzing Video...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-5" />
                        Generate App Specification
                        <ArrowRight className="ml-1 size-4" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Spec Step */}
        {currentStep === 'spec' && generatedSpec && (
          <motion.div
            key="spec"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-green-500/10">
                    <Wand2 className="size-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">App Specification Generated</div>
                    <div className="text-sm font-normal text-text-muted">Review the AI-generated app blueprint and proceed to code generation</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="max-h-80 overflow-y-auto rounded-xl border border-border bg-surface-elevated p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span className="text-sm font-medium text-text">Specification Ready</span>
                    <Badge variant="outline" className="border-border bg-surface text-xs text-text">
                      {generatedSpec.length} characters
                    </Badge>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-text">{generatedSpec}</pre>
                </div>
                
                <div className="flex gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button 
                      onClick={generateCode}
                      disabled={isLoading}
                      size="lg"
                      className="h-12 w-full rounded-xl bg-brand text-surface shadow-lg hover:bg-brand-hover disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="size-4 rounded-full border-2 border-white border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Generating Code...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Code className="size-5" />
                          Generate App Code
                          <ArrowRight className="ml-1 size-4" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('input')}
                    className="h-12 rounded-xl border-border px-6 hover:bg-surface-elevated"
                  >
                    Back to Input
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Code Step */}
        {currentStep === 'code' && generatedCode && (
          <motion.div
            key="code"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <Code className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Interactive App Generated</div>
                    <div className="text-sm font-normal text-text-muted">Your learning application is ready for preview and download</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl border border-border bg-surface-elevated p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="size-6 text-green-600" />
                    </motion.div>
                    <div>
                      <div className="text-sm font-medium text-text">Code Generation Complete</div>
                      <div className="text-xs text-text-muted">Interactive learning app successfully created</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-border bg-surface p-3 text-center">
                      <div className="text-lg font-semibold text-text">{Math.round(generatedCode.length / 1000)}KB</div>
                      <div className="text-xs text-text-muted">File Size</div>
                    </div>
                    <div className="rounded-lg border border-border bg-surface p-3 text-center">
                      <div className="text-lg font-semibold text-brand">HTML</div>
                      <div className="text-xs text-text-muted">Format</div>
                    </div>
                    <div className="rounded-lg border border-border bg-surface p-3 text-center">
                      <div className="text-lg font-semibold text-green-600">Ready</div>
                      <div className="text-xs text-text-muted">Status</div>
                    </div>
                    <div className="rounded-lg border border-border bg-surface p-3 text-center">
                      <div className="text-lg font-semibold text-text">{new Date().toLocaleTimeString()}</div>
                      <div className="text-xs text-text-muted">Generated</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button 
                      onClick={previewApp}
                      size="lg"
                      className="h-12 w-full rounded-xl bg-brand text-surface shadow-lg hover:bg-brand-hover"
                    >
                      <Play className="mr-2 size-5" />
                      Preview App
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </motion.div>
                  
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={downloadCode}
                    className="h-12 rounded-xl border-border px-6 hover:bg-surface-elevated"
                  >
                    <Download className="mr-2 size-4" />
                    Download
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    size="lg"
                    onClick={() => setCurrentStep('input')}
                    className="h-12 rounded-xl px-6 text-text-muted hover:bg-surface-elevated hover:text-text"
                  >
                    New Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && generatedCode && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10">
                    <ExternalLink className="size-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Live App Preview</div>
                    <div className="text-sm font-normal text-text-muted">Test your interactive learning application in real-time</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 📱 ADVANCED PREVIEW CONTROLS */}
                <div className="rounded-xl border border-border bg-surface-elevated p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-3 animate-pulse rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-text">Live Interactive Preview</span>
                      <Badge variant="outline" className="border-border bg-surface text-xs text-text">
                        Responsive
                      </Badge>
                    </div>
                    
                    {/* Device Preview Toggles */}
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
                      <Button
                        variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPreviewMode('desktop')}
                        className={`h-8 rounded-md px-3 ${previewMode === 'desktop' ? 'bg-brand text-surface' : 'text-text-muted hover:text-text'}`}
                      >
                        <Monitor className="size-3" />
                      </Button>
                      <Button
                        variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPreviewMode('tablet')}
                        className={`h-8 rounded-md px-3 ${previewMode === 'tablet' ? 'bg-brand text-surface' : 'text-text-muted hover:text-text'}`}
                      >
                        <Tablet className="size-3" />
                      </Button>
                      <Button
                        variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPreviewMode('mobile')}
                        className={`h-8 rounded-md px-3 ${previewMode === 'mobile' ? 'bg-brand text-surface' : 'text-text-muted hover:text-text'}`}
                      >
                        <Smartphone className="size-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Responsive Preview Container */}
                  <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
                    <motion.div
                      className={`mx-auto transition-all duration-300 ${
                        previewMode === 'desktop' ? 'w-full' :
                        previewMode === 'tablet' ? 'w-3/4 max-w-2xl' : 'w-1/3 max-w-sm'
                      }`}
                      layout
                    >
                      <iframe
                        srcDoc={generatedCode}
                        className="h-96 w-full border-0 bg-white"
                        title="Generated App Preview"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </motion.div>
                    
                    {/* Fullscreen Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreenPreview(true)}
                      className="bg-surface/80 absolute right-2 top-2 size-8 rounded-md border border-border p-0 backdrop-blur-sm hover:bg-surface"
                    >
                      <Maximize2 className="size-4" />
                    </Button>
                  </div>
                  
                  {/* Preview Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">
                      Viewing in {previewMode} mode • {Math.round(generatedCode.length / 1000)}KB
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">Export as:</span>
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
                        <Button
                          variant={exportFormat === 'html' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setExportFormat('html')}
                          className={`h-6 rounded-sm px-2 text-xs ${exportFormat === 'html' ? 'bg-brand text-surface' : 'text-text-muted'}`}
                        >
                          HTML
                        </Button>
                        <Button
                          variant={exportFormat === 'json' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setExportFormat('json')}
                          className={`h-6 rounded-sm px-2 text-xs ${exportFormat === 'json' ? 'bg-brand text-surface' : 'text-text-muted'}`}
                        >
                          JSON
                        </Button>
                        <Button
                          variant={exportFormat === 'pdf' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setExportFormat('pdf')}
                          className={`h-6 rounded-sm px-2 text-xs ${exportFormat === 'pdf' ? 'bg-brand text-surface' : 'text-text-muted'}`}
                          disabled
                        >
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 🤝 COLLABORATION ACTIONS */}
                <div className="rounded-xl border border-border bg-surface p-4">
                  <div className="mb-3 text-sm font-medium text-text">Collaboration & Sharing</div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareApp}
                      className="h-10 rounded-lg border-border hover:bg-surface-elevated"
                    >
                      <Share2 className="mr-2 size-4" />
                      Share
                    </Button>
                    
                    <Button
                      variant={isBookmarked ? "default" : "outline"}
                      size="sm"
                      onClick={bookmarkApp}
                      className={`h-10 rounded-lg ${isBookmarked ? 'bg-brand text-surface hover:bg-brand-hover' : 'border-border hover:bg-surface-elevated'}`}
                    >
                      <Bookmark className="mr-2 size-4" />
                      {isBookmarked ? 'Saved' : 'Save'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAppCode}
                      className="h-10 rounded-lg border-border hover:bg-surface-elevated"
                    >
                      <Copy className="mr-2 size-4" />
                      Copy Code
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Show app history modal or sidebar
                        alert(`App History:\n${appHistory.length} saved apps\nNext: Implement history panel`)
                      }}
                      className="h-10 rounded-lg border-border hover:bg-surface-elevated"
                    >
                      <History className="mr-2 size-4" />
                      History
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline"
                      size="lg"
                      onClick={() => downloadCode(exportFormat)}
                      className="h-12 rounded-xl border-brand px-6 text-brand hover:bg-brand hover:text-surface"
                    >
                      {exportFormat === 'html' ? <FileCode className="mr-2 size-4" /> : 
                       exportFormat === 'json' ? <FileText className="mr-2 size-4" /> : 
                       <Download className="mr-2 size-4" />}
                      Download {exportFormat.toUpperCase()}
                    </Button>
                  </motion.div>
                  
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('code')}
                    className="h-12 rounded-xl border-border px-6 hover:bg-surface-elevated"
                  >
                    Back to Code
                  </Button>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button 
                      onClick={() => setCurrentStep('input')}
                      size="lg"
                      className="h-12 w-full rounded-xl bg-brand text-surface shadow-lg hover:bg-brand-hover"
                    >
                      <Video className="mr-2 size-4" />
                      Create Another App
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VideoToApp
