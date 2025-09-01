"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { cn } from '@/src/core/utils'
import { ProgressStep, STATUS_ICONS } from './VideoToAppConstants'

interface ProgressTrackerProps {
  progressSteps: ProgressStep[]
}

export function ProgressTracker({ progressSteps }: ProgressTrackerProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Generation Progress
      </h3>
      <div className="space-y-3">
        {progressSteps.map((step, index) => (
          <motion.div
            key={step.id}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              step.status === 'completed' ? 'bg-success text-surface' :
              step.status === 'active' ? 'bg-brand text-surface animate-pulse' :
              step.status === 'error' ? 'bg-destructive text-surface' :
              'bg-surface-elevated text-muted-foreground'
            )}>
              {step.status === 'completed' ? (
                STATUS_ICONS.completed
              ) : step.status === 'active' ? (
                STATUS_ICONS.active
              ) : step.status === 'error' ? (
                STATUS_ICONS.error
              ) : (
                step.icon
              )}
            </div>
            <div className="flex-1">
              <div className={cn(
                "font-medium text-sm",
                step.status === 'completed' ? 'text-success' :
                step.status === 'active' ? 'text-brand' :
                step.status === 'error' ? 'text-destructive' :
                'text-muted-foreground'
              )}>
                {step.label}
              </div>
              <div className="text-xs text-muted-foreground">{step.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
