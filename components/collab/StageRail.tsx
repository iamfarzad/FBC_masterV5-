"use client"

import React, { useEffect, useState, useMemo } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, TrendingUp } from "lucide-react"
import { cn } from "@/src/core/utils"
import { useStage } from "@/contexts/stage-context"

type Context = { stage?: number; exploredCount?: number; total?: number }

// Import proper stage instructions from src/core
import { StageInstructions } from '@/src/core/conversation/stages'

const STAGE_DESCRIPTIONS = {
  1: "Discovery & Setup",
  2: "Identity Collection", 
  3: "Consent & Context",
  4: "Research & Analysis",
  5: "Requirements Discovery",
  6: "Solution Presentation",
  7: "Next Steps & Action"
}

export function StageRail({ sessionId }: { sessionId?: string }) {
  // Use the StageProvider context for proper stage management
  const { currentStageIndex, stages, getProgressPercentage } = useStage()
  const [ctx, setCtx] = useState<Context>({ stage: 1, exploredCount: 0, total: 16 })
  const [isLoading, setIsLoading] = useState(false)

  // Memoized context fetching to prevent unnecessary re-renders
  const fetchContext = useMemo(() => async () => {
    const id = sessionId || (typeof window !== 'undefined' ? (localStorage.getItem('intelligence-session-id') || undefined) : undefined)
    if (!id) return
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/intelligence/context?sessionId=${id}`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (!res.ok) return
      const j = await res.json()
      const out = j?.output || j
      const stage = Number(out?.stage || 1)
      const explored = Number(out?.exploredCount || out?.capabilities?.length || 0)
      setCtx({ stage, exploredCount: explored, total: 16 })
    } catch (error) {
      // Warning log removed - could add proper error handling here
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchContext()
  }, [fetchContext])

  // Listen to capability-used events to refresh quickly without polling
  useEffect(() => {
    const onUsed = () => {
      fetchContext()
    }
    
    try { 
      window.addEventListener('chat-capability-used', onUsed as EventListener) 
    } catch (error) {
      // Warning log removed - could add proper error handling here
    }
    
    return () => { 
      try { 
        window.removeEventListener('chat-capability-used', onUsed as EventListener) 
      } catch (error) {
        // Warning log removed - could add proper error handling here
      }
    }
  }, [fetchContext])

  // Use stage context for current stage, fallback to API context
  const currentStage = currentStageIndex + 1 || ctx.stage || 1
  const progressPercentage = getProgressPercentage() || Math.round(((ctx.exploredCount || 0) / (ctx.total || 16)) * 100)

  // Desktop: Fixed centered on right side
  // Mobile: Dropdown trigger button
  return (
    <>
      {/* Desktop: Fixed centered layout */}
      <aside
        className="fixed right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex"
        role="complementary"
        aria-label="Session progress and stage information"
      >
        <div className="text-xs font-medium tracking-wide text-muted-foreground" aria-live="polite" data-testid="stage-indicator">
          Stage {currentStage} of 7
        </div>
        <ol className={cn("flex flex-col gap-2")} role="list">
          {Array.from({ length: 7 }).map((_, i) => {
            const stageNumber = i + 1
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
                          {Object.values(StageInstructions)[stageNumber - 1]}
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
            <span>{ctx.exploredCount}</span>
            <span>of</span>
            <span>{ctx.total}</span>
          </div>
          <div className="h-1 w-12 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercentage} aria-label="Exploration progress">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
        {isLoading && (
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Loading progress" />
        )}
      </aside>

      {/* Mobile: Dropdown trigger */}
      <div className="fixed bottom-4 right-4 z-20 md:hidden">
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
                <span>{ctx.exploredCount} of {ctx.total}</span>
                <span className="text-xs text-muted-foreground">{progressPercentage}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            {isLoading && (
              <div className="flex justify-center py-2">
                <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}




