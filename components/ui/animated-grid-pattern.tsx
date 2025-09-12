"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface AnimatedGridPatternProps {
  numSquares?: number
  maxOpacity?: number
  duration?: number
  repeatDelay?: number
  className?: string
}

export function AnimatedGridPattern({
  numSquares = 30,
  maxOpacity = 0.1,
  duration = 3,
  repeatDelay = 0.5,
  className
}: AnimatedGridPatternProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(99 102 241 / 0.1)'%3e%3cpath d='m0 .5h32m-32 32h32m-32-16h32m16-32v32'/%3e%3c/svg%3e")`
      }}
    />
  )
}
