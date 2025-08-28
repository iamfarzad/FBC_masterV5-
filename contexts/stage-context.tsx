"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface StageItem {
  id: string
  label: string
  done?: boolean
  current?: boolean
}

export interface StageContextType {
  stages: StageItem[]
  currentStage: StageItem | null
  currentStageIndex: number
  nextStage: () => void
  previousStage: () => void
  goToStage: (stageId: string) => void
  completeStage: (stageId: string) => void
  resetStages: () => void
  isStageCompleted: (stageId: string) => boolean
  getProgressPercentage: () => number
}

const INITIAL_STAGES: StageItem[] = [
  { id: 'GREETING', label: 'Discovery & Setup', done: false, current: true },
  { id: 'NAME_COLLECTION', label: 'Identity', done: false, current: false },
  { id: 'EMAIL_CAPTURE', label: 'Consent & Context', done: false, current: false },
  { id: 'BACKGROUND_RESEARCH', label: 'Research', done: false, current: false },
  { id: 'PROBLEM_DISCOVERY', label: 'Requirements', done: false, current: false },
  { id: 'SOLUTION_PRESENTATION', label: 'Solution', done: false, current: false },
  { id: 'CALL_TO_ACTION', label: 'Next Step', done: false, current: false }
]

const StageContext = createContext<StageContextType | undefined>(undefined)

export function StageProvider({ children }: { children: React.ReactNode }) {
  const [stages, setStages] = useState<StageItem[]>(INITIAL_STAGES)

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
        newStages[currentIndex] = { ...newStages[currentIndex], done: true, current: false }
        newStages[currentIndex + 1] = { ...newStages[currentIndex + 1], current: true }
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
        newStages[currentIndex] = { ...newStages[currentIndex], current: false }
        newStages[currentIndex - 1] = { ...newStages[currentIndex - 1], current: true, done: false }
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

  const value: StageContextType = {
    stages,
    currentStage,
    currentStageIndex,
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
