'use client'

import dynamic from 'next/dynamic'

const ProgressTracker = dynamic(() => import('@/components/experience/progress-tracker').then(mod => ({ default: mod.ProgressTracker })), {
  ssr: false,
  loading: () => <div className="h-4 bg-muted/30 rounded animate-pulse" />
})

const CitationsDemo = dynamic(() => import('@/components/experience/citations-demo').then(mod => ({ default: mod.CitationsDemo })), {
  ssr: false,
  loading: () => <div className="h-16 bg-muted/30 rounded animate-pulse" />
})

const DotScreenShader = dynamic(() => import('@/components/ui/dot-shader-background').then(mod => ({ default: mod.DotScreenShader })), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-background to-secondary" />
})

interface ClientHomeWrapperProps {
  children: React.ReactNode
}

export function ClientHomeWrapper({ children }: ClientHomeWrapperProps) {
  return <div>{children}</div>
}

// Export the dynamic components for use in the home page
export { ProgressTracker, CitationsDemo, DotScreenShader }
