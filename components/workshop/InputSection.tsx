"use client"

import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Video, Loader2, Zap } from 'lucide-react'
import { cn } from '@/src/core/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressTracker } from './ProgressTracker'
import { ProgressStep } from './VideoToAppConstants'

interface InputSectionProps {
  videoUrl: string
  userPrompt: string
  isGenerating: boolean
  progressSteps: ProgressStep[]
  onVideoUrlChange: (url: string) => void
  onUserPromptChange: (prompt: string) => void
  onGenerate: () => void
  inputRef: React.RefObject<HTMLInputElement>
}

export const InputSection = forwardRef<HTMLDivElement, InputSectionProps>(({
  videoUrl,
  userPrompt,
  isGenerating,
  progressSteps,
  onVideoUrlChange,
  onUserPromptChange,
  onGenerate,
  inputRef
}, ref) => {
  return (
    <motion.div
      ref={ref}
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
            onChange={(e) => onVideoUrlChange(e.target.value)}
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
            onChange={(e) => onUserPromptChange(e.target.value)}
            disabled={isGenerating}
            className="w-full h-12 bg-surface-elevated/50 border-border/50 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-300"
          />
        </div>
      </div>

      {(isGenerating || progressSteps.some(s => s.status !== 'pending')) && (
        <Card className="bg-surface-elevated/30">
          <CardContent className="p-6">
            <ProgressTracker progressSteps={progressSteps} />
          </CardContent>
        </Card>
      )}

      <Button
        onClick={onGenerate}
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
})

InputSection.displayName = 'InputSection'
