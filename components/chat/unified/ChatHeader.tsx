"use client"

import React, { memo } from 'react'
import { RotateCcw, Settings, Maximize2 } from 'lucide-react'
import { cn } from '@/src/core/utils'
import { Button } from '@/components/ui/button'
import { FbcIcon } from '@/components/ui/fbc-icon'

interface ChatHeaderProps {
  onReset: () => void
  onSettings: () => void
  sessionId?: string | null | undefined
  className?: string
}

export const ChatHeader = memo<ChatHeaderProps>(({
  onReset,
  onSettings,
  sessionId,
  className
}) => {
  return (
    <header className={cn(
      "sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 p-4 backdrop-blur",
      className
    )}>
      <div className="flex items-center gap-3">
        <FbcIcon variant="default" size={24} />
        <div>
          <h1 className="text-xl font-bold text-foreground">F.B/c</h1>
          <p className="text-xs text-muted-foreground">
            Unified AI Platform • Session {sessionId ? sessionId.slice(-6) : 'New'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="border-accent/30 hover:border-accent hover:bg-accent/10"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSettings}
          className="border-accent/30 hover:border-accent hover:bg-accent/10"
        >
          <Settings className="w-3.5 h-3.5 mr-1.5" />
          Settings
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-accent/10"
        >
          <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
          Fullscreen
        </Button>
      </div>
    </header>
  )
})

ChatHeader.displayName = 'ChatHeader'