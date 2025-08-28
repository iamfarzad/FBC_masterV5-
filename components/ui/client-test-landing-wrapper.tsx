'use client'

import dynamic from 'next/dynamic'
import { Button } from './button'

const DatabaseWithRestApi = dynamic(() => import('./DatabaseWithRestApi').then(mod => ({ default: mod.DatabaseWithRestApi })), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-muted/30 rounded animate-pulse" />
})

const BookCallButton = dynamic(() => import('@/components/meeting/BookCallButton').then(mod => ({ default: mod.BookCallButton })), {
  ssr: false,
  loading: () => <Button disabled>Loading...</Button>
})

interface ClientTestLandingWrapperProps {
  children: React.ReactNode
}

export function ClientTestLandingWrapper({ children }: ClientTestLandingWrapperProps) {
  return <div>{children}</div>
}

// Export the dynamic components for use in the test landing page
export { DatabaseWithRestApi, BookCallButton }
