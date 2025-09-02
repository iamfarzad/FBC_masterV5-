"use client"

import React, { memo } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/src/core/utils'

interface StatusBarProps {
  isLoading: boolean
  currentStage?: number
  totalStages?: number
  className?: string
}

export const StatusBar = memo<StatusBarProps>(({
  isLoading,
  currentStage = 1,
  totalStages = 7,
  className
}) => {
  const progress = ((currentStage - 1) / (totalStages - 1)) * 100

  return (
    <div className={cn(
      "flex-shrink-0 border-t border-border bg-background/95 px-4 py-2 text-xs",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <div className="size-2 animate-pulse rounded-full bg-accent" />
              <span className="text-muted-foreground">AI is processing...</span>
            </>
          ) : (
            <>
              <Check className="size-3 text-accent" />
              <span className="text-muted-foreground">Ready</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Stage {currentStage}/{totalStages}</span>
          <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
})

StatusBar.displayName = 'StatusBar'