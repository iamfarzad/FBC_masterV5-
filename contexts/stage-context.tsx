"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface StageItem {
  id: string
  label: string
  done: boolean
  current: boolean
}

export interface StageContextType {
  stages: StageItem[]
  currentStage: StageItem | null
  currentStageIndex: number
  exploration: StageExplorationState
  nextStage: () => void
  previousStage: () => void
  goToStage: (stageId: string) => void
  completeStage: (stageId: string) => void
  resetStages: () => void
  isStageCompleted: (stageId: string) => boolean
  getProgressPercentage: () => number
}

export interface StageExplorationState {
  exploredCount: number
  total: number
}

export interface StageSyncPayload {
  stageId?: string
  exploredCount?: number
  total?: number
  completedStageIds?: string[]
}

const INITIAL_STAGES: StageItem[] = [
  { id: 'GREETING', label: 'Discovery & Setup', done: false, current: true },
  { id: 'NAME_COLLECTION', label: 'Identity Collection', done: false, current: false },
  { id: 'EMAIL_CAPTURE', label: 'Consent & Context', done: false, current: false },
  { id: 'BACKGROUND_RESEARCH', label: 'Research & Analysis', done: false, current: false },
  { id: 'PROBLEM_DISCOVERY', label: 'Requirements Discovery', done: false, current: false },
  { id: 'SOLUTION_PRESENTATION', label: 'Solution Presentation', done: false, current: false },
  { id: 'CALL_TO_ACTION', label: 'Next Steps & Action', done: false, current: false }
]

const StageContext = createContext<StageContextType | undefined>(undefined)
const STAGE_ID_SEQUENCE = INITIAL_STAGES.map(stage => stage.id)
const DEFAULT_CAPABILITY_TOTAL = 16

