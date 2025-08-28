'use client'

import React from 'react'
import { cn } from '@/src/core/utils'
import { Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PromptInput,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputTextarea,
  PromptInputSubmit
} from '@/components/ai-elements/prompt-input'
import { ToolMenu } from '@/components/chat/ToolMenu'

interface ChatComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (message: string) => void
  onToolAction?: (tool: string, data?: unknown) => void
  isLoading?: boolean
  placeholder?: string
  topSlot?: React.ReactNode
  className?: string
  sessionId?: string | null
  onOpenVoice?: () => void
  showVoiceButton?: boolean
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onToolAction,
  isLoading = false,
  placeholder = 'Message F.B/c AI...',
  topSlot,
  className,
  sessionId,
  onOpenVoice,
  showVoiceButton = true
}: ChatComposerProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !isLoading) {
      onSubmit(value.trim())
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Top Slot (for suggestions, etc.) */}
      {topSlot && (
        <div className="flex items-center justify-end">
          {topSlot}
        </div>
      )}

      {/* AI-Elements PromptInput */}
      <div className="overflow-visible">
        <PromptInput onSubmit={handleSubmit} aria-label="Chat composer">
        <PromptInputToolbar>
          <div className="flex items-center gap-2 overflow-visible">
            <ToolMenu
              onUploadDocument={() => onToolAction?.('document')}
              onUploadImage={() => onToolAction?.('image')}
              onWebcam={() => onToolAction?.('webcam')}
              onScreenShare={() => onToolAction?.('screen')}
              onROI={() => onToolAction?.('roi')}
              onVideoToApp={() => onToolAction?.('video')}
              comingSoon={['video']} // Only video-to-app is still coming soon
            />
          </div>
        </PromptInputToolbar>
        
        <PromptInputTextarea
          placeholder={placeholder}
          className="min-h-[64px] text-base"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Type your message"
        />
        
        <div className="flex items-center justify-between p-1">
          <div className="text-xs text-muted-foreground">
            Press Enter to send • Shift+Enter for new line
          </div>
          <div className="flex items-center gap-2">
            {showVoiceButton && onOpenVoice && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenVoice}
                className="h-10 w-10 hover:bg-accent/10 rounded-lg"
                title="Voice input"
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
            <PromptInputSubmit disabled={isLoading} />
          </div>
        </div>
        </PromptInput>
      </div>
    </div>
  )
}