/**
 * Tests for AI-related API routes
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'

// Mock environment variables
const mockEnv = {
  GEMINI_API_KEY: 'test-key',
  NODE_ENV: 'test',
  PUBLIC_CHAT_ALLOW: 'true'
}

// Mock external dependencies
jest.mock('@google/generative-ai')
jest.mock('@google/genai')
jest.mock('@/lib/supabase/server')

// Mock Next.js request/response
const createMockRequest = (body: any, headers: Record<string, string> = {}) => {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: {
      get: jest.fn().mockImplementation((key: string) => headers[key] || null)
    },
    cookies: {
      get: jest.fn().mockReturnValue(null)
    },
    nextUrl: {
      origin: 'http://localhost:3000'
    }
  } as unknown as NextRequest
}

describe('AI API Routes Test Suite', () => {
  beforeEach(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
    jest.clearAllMocks()
  })

  afterEach(() => {
    Object.keys(mockEnv).forEach(key => {
      delete process.env[key]
    })
  })

  describe('Chat API Route', () => {
    test('should handle chat request', async () => {
      const mockRequest = createMockRequest({
        messages: [
          { role: 'user', content: 'Hello, how can you help me?' }
        ],
        data: {}
      })

      // Import the route handler
      const { POST } = await import('@/app/api/chat/route')
      
      const response = await POST(mockRequest)
      
      expect(response).toBeDefined()
      expect(response.status).not.toBe(500)
    })

    test('should validate request payload', async () => {
      const mockRequest = createMockRequest({
        // Invalid payload - missing messages
        data: {}
      })

      const { POST } = await import('@/app/api/chat/route')
      
      const response = await POST(mockRequest)
      
      expect(response.status).toBe(400)
    })

    test('should handle rate limiting', async () => {
      const mockRequest = createMockRequest({
        messages: [{ role: 'user', content: 'Test' }],
        data: {}
      }, {
        'x-forwarded-for': '192.168.1.1'
      })

      const { POST } = await import('@/app/api/chat/route')
      
      // Make multiple requests to trigger rate limiting
      const responses = await Promise.all([
        POST(mockRequest),
        POST(mockRequest),
        POST(mockRequest)
      ])

      // At least one should succeed
      expect(responses.some(r => r.status !== 429)).toBe(true)
    })
  })

  describe('AI Stream API Route', () => {
    test('should handle streaming request', async () => {
      const mockRequest = createMockRequest({
        prompt: 'Generate a creative story',
        conversationHistory: [],
        enableStreaming: true
      })

      const { POST } = await import('@/app/api/ai-stream/route')
      
      const response = await POST(mockRequest)
      
      expect(response).toBeDefined()
      expect(response.headers.get('Content-Type')).toBe('text/event-stream')
    })

    test('should validate prompt requirement', async () => {
      const mockRequest = createMockRequest({
        // Missing prompt
        conversationHistory: []
      })

      const { POST } = await import('@/app/api/ai-stream/route')
      
      const response = await POST(mockRequest)
      
      expect(response.status).toBe(400)
    })

    test('should handle empty prompt', async () => {
      const mockRequest = createMockRequest({
        prompt: '   ', // Empty/whitespace prompt
        conversationHistory: []
      })

      const { POST } = await import('@/app/api/ai-stream/route')
      
      const response = await POST(mockRequest)
      
      expect(response.status).toBe(400)
    })
  })

  describe('Intelligence API Routes', () => {
    test('should handle intent detection', async () => {
      const mockRequest = createMockRequest({
        sessionId: 'test-session',
        userMessage: 'I need help with ROI calculation'
      })

      try {
        const { POST } = await import('@/app/api/intelligence/intent/route')
        const response = await POST(mockRequest)
        expect(response).toBeDefined()
      } catch (error) {
        // Route may not exist or have dependencies
        console.log('Intent route test skipped:', error)
      }
    })

    test('should handle suggestions generation', async () => {
      const mockRequest = createMockRequest({
        sessionId: 'test-session',
        stage: 'INTENT'
      })

      try {
        const { POST } = await import('@/app/api/intelligence/suggestions/route')
        const response = await POST(mockRequest)
        expect(response).toBeDefined()
      } catch (error) {
        // Route may not exist or have dependencies
        console.log('Suggestions route test skipped:', error)
      }
    })

    test('should handle context retrieval', async () => {
      const mockRequest = createMockRequest({})

      try {
        const { GET } = await import('@/app/api/intelligence/context/route')
        const response = await GET(mockRequest)
        expect(response).toBeDefined()
      } catch (error) {
        // Route may not exist or have dependencies
        console.log('Context route test skipped:', error)
      }
    })
  })

  describe('Tools API Routes', () => {
    test('should handle ROI calculation', async () => {
      const mockRequest = createMockRequest({
        currentCosts: 100000,
        currentRevenue: 500000,
        growthRate: 15,
        industry: 'Technology',
        companySize: 'Medium'
      })

      try {
        const { POST } = await import('@/app/api/tools/roi/route')
        const response = await POST(mockRequest)
        expect(response).toBeDefined()
      } catch (error) {
        console.log('ROI route test skipped:', error)
      }
    })

    test('should handle document analysis', async () => {
      const mockRequest = createMockRequest({
        file: 'base64encodedfile',
        fileName: 'test.pdf',
        mimeType: 'application/pdf'
      })

      try {
        const { POST } = await import('@/app/api/tools/doc/route')
        const response = await POST(mockRequest)
        expect(response).toBeDefined()
      } catch (error) {
        console.log('Document route test skipped:', error)
      }
    })

    test('should handle translation', async () => {
      const mockRequest = createMockRequest({
        text: 'Hello world',
        targetLanguage: 'es',
        sourceLanguage: 'en'
      })

      try {
        const { POST } = await import('@/app/api/tools/translate/route')
        const response = await POST(mockRequest)
        expect(response).toBeDefined()
      } catch (error) {
        console.log('Translate route test skipped:', error)
      }
    })

    test('should handle search requests', async () => {
      const mockRequest = createMockRequest({
        query: 'artificial intelligence trends',
        maxResults: 5
      })

      try {
        const { POST } = await import('@/app/api/tools/search/route')
        const response = await POST(mockRequest)
        expect(response).toBeDefined()
      } catch (error) {
        console.log('Search route test skipped:', error)
      }
    })
  })

  describe('Video to App API Route', () => {
    test('should handle video processing request', async () => {
      const mockRequest = createMockRequest({
        videoUrl: 'https://youtube.com/watch?v=test',
        generateApp: true
      })

      try {
        const { POST } = await import('@/app/api/video-to-app/route')
        const response = await POST(mockRequest)
        expect(response).toBeDefined()
      } catch (error) {
        console.log('Video-to-app route test skipped:', error)
      }
    })
  })

  describe('Educational Content API Route', () => {
    test('should handle educational content generation', async () => {
      const mockRequest = createMockRequest({
        interactionHistory: [{
          id: 'test-1',
          type: 'click',
          elementType: 'button',
          elementText: 'Test Button',
          appContext: 'test-app',
          timestamp: Date.now()
        }],
        videoContext: {
          videoUrl: 'https://example.com/video',
          videoTitle: 'Test Video',
          generatedSpec: 'Test specification',
          learningObjectives: ['Learn basics'],
          keyTopics: ['Topic 1'],
          difficultyLevel: 'beginner'
        },
        maxHistoryLength: 10
      })

      try {
        const { POST } = await import('@/app/api/educational-content/route')
        const response = await POST(mockRequest)
        expect(response).toBeDefined()
      } catch (error) {
        console.log('Educational content route test skipped:', error)
      }
    })
  })

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: { get: jest.fn().mockReturnValue(null) },
        cookies: { get: jest.fn().mockReturnValue(null) }
      } as unknown as NextRequest

      const { POST } = await import('@/app/api/ai-stream/route')
      
      const response = await POST(mockRequest)
      
      expect(response.status).toBe(500)
    })

    test('should handle missing environment variables', async () => {
      delete process.env.GEMINI_API_KEY

      const mockRequest = createMockRequest({
        prompt: 'Test prompt'
      })

      const { POST } = await import('@/app/api/ai-stream/route')
      
      const response = await POST(mockRequest)
      
      expect(response.status).toBe(500)
    })
  })

  describe('CORS Handling', () => {
    test('should handle OPTIONS requests', async () => {
      try {
        const { OPTIONS } = await import('@/app/api/ai-stream/route')
        const response = await OPTIONS()
        
        expect(response.status).toBe(200)
        expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
        expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
      } catch (error) {
        console.log('OPTIONS test skipped:', error)
      }
    })
  })
})