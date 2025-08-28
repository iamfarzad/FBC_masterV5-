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

const Avatar = dynamic(() => import('@/components/ui/avatar').then(mod => ({ default: mod.Avatar })), {
  ssr: false,
  loading: () => <div className="w-48 h-48 bg-muted/30 rounded-full animate-pulse" />
})

const AvatarImage = dynamic(() => import('@/components/ui/avatar').then(mod => ({ default: mod.AvatarImage })), {
  ssr: false,
  loading: () => null
})

const AvatarFallback = dynamic(() => import('@/components/ui/avatar').then(mod => ({ default: mod.AvatarFallback })), {
  ssr: false,
  loading: () => null
})

interface ClientAboutWrapperProps {
  children: React.ReactNode
}

export function ClientAboutWrapper({ children }: ClientAboutWrapperProps) {
  return <div>{children}</div>
}

// Export the dynamic components for use in the about page
export { ProgressTracker, CitationsDemo, Avatar, AvatarImage, AvatarFallback }
