import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

// Standardized API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Standardized error response
export interface ApiError {
  success: false
  error: string
  code?: string
  details?: unknown
}

// Standardized success response
export interface ApiSuccess<T = unknown> {
  success: true
  data: T
  message?: string
}

// Utility functions for consistent API responses
export const api = {
  success: <T>(data: T, message?: string, status = 200): NextResponse<ApiSuccess<T>> => {
    return NextResponse.json(
      { success: true, data, message: message ?? '' } satisfies ApiSuccess<T>,
      { status }
    )
  },

  error: (error: string, status = 500, code?: string, details?: unknown): NextResponse<ApiError> => {
    return NextResponse.json(
      { success: false, error, code: code ?? '', details } satisfies ApiError,
      { status }
    )
  },

  badRequest: (error: string, details?: unknown): NextResponse<ApiError> => {
    return api.error(error, 400, 'BAD_REQUEST', details)
  },

  unauthorized: (error = 'Unauthorized'): NextResponse<ApiError> => {
    return api.error(error, 401, 'UNAUTHORIZED')
  },

  notFound: (error = 'Not found'): NextResponse<ApiError> => {
    return api.error(error, 404, 'NOT_FOUND')
  },

  validationError: (error: string, details?: unknown): NextResponse<ApiError> => {
    return api.error(error, 422, 'VALIDATION_ERROR', details)
  }
}

// Standardized request handler wrapper
export function withApiHandler<T = unknown>(
  handler: (req: NextRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    context?: { params?: Record<string, string> }
  ): Promise<NextResponse> => {
    try {
      return await handler(req, context)
    } catch (error) {
      console.error('API Error:', error)

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return api.validationError('Validation failed', error.errors)
      }

      // Handle other errors
      const message = error instanceof Error ? error.message : 'Internal server error'
      return api.error(message, 500, 'INTERNAL_ERROR')
    }
  }
}

// Utility to parse JSON with error handling
export async function parseJson<T>(req: NextRequest): Promise<T> {
  try {
    return await req.json()
  } catch (error) {
    throw new Error('Invalid JSON in request body')
  }
}

// Utility to get URL parameters safely
export function getParams(req: NextRequest, param: string): string | null {
  const url = new URL(req.url)
  return url.searchParams.get(param)
}

// Utility to validate required fields
export function validateRequired<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): { valid: true } | { valid: false; missing: string[] } {
  const missing = fields.filter(field => !data[field])
  return missing.length === 0
    ? { valid: true }
    : { valid: false, missing: missing as string[] }
}
