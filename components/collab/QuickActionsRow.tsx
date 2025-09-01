"use client"

import type React from "react"
import { cn } from "@/src/core/utils"

export interface QuickActionItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
}

interface QuickActionsRowProps {
  actions: QuickActionItem[]
  className?: string
}

export function QuickActionsRow({ actions, className }: QuickActionsRowProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
      {actions.map(a => (
        <button
          key={a.id}
          type="button"
          onClick={a.onClick}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.40)] focus-visible:ring-offset-2 hover:-translate-y-0.5 active:translate-y-0",
            "border-border/40 bg-card/60 text-foreground hover:bg-[hsl(var(--accent)/0.15)] hover:border-[hsl(var(--accent)/0.40)] hover:text-foreground"
          )}
        >
          {a.icon}
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  )
}


