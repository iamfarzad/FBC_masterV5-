'use client'

import React from 'react'
import { cn } from '@/src/core/utils'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/button'

interface ChatLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  composer?: React.ReactNode
  sidebar?: React.ReactNode
  overlay?: React.ReactNode
  className?: string
  disabled?: boolean
}

export function ChatLayout({
  children,
  header,
  composer,
  sidebar,
  overlay,
  className,
  disabled = false
}: ChatLayoutProps) {
  return (
    <div className={cn(
      'flex flex-col h-[100dvh] bg-gradient-to-br from-background via-background to-background/95',
      disabled && 'pointer-events-none opacity-50',
      className
    )}>
      {/* Header */}
      {header && (
        <div className="bg-background/80 border-border/20 sticky top-0 z-40 border-b backdrop-blur-xl">
          {header}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1">
        {/* Chat Messages */}
        <div className="flex min-h-0 flex-1 flex-col">
          <ErrorBoundary 
            variant="inline"
            fallback={({ error, resetError }) => (
              <div className="mx-auto max-w-2xl p-6">
                <div className="border-destructive/20 bg-destructive/5 rounded-xl border p-6 text-center">
                  <p className="mb-2 font-medium text-destructive">Chat Error</p>
                  <p className="mb-4 text-sm text-muted-foreground">{error.message}</p>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" onClick={resetError} size="sm">
                      Retry
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()} size="sm">
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            )}
          >
            {children}
          </ErrorBoundary>
        </div>

        {/* Sidebar */}
        {sidebar && (
          <div className="border-border/20 bg-card/30 w-80 border-l backdrop-blur-sm">
            {sidebar}
          </div>
        )}
      </div>

      {/* Composer */}
      {composer && (
        <div className="via-background/95 sticky bottom-0 z-50 bg-gradient-to-t from-background to-transparent">
          <div className="mx-auto max-w-4xl p-4">
            {composer}
          </div>
        </div>
      )}

      {/* Overlays */}
      {overlay}
    </div>
  )
}