export function StageProvider({ children }: { children: React.ReactNode }) {
  const [stages, setStages] = useState<StageItem[]>(INITIAL_STAGES)
  const [exploration, setExploration] = useState<StageExplorationState>({ exploredCount: 0, total: DEFAULT_CAPABILITY_TOTAL })

  const currentStageIndex = stages.findIndex(stage => stage.current)
  const currentStage = currentStageIndex >= 0 ? stages[currentStageIndex] : null

  const updateStages = useCallback((updater: (prevStages: StageItem[]) => StageItem[]) => {
    setStages(updater)
  }, [])

  const nextStage = useCallback(() => {
    updateStages(prevStages => {
      const newStages = [...prevStages]
      const currentIndex = newStages.findIndex(stage => stage.current)

      if (currentIndex >= 0 && currentIndex < newStages.length - 1) {
        // Mark current stage as done and move to next
        newStages[currentIndex] = { ...newStages[currentIndex]!, done: true, current: false }
        newStages[currentIndex + 1] = { ...newStages[currentIndex + 1]!, current: true }
      }

      return newStages
    })
  }, [updateStages])

  const previousStage = useCallback(() => {
    updateStages(prevStages => {
      const newStages = [...prevStages]
      const currentIndex = newStages.findIndex(stage => stage.current)

      if (currentIndex > 0) {
        // Move back to previous stage
        newStages[currentIndex] = { ...newStages[currentIndex]!, current: false }
        newStages[currentIndex - 1] = { ...newStages[currentIndex - 1]!, current: true, done: false }
      }

      return newStages
    })
  }, [updateStages])

  const goToStage = useCallback((stageId: string) => {
    updateStages(prevStages => {
      return prevStages.map(stage => ({
        ...stage,
        current: stage.id === stageId,
        done: stage.id === stageId ? false : stage.done
      }))
    })
  }, [updateStages])

  const completeStage = useCallback((stageId: string) => {
    updateStages(prevStages => {
      return prevStages.map(stage =>
        stage.id === stageId
          ? { ...stage, done: true, current: false }
          : stage
      )
    })
  }, [updateStages])

  const resetStages = useCallback(() => {
    setStages(INITIAL_STAGES)
    setExploration({ exploredCount: 0, total: DEFAULT_CAPABILITY_TOTAL })
  }, [])

  const isStageCompleted = useCallback((stageId: string) => {
    return stages.find(stage => stage.id === stageId)?.done || false
  }, [stages])

  const getProgressPercentage = useCallback(() => {
    const completedStages = stages.filter(stage => stage.done).length
    return Math.round((completedStages / stages.length) * 100)
  }, [stages])

  // Auto-advance stages based on conversation flow
  useEffect(() => {
    const handleStageProgression = (event: CustomEvent) => {
      const { stage, action } = event.detail

      switch (action) {
        case 'complete':
          completeStage(stage)
          break
        case 'next':
          nextStage()
          break
        case 'goto':
          goToStage(stage)
          break
      }
    }

    window.addEventListener('stage-progression' as any, handleStageProgression as any)

    return () => {
      window.removeEventListener('stage-progression' as any, handleStageProgression as any)
    }
  }, [completeStage, nextStage, goToStage])

  useEffect(() => {
    const handleIntelligenceSync = (event: CustomEvent<StageSyncPayload>) => {
      const { stageId, exploredCount, total, completedStageIds } = event.detail

      if (typeof exploredCount === 'number' || typeof total === 'number') {
        setExploration(prev => ({
          exploredCount: typeof exploredCount === 'number' ? exploredCount : prev.exploredCount,
          total: typeof total === 'number' ? total : (prev.total || DEFAULT_CAPABILITY_TOTAL)
        }))
      }

      if (!stageId && (!completedStageIds || completedStageIds.length === 0)) {
        return
      }

      updateStages(prevStages => {
        const nextStages = prevStages.map(stage => ({ ...stage }))

        if (completedStageIds && completedStageIds.length) {
          for (const completed of completedStageIds) {
            const idx = nextStages.findIndex(stage => stage.id === completed)
            if (idx >= 0) {
              nextStages[idx] = { ...nextStages[idx]!, done: true, current: false }
            }
          }
        }

        if (stageId) {
          const idx = nextStages.findIndex(stage => stage.id === stageId)
          if (idx >= 0) {
            return nextStages.map((stage, index) => {
              if (index < idx) {
                return { ...stage, done: true, current: false }
              }
              if (index === idx) {
                return { ...stage, done: false, current: true }
              }
              return { ...stage, current: false }
            })
          }
        }

        return nextStages
      })
    }

    window.addEventListener('stage-intelligence-update' as any, handleIntelligenceSync as any)

    return () => {
      window.removeEventListener('stage-intelligence-update' as any, handleIntelligenceSync as any)
    }
  }, [updateStages])

  const value: StageContextType = {
    stages,
    currentStage: currentStage ?? null,
    currentStageIndex,
    exploration,
    nextStage,
    previousStage,
    goToStage,
    completeStage,
    resetStages,
    isStageCompleted,
    getProgressPercentage
  }

  return (
    <StageContext.Provider value={value}>
      {children}
    </StageContext.Provider>
  )
}

export function useStage(): StageContextType {
  const context = useContext(StageContext)
  if (context === undefined) {
    throw new Error('useStage must be used within a StageProvider')
  }
  return context
}

// Utility function to trigger stage progression from anywhere in the app
export function triggerStageProgression(stageId: string, action: 'complete' | 'next' | 'goto') {
  const event = new CustomEvent('stage-progression', {
    detail: { stage: stageId, action }
  })
  window.dispatchEvent(event)
}

export function syncStageFromIntelligence(payload: StageSyncPayload) {
  const event = new CustomEvent('stage-intelligence-update', {
    detail: payload
  })
  window.dispatchEvent(event)
}

export function getStageIdForIndex(index: number): string {
  return STAGE_ID_SEQUENCE[index] || STAGE_ID_SEQUENCE[0]!
}

export function getStageIdForNumber(stageNumber: number): string {
  return getStageIdForIndex(Math.max(0, Math.min(STAGE_ID_SEQUENCE.length - 1, stageNumber - 1)))
}

export function getStageNumberForId(stageId: string): number {
  const idx = STAGE_ID_SEQUENCE.indexOf(stageId)
  return idx >= 0 ? idx + 1 : 1
}
