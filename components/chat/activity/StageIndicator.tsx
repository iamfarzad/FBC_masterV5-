"use client"

import React from 'react'
import { cn } from '@/src/core/utils'
import { type ActivityStage } from './ActivityConstants'

interface StageIndicatorProps {
  stages: ActivityStage[]
  currentStage?: string
  stageProgress?: number
}

export function StageIndicator({ stages, currentStage, stageProgress }: StageIndicatorProps) {
  return (
    <div className="mb-6 opacity-20 hover:opacity-100 transition-all duration-300">
      <div className="flex flex-col items-center space-y-2">
        <div className="text-xs text-muted-foreground font-medium mb-2">7-Stage Flow</div>
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className="relative flex flex-col items-center group"
          >
            {/* Connection line to next stage */}
            {index < stages.length - 1 && (
              <div className="absolute top-full left-1/2 w-px h-3 -translate-x-px">
                <div className={cn(
                  "w-full h-full transition-all duration-300",
                  stage.done ? "bg-accent/40" : "bg-muted-foreground/20"
                )} />
              </div>
            )}

            {/* Stage node */}
            <div className={cn(
              "relative flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer",
              stage.current ? "w-4 h-4 bg-accent border-accent/50 shadow-sm animate-pulse" :
              stage.done ? "w-3 h-3 bg-accent border-accent/50 shadow-sm" :
              "w-2.5 h-2.5 bg-muted-foreground/30 border-muted-foreground/20 opacity-60"
            )}>
              {stage.current && (
                <div className="absolute inset-0 rounded-full border border-accent/30 animate-ping" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
