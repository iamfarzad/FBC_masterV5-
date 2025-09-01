import React from 'react'
import { cn } from '@/src/core/utils'
import { type ActivityStage } from '../ActivityConstants'

interface StageTooltipProps {
  stage: ActivityStage
  position: { x: number; y: number }
  stageProgress?: number
}

export function StageTooltip({ stage, position, stageProgress }: StageTooltipProps) {
  return (
    <div
      className="fixed z-50 pointer-events-none transition-all duration-200"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-100%, -50%)'
      }}
    >
      <div className="bg-card text-card-foreground px-3 py-2 rounded-lg shadow-xl border border-border text-xs whitespace-nowrap">
        <div className="font-medium mb-1">{stage.label}</div>
        <div className="text-muted-foreground text-xs mb-1">
          {stage.current ? 'Current Stage' : stage.done ? 'Completed' : 'Pending'}
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span
            className={cn("px-1.5 py-0.5 rounded text-xs", {
              "bg-accent/10 text-accent": stage.done || stage.current,
              "bg-muted/20 text-muted-foreground": !stage.done && !stage.current,
            })}
          >
            {stage.current ? '●' : stage.done ? '✓' : '○'}
          </span>

          {stageProgress && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-xs">{stageProgress}/7</span>
            </div>
          )}
        </div>

        {/* Tooltip arrow */}
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-card" />
      </div>
    </div>
  )
}
