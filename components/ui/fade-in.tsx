"use client"

import React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function FadeIn({ children, className, delay = 0, duration = 0.6 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      viewport={{ once: true }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
