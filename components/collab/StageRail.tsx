"use client"

import React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, TrendingUp } from "lucide-react"
import { cn } from "@/src/core/utils"
import { useStage, getStageIdForNumber } from "@/contexts/stage-context"

// Import proper stage instructions from src/core
import { StageInstructions } from '@/src/core/conversation/stages'

// 🔧 MASTER FLOW: Intelligence-aware stage descriptions
const STAGE_DESCRIPTIONS = {
  1: "Initial Contact",
  2: "Identity Collection", 
  3: "Consent & Research",
  4: "Background Analysis",
  5: "Requirements Discovery",
  6: "Solution Presentation",
  7: "Next Steps & Action"
}

interface StageRailProps {
  side?: 'left' | 'right'
  show?: boolean
}

export function StageRail({ side = 'right', show = true }: StageRailProps) {
  const { currentStageIndex, getProgressPercentage, exploration } = useStage()
  if (!show) return null
  const currentStage = currentStageIndex + 1
  const stagePercent = getProgressPercentage()
  const progressPercentage = stagePercent > 0
    ? stagePercent
    : exploration.total > 0
      ? Math.round((exploration.exploredCount / exploration.total) * 100)
      : 0

  // Desktop: Fixed centered on right side
  // Mobile: Dropdown trigger button
  return (
    <>
      {/* Desktop: Fixed centered layout */}
      <aside
        className={cn(
          'fixed top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex',
          side === 'left' ? 'left-4' : 'right-4'
        )}
        role="complementary"
        aria-label="Session progress and stage information"
      >
        <div className="text-xs font-medium tracking-wide text-muted-foreground" aria-live="polite" data-testid="stage-indicator">
          Stage {currentStage} of 7
        </div>
        <ol className={cn("flex flex-col gap-2")} role="list">
          {Array.from({ length: 7 }).map((_, i) => {
            const stageNumber = i + 1
            const stageId = getStageIdForNumber(stageNumber)
            const isCurrent = stageNumber === currentStage
            const isCompleted = stageNumber < currentStage
            const isUpcoming = stageNumber > currentStage
            return (
              <li key={stageNumber}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="group relative">
                        <button
                          className={cn(
                            "w-10 h-10 rounded-full grid place-items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            isCurrent
                              ? "bg-primary text-primary-foreground shadow-lg scale-110"
                              : isCompleted
                              ? "bg-primary/80 text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                          aria-label={`Stage ${stageNumber}: ${STAGE_DESCRIPTIONS[stageNumber as keyof typeof STAGE_DESCRIPTIONS]}${isCurrent ? ' (current)' : ''}`}
                          aria-current={isCurrent ? 'step' : undefined}
                          disabled={isUpcoming}
                        >
                          {isCompleted ? (
                            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-sm font-medium">{stageNumber}</span>
                          )}
                        </button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">Stage {stageNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {STAGE_DESCRIPTIONS[stageNumber as keyof typeof STAGE_DESCRIPTIONS]}
                        </p>
                        {/* Show stage instruction for context */}
                        <p className="text-xs text-muted-foreground/70 mt-1 italic">
                          {StageInstructions[stageId as keyof typeof StageInstructions]}
                        </p>
                        {isCurrent && (
                          <p className="text-xs font-medium text-primary">Current stage</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
            )
          })}
        </ol>
        <div className="space-y-1 text-center text-xs text-muted-foreground">
          <div className="text-[10px] opacity-70">Exploration</div>
          <div className="flex items-center justify-center gap-1">
            <span>{exploration.exploredCount}</span>
            <span>of</span>
            <span>{exploration.total}</span>
          </div>
          <div className="h-1 w-12 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercentage} aria-label="Exploration progress">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
      </aside>

      {/* Mobile: Dropdown trigger */}
      <div
        className={cn(
          'fixed bottom-4 z-20 md:hidden',
          side === 'left' ? 'left-4' : 'right-4'
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-background/80 border-border/50 shadow-lg backdrop-blur-sm"
              aria-label="View session stages"
            >
              <TrendingUp className="mr-1 size-4" />
              Stage {currentStage}/7
              <ChevronDown className="ml-1 size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-96 w-64 overflow-y-auto">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Session Progress
            </div>
            <DropdownMenuSeparator />
            <ol className="space-y-1" role="list">
              {Array.from({ length: 7 }).map((_, i) => {
                const stageNumber = i + 1
                const isCurrent = stageNumber === currentStage
                const isCompleted = stageNumber < currentStage
                const isUpcoming = stageNumber > currentStage
                return (
                  <li key={stageNumber}>
                    <DropdownMenuItem
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        isCurrent && "bg-accent/10 text-accent-foreground",
                        isUpcoming && "opacity-50"
                      )}
                      disabled={isUpcoming}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full grid place-items-center text-xs",
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                          ? "bg-primary/80 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {isCompleted ? (
                          <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          stageNumber
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={cn(
                          "text-sm font-medium",
                          isCurrent && "text-primary"
                        )}>
                          Stage {stageNumber}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {STAGE_DESCRIPTIONS[stageNumber as keyof typeof STAGE_DESCRIPTIONS]}
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="size-2 rounded-full bg-primary" />
                      )}
                    </DropdownMenuItem>
                  </li>
                )
              })}
            </ol>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              <div className="text-xs text-muted-foreground">
                Exploration Progress
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{exploration.exploredCount} of {exploration.total}</span>
                <span className="text-xs text-muted-foreground">{progressPercentage}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

export function StageRailCard() {
  const { currentStageIndex, stages, getProgressPercentage } = useStage()
  const currentStage = stages[currentStageIndex] ?? null
  const percentage = getProgressPercentage()
  const stageNumber = currentStageIndex + 1
  const stageInstruction = StageInstructions[getStageIdForNumber(stageNumber) as keyof typeof StageInstructions]

  return (
    <div className="rounded-2xl border border-border bg-surface/80 p-4 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-text">Discovery Progress</span>
        <span className="text-[11px] text-text-muted">Stage {stageNumber}/{stages.length}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-text">
        {currentStage?.label ?? 'Discovery Stage'}
      </p>
      <p className="mt-1 text-xs text-text-muted">
        {stageInstruction ?? 'Guided exploration'}
      </p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
