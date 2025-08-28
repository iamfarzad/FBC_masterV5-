'use client'

import React from 'react'
import { RotateCcw, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FbcIcon } from '@/components/ui/fbc-icon'
import { cn } from '@/src/core/utils'

interface ChatHeaderProps {
  sessionId?: string | null
  onClearMessages?: () => void
  onOpenVoice?: () => void
  className?: string
  showVoiceButton?: boolean
  rightSlot?: React.ReactNode
}

export function ChatHeader({
  sessionId,
  onClearMessages,
  onOpenVoice,
  className,
  showVoiceButton = true,
  rightSlot
}: ChatHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between p-4', className)}>
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
          <FbcIcon className="h-4 w-4 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">F.B/c AI Assistant</h1>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">Intelligent business consulting</p>
            {sessionId && (
              <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
                <div className="w-1.5 h-1.5 bg-success rounded-full mr-1 animate-pulse" />
                Connected
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {rightSlot}
        
        {showVoiceButton && onOpenVoice && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onOpenVoice}
            className="border-border/30 hover:border-accent/50 hover:bg-accent/10 rounded-xl"
          >
            <Mic className="h-4 w-4 mr-1" />
            Voice
          </Button>
        )}
        
        {onClearMessages && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearMessages}
            className="border-border/30 hover:border-accent/50 hover:bg-accent/10 rounded-xl"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
        

      </div>
    </div>
  )
}