"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import Link from 'next/link'

interface BookCallButtonProps {
  size?: 'sm' | 'default' | 'lg'
  className?: string
  children?: React.ReactNode
  title?: string
}

export function BookCallButton({ size = 'default', className, children, title }: BookCallButtonProps) {
  return (
    <Button size={size} className={className} asChild>
      <Link href="/chat" title={title}>
        <Calendar className="w-4 h-4 mr-2" />
        {children || 'Book Consultation'}
      </Link>
    </Button>
  )
}
