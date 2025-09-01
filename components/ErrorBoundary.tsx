// 🛡️ GLOBAL ERROR BOUNDARY
// WHY: Catches JavaScript errors anywhere in the app and shows user-friendly messages
// BUSINESS IMPACT: Prevents crashes during demos, keeps users engaged

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { cn } from '@/src/core/utils'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('🚨 Error Boundary caught an error:', error, errorInfo)

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // reportError(error, errorInfo)
    }

    this.setState({
      error,
      errorInfo
    })
  }

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1

    if (newRetryCount <= this.maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: newRetryCount
      })
    }
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className={cn(
          "flex flex-col items-center justify-center min-h-[400px] p-8",
          "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20",
          "rounded-lg border border-red-200 dark:border-red-800"
        )}>
          <div className="text-center space-y-4">
            <div className="relative">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
              <div className="absolute -inset-2 bg-red-500/20 rounded-full blur-xl animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                We encountered an unexpected error. This has been reported to our team.
              </p>
            </div>

            {/* Show retry button if under max retries */}
            {this.state.retryCount < this.maxRetries && (
              <Button
                onClick={this.handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again ({this.maxRetries - this.state.retryCount} attempts left)
              </Button>
            )}

            {/* Always show go home button */}
            <Button
              onClick={this.handleGoHome}
              variant="outline"
              size="lg"
              className="mt-2"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left max-w-2xl">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 🛡️ STREAMING ERROR HANDLER
// WHY: Handles network interruptions during real-time AI conversations
// BUSINESS IMPACT: Prevents demo failures, keeps conversations flowing

export class StreamingErrorHandler {
  private retryCount = 0
  private maxRetries = 3
  private baseDelay = 1000 // 1 second

  async handleStreamingError(
    error: Error,
    controller: ReadableStreamDefaultController,
    context: string = 'streaming'
  ): Promise<boolean> {
    console.error(`🚨 Streaming error in ${context}:`, error)

    if (this.retryCount < this.maxRetries) {
      this.retryCount++

      // Calculate exponential backoff delay
      const delay = this.baseDelay * Math.pow(2, this.retryCount - 1)

      // Send recovery message to client
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
        type: 'recovery',
        message: `Connection interrupted. Retrying... (${this.retryCount}/${this.maxRetries})`,
        retryCount: this.retryCount,
        delay: delay
      })}\n\n`))

      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay))

      return true // Signal to retry
    }

    // Send final error to client
    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
      type: 'error',
      message: `Unable to recover ${context} connection after ${this.maxRetries} attempts. Please refresh and try again.`,
      final: true,
      context
    })}\n\n`))

    return false // Signal to stop
  }

  reset() {
    this.retryCount = 0
  }

  getRetryCount(): number {
    return this.retryCount
  }
}

// 🛡️ API CIRCUIT BREAKER
// WHY: Prevents cascade failures when external services are down
// BUSINESS IMPACT: Keeps your app working even when AI services fail

export class ApiCircuitBreaker {
  private failureCount = 0
  private lastFailureTime = 0
  private circuitOpen = false
  private readonly failureThreshold = 5
  private readonly timeoutMs = 30000 // 30 seconds

  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    context: string = 'API call'
  ): Promise<T> {
    // Check if circuit is open
    if (this.circuitOpen) {
      if (Date.now() - this.lastFailureTime > this.timeoutMs) {
        // Try to close circuit after timeout
        this.circuitOpen = false
        this.failureCount = 0
      } else {
        throw new Error(`${context}: Circuit breaker is open. Service temporarily unavailable.`)
      }
    }

    try {
      const result = await operation()
      // Reset failure count on success
      this.failureCount = 0
      return result
    } catch (error) {
      this.failureCount++
      this.lastFailureTime = Date.now()

      // Open circuit if too many failures
      if (this.failureCount >= this.failureThreshold) {
        this.circuitOpen = true
        console.error(`🚨 Circuit breaker opened for ${context} after ${this.failureCount} failures`)
      }

      throw error
    }
  }

  getStatus() {
    return {
      isOpen: this.circuitOpen,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      timeUntilReset: this.circuitOpen ?
        Math.max(0, this.timeoutMs - (Date.now() - this.lastFailureTime)) : 0
    }
  }
}

