"use client"

import { cn } from "@/src/core/utils"
import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  AlertCircle,
  Bot,
  Brain,
  Calculator,
  Camera,
  CheckCircle,
  Clock,
  Database,
  Eye,
  FileText,
  GraduationCap,
  ImageIcon,
  Link,
  Mail,
  MessageSquare,
  Mic,
  Monitor,
  Search,
  Upload,
  Zap
} from "lucide-react"
import type React from "react"
import { useState, useMemo } from "react"

// Unified activity item interface
export interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  timestamp?: Date | string
  progress?: number
}

// Stage interface for monitor variant
export interface ActivityStage {
  id: string
  label: string
  done?: boolean
  current?: boolean
}

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

// Icon mapping - consolidated from all components
const ACTIVITY_ICONS: Partial<Record<string, React.ElementType>> = {
  user_action: MessageSquare,
  ai_thinking: Brain,
  ai_stream: Bot,
  ai_request: Bot,
  google_search: Search,
  search: Search,
  doc_analysis: FileText,
  file_upload: Upload,
  image_upload: ImageIcon,
  voice_input: Mic,
  voice_response: Mic,
  screen_share: Monitor,
  webcam_capture: Camera,
  roi_calculation: Calculator,
  workshop_access: GraduationCap,
  email_sent: Mail,
  error: AlertCircle,
  web_scrape: Link,
  link: Link,
  vision_analysis: Eye,
  database: Database,
  complete: CheckCircle,
  analyze: Brain,
  generate: Brain,
  processing: Brain,
  tool_used: Zap,
}

// Status styling configurations
const STATUS_STYLES = {
  default: {
    in_progress: "w-3 h-3 bg-gradient-to-br from-accent to-accent/80 border border-accent/50 shadow-sm animate-pulse",
    completed: "w-2.5 h-2.5 bg-accent border border-accent/50 shadow-sm",
    failed: "w-2.5 h-2.5 bg-destructive border border-destructive/50 shadow-sm opacity-80",
    pending: "w-2 h-2 bg-muted-foreground/30 border border-muted-foreground/20 opacity-60",
  },
  minimal: {
    in_progress: "w-6 h-6 bg-surface border-2 border-muted-foreground/60 shadow-lg animate-pulse",
    completed: "w-4 h-4 bg-muted-foreground/40 border border-muted-foreground/30",
    failed: "w-4 h-4 bg-muted-foreground/30 border border-muted-foreground/20 opacity-40",
    pending: "w-3 h-3 bg-muted-foreground/30 border border-muted-foreground/20 opacity-40",
  },
  detailed: {
    in_progress: "w-4 h-4 bg-gradient-to-br from-accent to-accent/80 border border-accent/50 shadow-sm animate-pulse",
    completed: "w-3 h-3 bg-accent border border-accent/50 shadow-sm",
    failed: "w-3 h-3 bg-destructive border border-destructive/50 shadow-sm opacity-80",
    pending: "w-2.5 h-2.5 bg-muted-foreground/30 border border-muted-foreground/20 opacity-60",
  }
}

// Chip-specific status colors
const CHIP_STATUS_COLORS = {
  in: {
    bg: "bg-[hsl(var(--chart-success))]/10",
    text: "text-[hsl(var(--chart-success))]",
    border: "border-[hsl(var(--chart-success))]/20"
  },
  out: {
    bg: "bg-[hsl(var(--destructive))]/10",
    text: "text-[hsl(var(--destructive))]",
    border: "border-[hsl(var(--destructive))]/20"
  }
}

// Process Node Component (for chain variants)
interface ProcessNodeProps {
  activity: ActivityItem
  index: number
  isLatest: boolean
  variant: 'chain' | 'fixed-chain'
  theme: 'default' | 'minimal' | 'detailed'
  onHover: (activity: ActivityItem, event?: React.MouseEvent) => void
  onLeave: () => void
}

const ProcessNode = ({ activity, index, isLatest, variant, theme, onHover, onLeave }: ProcessNodeProps) => {
  const getNodeStyle = (status: ActivityItem["status"]) => {
    const baseClasses = "relative flex items-center justify-center rounded-full border transition-all duration-300 ease-out cursor-pointer"
    return cn(baseClasses, STATUS_STYLES[theme][status])
  }

  const getIcon = (type: string) => {
    const IconComponent = ACTIVITY_ICONS[type] || Activity
    const iconSize = activity.status === "in_progress" ? "w-3 h-3" : "w-2 h-2"
    const iconColor = activity.status === "in_progress" ? "text-foreground" : "text-muted-foreground"
    return <IconComponent className={cn(iconSize, iconColor)} />
  }

  const getConnectorStyle = (status: ActivityItem["status"]) => {
    switch (status) {
      case 'completed':
        return 'bg-accent/40'
      case 'in_progress':
        return 'bg-accent/40 animate-pulse'
      case 'failed':
        return 'bg-destructive/40'
      default:
        return 'bg-muted-foreground/20'
    }
  }

  return (
    <div
      className="relative flex flex-col items-center group mb-2"
      onMouseEnter={(e) => onHover(activity, e)}
      onMouseLeave={onLeave}
      role="button"
      tabIndex={0}
      aria-label={`Activity: ${activity.title} - ${activity.status}`}
    >
      {/* Connection line to next node */}
      {!isLatest && (
        <div className="absolute top-full left-1/2 w-px h-2 -translate-x-px">
          <div className={cn("w-full h-full transition-all duration-300", getConnectorStyle(activity.status))} />
        </div>
      )}

      {/* Node */}
      <div className={getNodeStyle(activity.status)}>
        {activity.status !== "pending" && activity.status === "in_progress" && getIcon(activity.type)}
        {/* Active pulse ring */}
        {activity.status === "in_progress" && (
          <div className="absolute inset-0 rounded-full border border-accent/30 animate-ping" />
        )}
      </div>
    </div>
  )
}

