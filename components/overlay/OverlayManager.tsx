'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface OverlayManagerContextType {
  activeOverlay: string | null
  open: (overlayId: string) => void
  close: () => void
  isOpen: (overlayId: string) => boolean
}

const OverlayManagerContext = createContext<OverlayManagerContextType | null>(null)

export function OverlayManagerProvider({ children }: { children: React.ReactNode }) {
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null)

  const open = useCallback((overlayId: string) => {
    setActiveOverlay(overlayId)
  }, [])

  const close = useCallback(() => {
    setActiveOverlay(null)
  }, [])

  const isOpen = useCallback((overlayId: string) => {
    return activeOverlay === overlayId
  }, [activeOverlay])

  return (
    <OverlayManagerContext.Provider value={{ activeOverlay, open, close, isOpen }}>
      {children}
    </OverlayManagerContext.Provider>
  )
}

export function useOverlayManager() {
  const context = useContext(OverlayManagerContext)
  if (!context) {
    throw new Error('useOverlayManager must be used within OverlayManagerProvider')
  }
  return context
}