"use client"

import { useState, useMemo } from "react"
import { cn } from "@/src/core/utils"
import { Activity, Clock } from "lucide-react"
import {
  type ActivityItem,
  type ActivityStage,
  STATUS_STYLES
} from './ActivityConstants'
import { ProcessNode } from './ProcessNode'
import { ActivityChip } from './ActivityChip'
import { StageIndicator } from './StageIndicator'
import { ActivityTooltip, StageTooltip, formatDuration } from './ActivityDisplayComponents'

// Main component props
export interface ActivityDisplayProps {
  activities: ActivityItem[]
  onActivityClick?: (activity: ActivityItem) => void
  className?: string

  // Variant control
  variant?: 'chip' | 'monitor' | 'chain' | 'fixed-chain'

  // Positioning for chain variants
  position?: 'fixed' | 'relative' | 'absolute'

  // Stage management (for monitor variant)
  stages?: ActivityStage[]
  currentStage?: string
  stageProgress?: number

  // Display options
  showEmptyState?: boolean
  maxItems?: number

  // Styling customization
  size?: 'sm' | 'md' | 'lg'
  theme?: 'default' | 'minimal' | 'detailed'
}

export function ActivityDisplay({
  activities,
  onActivityClick,
  className,
  variant = 'chain',
  position = 'relative',
  stages,
  currentStage,
  stageProgress,
  showEmptyState = true,
  maxItems = 8,
  size = 'md',
  theme = 'default'
}: ActivityDisplayProps) {

  const [hoveredActivity, setHoveredActivity] = useState<ActivityItem | null>(null)
  const [hoveredStage, setHoveredStage] = useState<ActivityStage | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const [showStageTooltip, setShowStageTooltip] = useState(false)

  // Get filtered activities based on maxItems
  const displayActivities = useMemo(() => {
    return activities.slice(-maxItems)
  }, [activities, maxItems])

  // formatDuration utility moved to ./ActivityDisplay/utils.ts

  // Handle hover events
  const handleActivityHover = (activity: ActivityItem, event?: React.MouseEvent) => {
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect()
      setTooltipPosition({
        x: rect.left - 20,
        y: rect.top + rect.height / 2
      })
    }
    setHoveredActivity(activity)
    setShowTooltip(true)
  }

  const handleActivityLeave = () => {
    setShowTooltip(false)
    setTimeout(() => setHoveredActivity(null), 200)
  }

  const handleStageHover = (stage: ActivityStage, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left - 20,
      y: rect.top + rect.height / 2
    })
    setHoveredStage(stage)
    setShowStageTooltip(true)
  }

  const handleStageLeave = () => {
    setShowStageTooltip(false)
    setTimeout(() => setHoveredStage(null), 200)
  }

  // Empty state check
  if (displayActivities.length === 0 && !stages && showEmptyState) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-muted-foreground", className)}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-sm">No activities yet</p>
        <p className="text-xs mt-1">AI actions will appear here in real-time</p>
      </div>
    )
  }

  // Chip variant - render individual chips
  if (variant === 'chip') {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {displayActivities.map((activity) => (
          <ActivityChip
            key={activity.id}
            direction={activity.type.includes('user') ? 'out' : 'in'}
            label={activity.title}
          />
        ))}
      </div>
    )
  }

  // Monitor variant - complex monitoring with stages
  if (variant === 'monitor') {
    return (
      <>
        {/* Stage indicator */}
        {stages && stages.length > 0 && (
          <StageIndicator
            stages={stages}
            currentStage={currentStage}
            stageProgress={stageProgress}
          />
        )}

        {/* Activity chain */}
        <div className={cn("relative", className)}>
          <div className="relative flex flex-col items-center py-2">
            {displayActivities.map((activity, index) => (
              <ProcessNode
                key={activity.id}
                activity={activity}
                index={index}
                isLatest={index === displayActivities.length - 1}
                variant="chain"
                theme={theme}
                onHover={handleActivityHover}
                onLeave={handleActivityLeave}
              />
            ))}
          </div>
        </div>
      </>
    )
  }

  // Chain variants (chain and fixed-chain)
  const isFixed = variant === 'fixed-chain'
  const positionClasses = isFixed
    ? "fixed left-4 top-1/2 transform -translate-y-1/2 z-40"
    : position === 'fixed' ? "fixed left-4 top-1/2 transform -translate-y-1/2 z-40" :
      position === 'absolute' ? "absolute left-4 top-1/2 transform -translate-y-1/2" :
      "relative"

  return (
    <div className={cn(positionClasses, className)}>
      {/* Background indicator for active processes */}
      {displayActivities.some((a) => a.status === "in_progress") && (
        <div className="absolute -inset-2 bg-muted/5 rounded-full animate-pulse" />
      )}

      {/* Main chain container */}
      <div className="relative">
        <div className="relative flex flex-col items-center py-4">
          {displayActivities.map((activity, index) => (
            <ProcessNode
              key={activity.id}
              activity={activity}
              index={index}
              isLatest={index === displayActivities.length - 1}
              variant={variant as 'chain' | 'fixed-chain'}
              theme={theme}
              onHover={handleActivityHover}
              onLeave={handleActivityLeave}
            />
          ))}
        </div>
      </div>

      {/* Activity tooltip */}
      {showTooltip && hoveredActivity && (
        <ActivityTooltip
          activity={hoveredActivity}
          position={tooltipPosition}
          formatDuration={formatDuration}
        />
      )}

      {/* Stage tooltip */}
      {showStageTooltip && hoveredStage && (
        <StageTooltip
          stage={hoveredStage}
          position={tooltipPosition}
          stageProgress={stageProgress}
        />
      )}
    </div>
  )
}

// Export types for external use
export type { ActivityItem, ActivityStage, ActivityDisplayProps }
