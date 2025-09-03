'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card } from './card'
import { ReactNode } from 'react'

interface MotionCardProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  hover?: boolean
}

export function MotionCard({ 
  children, 
  className,
  delay = 0,
  duration = 0.4,
  hover = true
}: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration, ease: 'easeOut' }}
      whileHover={hover ? { scale: 1.02, y: -5 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
    >
      <Card className={cn('transition-shadow', className)}>
        {children}
      </Card>
    </motion.div>
  )
}