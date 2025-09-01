"use client"

import React from 'react'
import { cn } from '@/src/core/utils'
import { Activity } from 'lucide-react'
import { ACTIVITY_ICONS, STATUS_STYLES, type ActivityItem } from './ActivityConstants'

interface ProcessNodeProps {
  activity: ActivityItem
  index: number
  isLatest: boolean
  variant: 'chain' | 'fixed-chain'
  theme: 'default' | 'minimal' | 'detailed'
  onHover: (activity: ActivityItem, event?: React.MouseEvent) => void
  onLeave: () => void
}

export function ProcessNode({
  activity,
  index,
  isLatest,
  variant,
  theme,
  onHover,
  onLeave
}: ProcessNodeProps) {
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
