"use client"

import React from 'react'
import clsx from 'clsx'

import {
  useUnifiedChatMessageCount,
  useUnifiedChatStatus,
  useUnifiedChatError,
} from '@/src/core/chat/state/unified-chat-store'

const containerClass = clsx(
  'fixed bottom-4 right-4 z-50 min-w-[200px] rounded-md border',
  'border-border bg-background/90 shadow-lg backdrop-blur',
  'px-3 py-2 text-xs font-mono text-foreground'
)

export function UnifiedChatDebugPanel() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const messageCount = useUnifiedChatMessageCount()
  const status = useUnifiedChatStatus()
  const error = useUnifiedChatError()

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-foreground">Chat Store</span>
        <span
          className={clsx(
            'rounded px-2 py-0.5 uppercase tracking-wide',
            status === 'streaming' && 'bg-emerald-500/10 text-emerald-500',
            status === 'submitted' && 'bg-amber-500/10 text-amber-500',
            status === 'error' && 'bg-red-500/10 text-red-400',
            status === 'ready' && 'bg-slate-500/10 text-slate-400'
          )}
        >
          {status}
        </span>
      </div>
      <div className="mt-2 flex flex-col gap-1 text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>messages</span>
          <span>{messageCount}</span>
        </div>
        {error ? (
          <div className="mt-1 max-w-[220px] text-xs text-red-400">
            {error.message}
          </div>
        ) : null}
      </div>
    </div>
  )
}
