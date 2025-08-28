"use client"

import type React from "react"
import { cn } from "@/src/core/utils"
import { FbcIcon } from "@/components/ui/fbc-icon"

interface TopHeaderProps {
  title: string
  subtitle?: string
  rightActions?: React.ReactNode
  statusChip?: React.ReactNode
  className?: string
}

export function TopHeader({ title, subtitle, rightActions, statusChip, className }: TopHeaderProps) {
  return (
    <div
      role="region"
      aria-label="Chat header"
      className={cn(
        "border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <FbcIcon className="h-5 w-5" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold leading-tight tracking-tight">{title}</h1>
              {statusChip}
            </div>
            {subtitle ? (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {rightActions}
        </div>
      </div>
    </div>
  )}


