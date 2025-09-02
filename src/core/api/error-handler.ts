import { NextResponse } from 'next/server'

// 🚨 COMPREHENSIVE ERROR HANDLING SYSTEM
export interface APIError {
  code: string
  message: string
  details?: string
  retryable?: boolean
  statusCode: number
}

export class APIErrorHandler {
  
  // 🔄 SMART ERROR CLASSIFICATION
  static classifyError(error: unknown): APIError {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      
      // Rate limiting errors
      if (message.includes('rate limit') || message.includes('quota')) {
        return {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'API rate limit exceeded. Please try again in a moment.',
          details: error.message,
          retryable: true,
          statusCode: 429
        }
      }
      
      // Authentication errors
      if (message.includes('auth') || message.includes('unauthorized') || message.includes('api key')) {
        return {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication failed. Please check API configuration.',
          details: error.message,
          retryable: false,
          statusCode: 401
        }
      }
      
      // Network/timeout errors
      if (message.includes('timeout') || message.includes('network') || message.includes('fetch')) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check connection and try again.',
          details: error.message,
          retryable: true,
          statusCode: 503
        }
      }
      
      // Validation errors
      if (message.includes('validation') || message.includes('invalid') || error.name === 'ZodError') {
        return {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data provided.',
          details: error.message,
          retryable: false,
          statusCode: 400
        }
      }
      
      // Google AI specific errors
      if (message.includes('safety') || message.includes('blocked')) {
        return {
          code: 'CONTENT_SAFETY_ERROR',
          message: 'Content blocked by safety filters.',
          details: 'Please modify your input and try again.',
          retryable: false,
          statusCode: 400
        }
      }
      
      // Model/capacity errors
      if (message.includes('model') || message.includes('capacity') || message.includes('overloaded')) {
        return {
          code: 'MODEL_CAPACITY_ERROR',
          message: 'AI service temporarily overloaded. Please try again.',
          details: error.message,
          retryable: true,
          statusCode: 503
        }
      }
    }
    
    // Default unknown error
    return {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
      details: error instanceof Error ? error.message : 'Unknown error',
      retryable: false,
      statusCode: 500
    }
  }
  
  // 📊 CREATE STANDARDIZED ERROR RESPONSE
  static createErrorResponse(error: unknown): NextResponse {
    const apiError = this.classifyError(error)
    
    const response = {
      ok: false,
      error: {
        code: apiError.code,
        message: apiError.message,
        details: process.env.NODE_ENV === 'development' ? apiError.details : undefined,
        retryable: apiError.retryable,
        timestamp: new Date().toISOString()
      }
    }
    
    // Log error for monitoring
    console.error(`🚨 API Error [${apiError.code}]:`, {
      message: apiError.message,
      details: apiError.details,
      statusCode: apiError.statusCode,
      retryable: apiError.retryable
    })
    
    return NextResponse.json(response, { status: apiError.statusCode })
  }
  
  // ⚡ RETRY LOGIC HELPER
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        const apiError = this.classifyError(error)
        
        // Don't retry non-retryable errors
        if (!apiError.retryable || attempt === maxRetries) {
          throw error
        }
        
        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, attempt - 1)
        console.log(`⏱️ Retry attempt ${attempt}/${maxRetries} after ${backoffDelay}ms delay`)
        await new Promise(resolve => setTimeout(resolve, backoffDelay))
      }
    }
    
    throw lastError
  }
}

// 🛡️ RATE LIMITING SYSTEM
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>()
  
  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const record = this.requests.get(key)
    
    if (!record || record.resetTime < now) {
      this.requests.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    if (record.count >= maxRequests) {
      return false
    }
    
    record.count++
    return true
  }
  
  getRemainingRequests(key: string, maxRequests: number): number {
    const record = this.requests.get(key)
    return record ? Math.max(0, maxRequests - record.count) : maxRequests
  }
  
  getResetTime(key: string): number {
    const record = this.requests.get(key)
    return record?.resetTime || Date.now()
  }
}

export const rateLimiter = new RateLimiter()

// 📊 PERFORMANCE MONITORING
export interface PerformanceMetrics {
  startTime: number
  endTime?: number
  duration?: number
  tokensUsed?: number
  model?: string
  success?: boolean
  errorCode?: string
}

export class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetrics>()
  
  startOperation(operationId: string): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      startTime: Date.now()
    }
    this.metrics.set(operationId, metrics)
    return metrics
  }
  
  endOperation(operationId: string, result: { 
    success: boolean
    tokensUsed?: number
    model?: string
    errorCode?: string
  }): PerformanceMetrics | null {
    const metrics = this.metrics.get(operationId)
    if (!metrics) return null
    
    metrics.endTime = Date.now()
    metrics.duration = metrics.endTime - metrics.startTime
    metrics.success = result.success
    metrics.tokensUsed = result.tokensUsed
    metrics.model = result.model
    metrics.errorCode = result.errorCode
    
    // Log performance metrics
    console.log(`📊 Performance [${operationId}]:`, {
      duration: `${metrics.duration}ms`,
      success: metrics.success,
      model: metrics.model,
      tokens: metrics.tokensUsed,
      errorCode: metrics.errorCode
    })
    
    // Cleanup
    this.metrics.delete(operationId)
    return metrics
  }
}

export const performanceMonitor = new PerformanceMonitor()
