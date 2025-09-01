import React from 'react'
import { cn } from '@/src/core/utils'
import { Clock } from 'lucide-react'
import { type ActivityItem } from '../ActivityConstants'

interface ActivityTooltipProps {
  activity: ActivityItem
  position: { x: number; y: number }
  formatDuration: (timestamp?: Date | string) => string
}

export function ActivityTooltip({ activity, position, formatDuration }: ActivityTooltipProps) {
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
        <div className="font-medium mb-1">{activity.title}</div>
        <div className="text-muted-foreground text-xs mb-1 max-w-32 whitespace-normal leading-tight">
          {activity.description}
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span
            className={cn("px-1.5 py-0.5 rounded text-xs", {
              "bg-accent/10 text-accent": activity.status === "completed" || activity.status === "in_progress",
              "bg-destructive/10 text-destructive": activity.status === "failed",
              "bg-muted/20 text-muted-foreground": activity.status === "pending",
            })}
          >
            {activity.status === 'in_progress' ? '●' : activity.status === 'completed' ? '✓' : activity.status === 'failed' ? '✗' : '○'}
          </span>

          {activity.timestamp && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              <span className="text-xs">{formatDuration(activity.timestamp)}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {activity.status === "in_progress" && activity.progress !== undefined && (
          <div className="mt-1 w-full bg-muted/30 rounded-full h-1">
            <div
              className="bg-accent h-1 rounded-full transition-all duration-300"
              style={{ width: `${activity.progress}%` }}
            />
          </div>
        )}

        {/* Tooltip arrow */}
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-card" />
      </div>
    </div>
  )
}
