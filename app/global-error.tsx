'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { PageShell } from '@/components/page-shell'

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <PageShell>
            <div className="mx-auto max-w-md">
              <Card variant="elevated" className="text-center">
                <CardContent className="space-y-6">
                  <div className="bg-destructive/10 mx-auto flex size-16 items-center justify-center rounded-full">
                    <AlertTriangle className="size-8 text-destructive" />
                  </div>
                  
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Something went wrong!</h1>
                    <p className="text-muted-foreground">
                      A critical error occurred. Please try refreshing the page.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button onClick={reset} className="w-full">
                      <RefreshCw className="mr-2 size-4" />
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
                      <pre className="mt-2 overflow-auto rounded bg-muted p-3 text-xs">
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
      </body>
    </html>
  )
}
