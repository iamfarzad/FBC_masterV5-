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

// Types for the new minimal design
interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  timestamp?: Date | string
  progress?: number
}

interface VerticalProcessChainProps {
  activities: ActivityItem[]
  onActivityClick?: (activity: ActivityItem) => void
  className?: string
  // 7-Stage conversation flow
  stages?: Array<{ id: string; label: string; done?: boolean; current?: boolean }>
  currentStage?: string
  stageProgress?: number
}

interface ProcessNodeProps {
  activity: ActivityItem
  index: number
  isLatest: boolean
  onHover: (activity: ActivityItem, event: React.MouseEvent) => void
  onLeave: () => void
}

const ProcessNode = ({ activity, index, isLatest, onHover, onLeave }: ProcessNodeProps) => {
  const getNodeStyle = (status: ActivityItem["status"]) => {
    const baseClasses = "relative flex items-center justify-center rounded-full border transition-all duration-300 ease-out cursor-pointer"

    const statusStyles = {
      in_progress: "w-3 h-3 bg-gradient-to-br from-accent to-accent/80 border border-accent/50 shadow-sm animate-pulse",
      completed: "w-2.5 h-2.5 bg-accent border border-accent/50 shadow-sm",
      failed: "w-2.5 h-2.5 bg-destructive border border-destructive/50 shadow-sm opacity-80",
      pending: "w-2 h-2 bg-muted-foreground/30 border border-muted-foreground/20 opacity-60",
    }

    return cn(baseClasses, statusStyles[status] || statusStyles.pending)
  }

  const getIcon = (type: ActivityItem["type"]) => {
    const iconMap: Partial<Record<ActivityItem["type"], React.ElementType>> = {
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

    const IconComponent = iconMap[type] || Activity
    return <IconComponent className="size-1.5 text-accent-foreground" />
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
      className="group relative mb-2 flex flex-col items-center"
      onMouseEnter={(e) => onHover(activity, e)}
      onMouseLeave={onLeave}
      role="button"
      tabIndex={0}
      aria-label={`Activity: ${activity.title} - ${activity.status}`}
    >
      {/* Connection line to next node */}
      {!isLatest && (
        <div className="absolute left-1/2 top-full h-2 w-px -translate-x-px">
          <div className={cn("w-full h-full transition-all duration-300", getConnectorStyle(activity.status))} />
        </div>
      )}

      {/* Node */}
      <div className={getNodeStyle(activity.status)}>
        {activity.status !== "pending" && activity.status === "in_progress" && getIcon(activity.type)}

        {/* Active pulse ring */}
        {activity.status === "in_progress" && (
          <div className="border-accent/30 absolute inset-0 animate-ping rounded-full border" />
        )}
      </div>
    </div>
  )
}

export function AiActivityMonitor({ 
  activities, 
  onActivityClick, 
  className,
  stages,
  currentStage,
  stageProgress
}: VerticalProcessChainProps) {
  const [hoveredActivity, setHoveredActivity] = useState<ActivityItem | null>(null)
  const [hoveredStage, setHoveredStage] = useState<{ id: string; label: string; done?: boolean; current?: boolean } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const [showStageTooltip, setShowStageTooltip] = useState(false)

  // Get the last 8 activities for the chain
  const chainActivities = useMemo(() => {
    return activities.slice(-8)
  }, [activities])

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

  if (chainActivities.length === 0 && !stages) {
    return null
  }

  return (
    <>
      {/* 7-Stage Conversation Flow */}
      {stages && stages.length > 0 && (
        <div className="mb-6 opacity-20 transition-all duration-300 hover:opacity-100">
          <div className="flex flex-col items-center space-y-2">
            <div className="mb-2 text-xs font-medium text-muted-foreground">7-Stage Flow</div>
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className="group relative flex flex-col items-center"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setTooltipPosition({
                    x: rect.left - 20,
                    y: rect.top + rect.height / 2
                  })
                  setHoveredStage(stage)
                  setShowStageTooltip(true)
                }}
                onMouseLeave={() => {
                  setShowStageTooltip(false)
                  setTimeout(() => setHoveredStage(null), 200)
                }}
                role="button"
                tabIndex={0}
                aria-label={`Stage: ${stage.label} - ${stage.current ? 'Current' : stage.done ? 'Completed' : 'Pending'}`}
              >
                {/* Connection line to next stage */}
                {index < stages.length - 1 && (
                  <div className="absolute left-1/2 top-full h-3 w-px -translate-x-px">
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
                    <div className="border-accent/30 absolute inset-0 animate-ping rounded-full border" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Minimal floating activity chain */}
      {chainActivities.length > 0 && (
        <div
          className={cn(
            "group/chain opacity-20 hover:opacity-100 transition-all duration-300",
            className
          )}
          role="region"
          aria-label="Activity Monitor"
        >
          {/* Background blur effect on hover */}
          <div className="bg-background/10 absolute -inset-2 rounded-full opacity-0 backdrop-blur-sm transition-all duration-300 group-hover/chain:opacity-100" />

          {/* Chain nodes */}
          <div className="relative flex flex-col items-center px-1 py-2">
            {chainActivities.map((activity, index) => (
              <ProcessNode
                key={activity.id}
                activity={activity}
                index={index}
                isLatest={index === chainActivities.length - 1}
                onHover={(activity, event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  setTooltipPosition({
                    x: rect.left - 20,
                    y: rect.top + rect.height / 2
                  })
                  setHoveredActivity(activity)
                  setShowTooltip(true)
                }}
                onLeave={() => {
                  setShowTooltip(false)
                  setTimeout(() => setHoveredActivity(null), 200)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Minimal floating tooltip */}
      {showTooltip && hoveredActivity && (
        <div
          className="pointer-events-none fixed z-50 transition-all duration-200"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-100%, -50%)'
          }}
        >
          <div className="whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 text-xs text-card-foreground shadow-xl">
            <div className="mb-1 font-medium">{hoveredActivity.title}</div>
            <div className="mb-1 max-w-32 whitespace-normal text-xs leading-tight text-muted-foreground">
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
                  <Clock className="size-2.5" />
                  <span className="text-xs">{formatDuration(hoveredActivity.timestamp)}</span>
                </div>
              )}
            </div>

            {/* Progress bar for in-progress items */}
            {hoveredActivity.status === "in_progress" && hoveredActivity.progress !== undefined && (
              <div className="bg-muted/30 mt-1 h-1 w-full rounded-full">
                <div
                  className="h-1 rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${hoveredActivity.progress}%` }}
                />
              </div>
            )}

            {/* Tooltip arrow */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 transform border-4 border-transparent border-l-card" />
          </div>
        </div>
      )}

      {/* Stage tooltip */}
      {showStageTooltip && hoveredStage && (
        <div
          className="pointer-events-none fixed z-50 transition-all duration-200"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-100%, -50%)'
          }}
        >
          <div className="whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 text-xs text-card-foreground shadow-xl">
            <div className="mb-1 font-medium">{hoveredStage.label}</div>
            <div className="mb-1 text-xs text-muted-foreground">
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
            <div className="absolute left-full top-1/2 -translate-y-1/2 transform border-4 border-transparent border-l-card" />
          </div>
        </div>
      )}
    </>
  )
}
