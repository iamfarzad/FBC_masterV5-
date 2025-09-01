/**
 * Unified Error Handler for Chat Systems
 * Provides consistent error handling across all chat modes
 */

export interface ChatError {
  code: string
  message: string
  details?: any
  recoverable: boolean
  timestamp: Date
  context?: {
    sessionId?: string
    mode?: string
    userId?: string
  }
}

export class UnifiedErrorHandler {
  private static instance: UnifiedErrorHandler
  private errorLog: ChatError[] = []

  static getInstance(): UnifiedErrorHandler {
    if (!UnifiedErrorHandler.instance) {
      UnifiedErrorHandler.instance = new UnifiedErrorHandler()
    }
    return UnifiedErrorHandler.instance
  }

  /**
   * Handle and standardize chat errors
   */
  handleError(
    error: unknown,
    context?: ChatError['context'],
    operation?: string
  ): ChatError {
    const chatError = this.standardizeError(error, context, operation)

    // Log error for monitoring
    this.logError(chatError)

    // Handle specific error types
    this.handleSpecificErrors(chatError)

    return chatError
  }

  /**
   * Convert various error types to standardized ChatError
   */
  private standardizeError(
    error: unknown,
    context?: ChatError['context'],
    operation?: string
  ): ChatError {
    const timestamp = new Date()

    // Handle different error types
    if (error instanceof Error) {
      return {
        code: this.getErrorCode(error),
        message: this.getErrorMessage(error),
        details: error,
        recoverable: this.isRecoverableError(error),
        timestamp,
        context
      }
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        code: 'UNKNOWN_ERROR',
        message: error,
        details: { originalError: error },
        recoverable: false,
        timestamp,
        context
      }
    }

    // Handle object errors
    if (typeof error === 'object' && error !== null) {
      const err = error as any
      return {
        code: err.code || 'OBJECT_ERROR',
        message: err.message || 'Unknown object error',
        details: error,
        recoverable: err.recoverable !== false,
        timestamp,
        context
      }
    }

    // Handle unknown errors
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      details: { originalError: error },
      recoverable: false,
      timestamp,
      context
    }
  }

  /**
   * Get standardized error code from Error instance
   */
  private getErrorCode(error: Error): string {
    const message = error.message.toLowerCase()

    // Network errors
    if (message.includes('fetch') || message.includes('network')) {
      return 'NETWORK_ERROR'
    }

    // Authentication errors
    if (message.includes('auth') || message.includes('unauthorized')) {
      return 'AUTH_ERROR'
    }

    // Rate limiting
    if (message.includes('rate') || message.includes('limit')) {
      return 'RATE_LIMIT_ERROR'
    }

    // AI provider errors
    if (message.includes('ai') || message.includes('provider')) {
      return 'AI_PROVIDER_ERROR'
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION_ERROR'
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'TIMEOUT_ERROR'
    }

    return 'GENERIC_ERROR'
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: Error): string {
    const code = this.getErrorCode(error)

    switch (code) {
      case 'NETWORK_ERROR':
        return 'Connection problem. Please check your internet and try again.'

      case 'AUTH_ERROR':
        return 'Authentication failed. Please log in again.'

      case 'RATE_LIMIT_ERROR':
        return 'Too many requests. Please wait a moment and try again.'

      case 'AI_PROVIDER_ERROR':
        return 'AI service is temporarily unavailable. Please try again.'

      case 'VALIDATION_ERROR':
        return 'Invalid input. Please check your message and try again.'

      case 'TIMEOUT_ERROR':
        return 'Request timed out. Please try again.'

      default:
        return error.message || 'Something went wrong. Please try again.'
    }
  }

  /**
   * Determine if error is recoverable
   */
  private isRecoverableError(error: Error): boolean {
    const code = this.getErrorCode(error)

    // These errors can be recovered from by retrying
    const recoverableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'AI_PROVIDER_ERROR'
    ]

    return recoverableCodes.includes(code)
  }

  /**
   * Handle specific error types with custom logic
   */
  private handleSpecificErrors(error: ChatError): void {
    switch (error.code) {
      case 'NETWORK_ERROR':
        // Could implement retry logic here
        console.warn('Network error detected, could retry')
        break

      case 'RATE_LIMIT_ERROR':
        // Could implement exponential backoff
        console.warn('Rate limit hit, implementing backoff')
        break

      case 'AI_PROVIDER_ERROR':
        // Could switch to fallback provider
        console.warn('AI provider error, could switch providers')
        break

      default:
        // Log other errors for monitoring
        console.error('Unhandled error:', error)
    }
  }

  /**
   * Log error for monitoring and debugging
   */
  private logError(error: ChatError): void {
    this.errorLog.push(error)

    // Keep only last 1000 errors
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-1000)
    }

    // Log to console with appropriate level
    if (error.recoverable) {
      console.warn('Recoverable chat error:', error)
    } else {
      console.error('Critical chat error:', error)
    }
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStats(): {
    total: number
    byCode: Record<string, number>
    recent: ChatError[]
    recoverable: number
    critical: number
  } {
    const byCode: Record<string, number> = {}
    let recoverable = 0
    let critical = 0

    this.errorLog.forEach(error => {
      byCode[error.code] = (byCode[error.code] || 0) + 1
      if (error.recoverable) recoverable++
      else critical++
    })

    return {
      total: this.errorLog.length,
      byCode,
      recent: this.errorLog.slice(-10),
      recoverable,
      critical
    }
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = []
  }
}

// Export singleton instance
export const unifiedErrorHandler = UnifiedErrorHandler.getInstance()


