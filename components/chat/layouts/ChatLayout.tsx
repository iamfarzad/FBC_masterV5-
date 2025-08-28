'use client'

import React from 'react'
import { cn } from '@/src/core/utils'
import { ErrorBoundary } from '@/components/error-boundary'
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
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/20">
          {header}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col min-h-0">
          <ErrorBoundary 
            variant="inline"
            fallback={({ error, resetError }) => (
              <div className="mx-auto max-w-2xl p-6">
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                  <p className="font-medium mb-2 text-destructive">Chat Error</p>
                  <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
                  <div className="flex gap-2 justify-center">
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
          <div className="w-80 border-l border-border/20 bg-card/30 backdrop-blur-sm">
            {sidebar}
          </div>
        )}
      </div>

      {/* Composer */}
      {composer && (
        <div className="sticky bottom-0 z-50 bg-gradient-to-t from-background via-background/95 to-transparent">
          <div className="max-w-4xl mx-auto p-4">
            {composer}
          </div>
        </div>
      )}

      {/* Overlays */}
      {overlay}
    </div>
  )
}