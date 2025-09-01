"use client"

import type React from "react"
import { cn } from "@/src/core/utils"

interface SuggestionsRowProps {
  suggestions: Array<{ id: string; label: string; onClick: () => void }>
  className?: string
}

export function SuggestionsRow({ suggestions, className }: SuggestionsRowProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {suggestions.map(s => (
        <button
          key={s.id}
          type="button"
          onClick={s.onClick}
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1.5 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.40)] focus-visible:ring-offset-2 min-h-11",
            "border-border/40 bg-card/60 text-foreground hover:bg-[hsl(var(--accent)/0.15)] hover:border-[hsl(var(--accent)/0.40)] hover:text-foreground"
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}


