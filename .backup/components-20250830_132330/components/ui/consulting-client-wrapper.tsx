'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent } from './card'

const AnimatedGridPattern = dynamic(() => import('./animated-grid-pattern').then(mod => ({ default: mod.AnimatedGridPattern })), {
  ssr: false,
  loading: () => <div className="absolute inset-0 opacity-0" />
})

const MotionCard = dynamic(() => import('./motion-card').then(mod => ({ default: mod.MotionCard })), {
  ssr: false,
  loading: () => <Card><CardContent>Loading...</CardContent></Card>
})

const FadeIn = dynamic(() => import('./fade-in').then(mod => ({ default: mod.FadeIn })), {
  ssr: false,
  loading: () => <div />
})

const ROICalculator = dynamic(() => import('@/components/chat/tools/ROICalculator/ROICalculator').then(mod => ({ default: mod.ROICalculator })), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted/30 rounded animate-pulse" />
})

const ProgressTracker = dynamic(() => import('@/components/experience/progress-tracker').then(mod => ({ default: mod.ProgressTracker })), {
  ssr: false,
  loading: () => <div className="h-4 bg-muted/30 rounded animate-pulse" />
})

const CitationsDemo = dynamic(() => import('@/components/experience/citations-demo').then(mod => ({ default: mod.CitationsDemo })), {
  ssr: false,
  loading: () => <div className="h-16 bg-muted/30 rounded animate-pulse" />
})

interface ConsultingClientWrapperProps {
  children: React.ReactNode
}

export function ConsultingClientWrapper({ children }: ConsultingClientWrapperProps) {
  return <div>{children}</div>
}

// Export the dynamic components for use in the consulting page
export { AnimatedGridPattern, MotionCard, FadeIn, ROICalculator, ProgressTracker, CitationsDemo }
