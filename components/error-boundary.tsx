"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showNavigation?: boolean
  variant?: 'fullscreen' | 'card' | 'inline'
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced logging with production monitoring
    console.error("ErrorBoundary caught an error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorInfo,
      timestamp: new Date().toISOString()
    })

    this.setState({
      error,
      errorInfo,
    })

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo)

    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
      console.error("Production Error Log:", {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback takes priority
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      // Built-in error UI with variant support
      const { variant = 'fullscreen', showNavigation = false } = this.props

      if (variant === 'card') {
        return <ErrorCard variant={variant} state={this.state} onReset={this.resetError} showNavigation={showNavigation} />
      }

      if (variant === 'inline') {
        return <ErrorInline state={this.state} onReset={this.resetError} />
      }

      // Default fullscreen variant
      return <ErrorFullscreen state={this.state} onReset={this.resetError} showNavigation={showNavigation} />
    }

    return this.props.children
  }
}

// Fullscreen error display (original style)
function ErrorFullscreen({
  state,
  onReset,
  showNavigation
}: {
  state: ErrorBoundaryState
  onReset: () => void
  showNavigation: boolean
}) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>An unexpected error occurred. Please try refreshing the page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && state.error && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-mono text-destructive">{state.error.message}</p>
              {state.error.stack && (
                <pre className="text-xs mt-2 overflow-auto max-h-32">{state.error.stack}</pre>
              )}
              {state.errorInfo?.componentStack && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Component Stack:</p>
                  <pre className="text-xs overflow-auto max-h-32">{state.errorInfo.componentStack}</pre>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={onReset} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
              Refresh Page
            </Button>
            {showNavigation && (
              <Button variant="ghost" onClick={() => router.push('/')} className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Compact card variant
function ErrorCard({
  state,
  onReset,
  showNavigation
}: {
  state: ErrorBoundaryState
  onReset: () => void
  showNavigation: boolean
  variant: 'card'
}) {
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Something went wrong
        </CardTitle>
        <CardDescription>An unexpected error occurred. Please try refreshing the page.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {process.env.NODE_ENV === "development" && state.error && (
            <div className="p-3 bg-muted rounded-md">
              <pre className="text-xs text-muted-foreground overflow-auto">{state.error.stack}</pre>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button onClick={onReset} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Inline variant for embedded use
function ErrorInline({
  state,
  onReset
}: {
  state: ErrorBoundaryState
  onReset: () => void
}) {
  return (
    <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">Error</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Something went wrong. Please try again.
      </p>
      <Button onClick={onReset} variant="outline" size="sm">
        <RefreshCw className="h-3 w-3 mr-1" />
        Retry
      </Button>
    </div>
  )
}

// Hook for functional components
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error [${context || 'Unknown'}]:`, error)

    if (process.env.NODE_ENV === 'production') {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      })
    }
  }

  const handleAsyncError = (promise: Promise<any>, context?: string) => {
    return promise.catch((error) => {
      handleError(error, context)
      throw error
    })
  }

  return { handleError, handleAsyncError }
}
