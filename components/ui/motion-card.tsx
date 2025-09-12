"use client"

import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { cn } from '@/lib/utils'

interface MotionCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function MotionCard({ children, className, delay = 0, duration = 0.5 }: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      viewport={{ once: true }}
    >
      <Card className={cn(className)}>
        {children}
      </Card>
    </motion.div>
  )
}
