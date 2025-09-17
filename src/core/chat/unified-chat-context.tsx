"use client"

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

import type { UnifiedMessage, UnifiedContext } from './unified-types'

type AddMessageFn = (message: Omit<UnifiedMessage, 'id'> & { id?: string }) => UnifiedMessage

type UnifiedChatActionsContextValue = {
  addMessage: AddMessageFn
  sendMessage: (content: string) => Promise<void>
  updateContext: (context: Partial<UnifiedContext>) => void
}

const UnifiedChatActionsContext = createContext<UnifiedChatActionsContextValue | null>(null)

export interface UnifiedChatActionsProviderProps {
  value: UnifiedChatActionsContextValue
  children: ReactNode
}

export function UnifiedChatActionsProvider({ value, children }: UnifiedChatActionsProviderProps) {
  return (
    <UnifiedChatActionsContext.Provider value={value}>
      {children}
    </UnifiedChatActionsContext.Provider>
  )
}

export function useUnifiedChatActionsContext() {
  return useContext(UnifiedChatActionsContext)
}

