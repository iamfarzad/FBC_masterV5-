"use client"

import React from 'react'
import { cn } from '@/src/core/utils'
import { CHIP_STATUS_COLORS } from './ActivityConstants'

interface ActivityChipProps {
  direction: "in" | "out"
  label: string
  className?: string
}

export function ActivityChip({ direction, label, className }: ActivityChipProps) {
  const colors = CHIP_STATUS_COLORS[direction]
  const prefix = direction === "in" ? "IN" : "OUT"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border",
        "whitespace-nowrap select-none",
        colors.bg, colors.text, colors.border,
        className
      )}
    >
      <span className="font-semibold opacity-80">{prefix}</span>
      <span className="opacity-90">{label}</span>
    </span>
  )
}
