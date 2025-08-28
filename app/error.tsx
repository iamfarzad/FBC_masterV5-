'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { PageShell } from '@/components/page-shell'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Error: Global error
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <PageShell>
        <div className="max-w-md mx-auto">
          <Card variant="elevated" className="text-center">
            <CardContent className="space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Something went wrong!</h1>
                <p className="text-muted-foreground">
                  An unexpected error occurred. Please try refreshing the page.
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={reset} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try again
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Go to home
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Error details (development only)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      </PageShell>
    </div>
  )
}