// Activity Chip Component (for chip variant)
interface ActivityChipProps {
  direction: "in" | "out"
  label: string
  className?: string
}

const ActivityChip = ({ direction, label, className }: ActivityChipProps) => {
  const colors = CHIP_STATUS_COLORS[direction]
  const prefix = direction === "in" ? "IN" : "OUT"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border",
        "whitespace-nowrap select-none",
        colors.bg, colors.text, colors.border,
        className
      )}
    >
      <span className="font-semibold opacity-80">{prefix}</span>
      <span className="opacity-90">{label}</span>
    </span>
  )
}

// Stage indicator component (for monitor variant)
interface StageIndicatorProps {
  stages: ActivityStage[]
  currentStage?: string
  stageProgress?: number
}

const StageIndicator = ({ stages, currentStage, stageProgress }: StageIndicatorProps) => {
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

// Main unified component
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

  // Format duration helper
  const formatDuration = (timestamp?: Date | string) => {
    if (!timestamp) return ''

    try {
      const dateObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
      if (isNaN(dateObj.getTime())) return ''

      const now = new Date()
      const diff = now.getTime() - dateObj.getTime()
      const seconds = Math.floor(diff / 1000)

      if (seconds < 60) return `${seconds}s ago`
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
      return `${Math.floor(seconds / 3600)}h ago`
    } catch (error) {
      console.warn('Invalid timestamp format:', timestamp)
      return ''
    }
  }

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
        <div
          className="fixed z-50 pointer-events-none transition-all duration-200"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-100%, -50%)'
          }}
        >
          <div className="bg-card text-card-foreground px-3 py-2 rounded-lg shadow-xl border border-border text-xs whitespace-nowrap">
            <div className="font-medium mb-1">{hoveredActivity.title}</div>
            <div className="text-muted-foreground text-xs mb-1 max-w-32 whitespace-normal leading-tight">
              {hoveredActivity.description}
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span
                className={cn("px-1.5 py-0.5 rounded text-xs", {
                  "bg-accent/10 text-accent": hoveredActivity.status === "completed" || hoveredActivity.status === "in_progress",
                  "bg-destructive/10 text-destructive": hoveredActivity.status === "failed",
                  "bg-muted/20 text-muted-foreground": hoveredActivity.status === "pending",
                })}
              >
                {hoveredActivity.status === 'in_progress' ? '●' : hoveredActivity.status === 'completed' ? '✓' : hoveredActivity.status === 'failed' ? '✗' : '○'}
              </span>

              {hoveredActivity.timestamp && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  <span className="text-xs">{formatDuration(hoveredActivity.timestamp)}</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {hoveredActivity.status === "in_progress" && hoveredActivity.progress !== undefined && (
              <div className="mt-1 w-full bg-muted/30 rounded-full h-1">
                <div
                  className="bg-accent h-1 rounded-full transition-all duration-300"
                  style={{ width: `${hoveredActivity.progress}%` }}
                />
              </div>
            )}

            {/* Tooltip arrow */}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-card" />
          </div>
        </div>
      )}

      {/* Stage tooltip */}
      {showStageTooltip && hoveredStage && (
        <div
          className="fixed z-50 pointer-events-none transition-all duration-200"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-100%, -50%)'
          }}
        >
          <div className="bg-card text-card-foreground px-3 py-2 rounded-lg shadow-xl border border-border text-xs whitespace-nowrap">
            <div className="font-medium mb-1">{hoveredStage.label}</div>
            <div className="text-muted-foreground text-xs mb-1">
              {hoveredStage.current ? 'Current Stage' : hoveredStage.done ? 'Completed' : 'Pending'}
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span
                className={cn("px-1.5 py-0.5 rounded text-xs", {
                  "bg-accent/10 text-accent": hoveredStage.done || hoveredStage.current,
                  "bg-muted/20 text-muted-foreground": !hoveredStage.done && !hoveredStage.current,
                })}
              >
                {hoveredStage.current ? '●' : hoveredStage.done ? '✓' : '○'}
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
      )}
    </div>
  )
}

// Export types for external use
export type { ActivityItem, ActivityStage, ActivityDisplayProps }
