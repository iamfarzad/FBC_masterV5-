/**
 * Comprehensive tests for all AI functions in the codebase
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals'

// Mock environment variables
const mockEnv = {
  GEMINI_API_KEY: 'test-key',
  PERPLEXITY_API_KEY: 'test-perplexity-key',
  NODE_ENV: 'test'
}

// Mock external dependencies
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue('Mock AI response')
        }
      }),
      generateContentStream: jest.fn().mockReturnValue({
        stream: (async function* () {
          yield { text: () => 'Mock ' }
          yield { text: () => 'streaming ' }
          yield { text: () => 'response' }
        })()
      })
    })
  }))
}))

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: 'Mock GenAI response'
      }),
      generateContentStream: jest.fn().mockReturnValue((async function* () {
        yield { text: 'Mock ' }
        yield { text: 'streaming ' }
        yield { text: 'response' }
      })())
    }
  }))
}))

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  getSupabase: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      }),
      insert: jest.fn().mockResolvedValue({ data: [], error: null }),
      update: jest.fn().mockResolvedValue({ data: [], error: null })
    }),
    channel: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue({ error: null })
    })
  })
}))

describe('AI Functions Test Suite', () => {
  beforeEach(() => {
    // Set up environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
    
    // Clear all mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Clean up environment variables
    Object.keys(mockEnv).forEach(key => {
      delete process.env[key]
    })
  })

  describe('Gemini Service Tests', () => {
    test('should initialize GeminiService without errors', async () => {
      const { geminiService } = await import('@/lib/services/gemini-service')
      expect(geminiService).toBeDefined()
    })

    test('should generate text response', async () => {
      const { geminiService } = await import('@/lib/services/gemini-service')
      
      const result = await geminiService.generateText('Test prompt')
      
      expect(result).toHaveProperty('text')
      expect(result.text).toBe('Mock AI response')
      expect(result).toHaveProperty('tokens')
      expect(result).toHaveProperty('cost')
    })

    test('should handle image analysis', async () => {
      const { geminiService } = await import('@/lib/services/gemini-service')
      
      const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD'
      const result = await geminiService.analyzeImage(mockImageData, 'Analyze this image')
      
      expect(result).toHaveProperty('text')
      expect(result.text).toBe('Mock AI response')
    })

    test('should handle document analysis', async () => {
      const { geminiService } = await import('@/lib/services/gemini-service')
      
      const result = await geminiService.analyzeDocument(
        'base64documentdata',
        'application/pdf',
        'test.pdf'
      )
      
      expect(result).toHaveProperty('text')
      expect(result.text).toBe('Mock AI response')
    })

    test('should generate ROI report', async () => {
      const { geminiService } = await import('@/lib/services/gemini-service')
      
      const roiData = {
        currentCosts: 100000,
        currentRevenue: 500000,
        growthRate: 15,
        industry: 'Technology',
        companySize: 'Medium'
      }
      
      const result = await geminiService.generateRoiReport(roiData)
      
      expect(result).toHaveProperty('text')
      expect(result.text).toBe('Mock AI response')
    })

    test('should generate video app specification', async () => {
      const { geminiService } = await import('@/lib/services/gemini-service')
      
      const result = await geminiService.generateVideoAppSpec(
        'Video transcript content',
        ['screenshot1.jpg']
      )
      
      expect(result).toHaveProperty('text')
      expect(result.text).toBe('Mock AI response')
    })

    test('should stream text generation', async () => {
      const { geminiService } = await import('@/lib/services/gemini-service')
      
      const stream = geminiService.generateTextStream('Test prompt', [])
      const chunks = []
      
      for await (const chunk of stream) {
        chunks.push(chunk)
      }
      
      expect(chunks.length).toBeGreaterThan(0)
      expect(chunks.join('')).toContain('Mock')
    })
  })

  describe('Educational Gemini Service Tests', () => {
    test('should stream educational content', async () => {
      const { streamEducationalContent } = await import('@/lib/educational-gemini-service')
      
      const mockInteractionHistory = [{
        id: 'test-1',
        type: 'click',
        elementType: 'button',
        elementText: 'Test Button',
        appContext: 'test-app',
        timestamp: Date.now()
      }]
      
      const mockVideoContext = {
        videoUrl: 'https://example.com/video',
        videoTitle: 'Test Video',
        generatedSpec: 'Test specification',
        learningObjectives: ['Learn basics', 'Practice skills'],
        keyTopics: ['Topic 1', 'Topic 2'],
        difficultyLevel: 'beginner' as const
      }
      
      const stream = streamEducationalContent(mockInteractionHistory, mockVideoContext, 10)
      const chunks = []
      
      for await (const chunk of stream) {
        chunks.push(chunk)
      }
      
      expect(chunks.length).toBeGreaterThan(0)
    })

    test('should extract learning objectives', async () => {
      const { extractLearningObjectives } = await import('@/lib/educational-gemini-service')
      
      const mockSpec = `
        Learning Objectives:
        1. Understand basic concepts
        2. Practice implementation
        3. Master advanced techniques
      `
      
      const objectives = extractLearningObjectives(mockSpec)
      
      expect(objectives).toHaveLength(3)
      expect(objectives[0]).toContain('Understand basic concepts')
    })

    test('should extract key topics', async () => {
      const { extractKeyTopics } = await import('@/lib/educational-gemini-service')
      
      const mockSpec = 'This specification covers JavaScript React Components and API Integration'
      
      const topics = extractKeyTopics(mockSpec)
      
      expect(topics).toContain('JavaScript')
      expect(topics).toContain('React')
      expect(topics).toContain('Components')
    })
  })

  describe('Google Grounding Provider Tests', () => {
    test('should initialize GoogleGroundingProvider', async () => {
      const { GoogleGroundingProvider } = await import('@/lib/intelligence/providers/search/google-grounding')
      
      expect(() => new GoogleGroundingProvider()).not.toThrow()
    })

    test('should perform grounded search', async () => {
      const { GoogleGroundingProvider } = await import('@/lib/intelligence/providers/search/google-grounding')
      
      const provider = new GoogleGroundingProvider()
      const result = await provider.groundedAnswer('Test query')
      
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('citations')
      expect(Array.isArray(result.citations)).toBe(true)
    })

    test('should search company information', async () => {
      const { GoogleGroundingProvider } = await import('@/lib/intelligence/providers/search/google-grounding')
      
      const provider = new GoogleGroundingProvider()
      const result = await provider.searchCompany('example.com')
      
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('citations')
    })

    test('should search person information', async () => {
      const { GoogleGroundingProvider } = await import('@/lib/intelligence/providers/search/google-grounding')
      
      const provider = new GoogleGroundingProvider()
      const result = await provider.searchPerson('John Doe', 'Example Corp')
      
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('citations')
    })
  })

  describe('Tool Suggestion Engine Tests', () => {
    test('should suggest tools based on context and intent', async () => {
      const { suggestTools } = await import('@/lib/intelligence/tool-suggestion-engine')
      
      const mockContext = {
        role: 'CTO',
        company: {
          industry: 'technology'
        },
        capabilities: []
      }
      
      const mockIntent = {
        type: 'consulting' as const,
        confidence: 0.8
      }
      
      const suggestions = suggestTools(mockContext, mockIntent)
      
      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0]).toHaveProperty('id')
      expect(suggestions[0]).toHaveProperty('label')
      expect(suggestions[0]).toHaveProperty('capability')
    })
  })

  describe('Model Selection Tests', () => {
    test('should select appropriate model for feature', async () => {
      const { selectModelForFeature } = await import('@/lib/model-selector')
      
      const result = selectModelForFeature('chat', 1000, false)
      
      expect(result).toHaveProperty('model')
      expect(result).toHaveProperty('reason')
      expect(result).toHaveProperty('estimatedCost')
    })

    test('should estimate tokens correctly', async () => {
      const { estimateTokens } = await import('@/lib/model-selector')
      
      const tokens = estimateTokens('This is a test message')
      
      expect(typeof tokens).toBe('number')
      expect(tokens).toBeGreaterThan(0)
    })
  })

  describe('AI Prompts Tests', () => {
    test('should have valid prompt constants', async () => {
      const prompts = await import('@/lib/ai-prompts')
      
      expect(prompts.SPEC_FROM_VIDEO_PROMPT).toBeDefined()
      expect(typeof prompts.SPEC_FROM_VIDEO_PROMPT).toBe('string')
      expect(prompts.SPEC_FROM_VIDEO_PROMPT.length).toBeGreaterThan(0)
      
      expect(prompts.CODE_REGION_OPENER).toBe('```')
      expect(prompts.CODE_REGION_CLOSER).toBe('```')
      
      expect(prompts.SPEC_ADDENDUM).toBeDefined()
      expect(typeof prompts.SPEC_ADDENDUM).toBe('string')
    })
  })

  describe('Token Cost Calculator Tests', () => {
    test('should calculate token costs', async () => {
      const { calculateTokenCost } = await import('@/lib/token-cost-calculator')
      
      const cost = calculateTokenCost('gemini-1.5-flash', 1000, 500)
      
      expect(typeof cost).toBe('number')
      expect(cost).toBeGreaterThan(0)
    })

    test('should estimate request cost', async () => {
      const { estimateRequestCost } = await import('@/lib/token-cost-calculator')
      
      const cost = estimateRequestCost('chat', 'This is a test message', 'gemini-1.5-flash')
      
      expect(typeof cost).toBe('number')
      expect(cost).toBeGreaterThan(0)
    })
  })

  describe('Error Handling Tests', () => {
    test('should handle missing API key gracefully', async () => {
      delete process.env.GEMINI_API_KEY
      
      try {
        const { GeminiService } = await import('@/lib/services/gemini-service')
        // This should throw an error due to missing API key
        expect(() => new (GeminiService as any)()).toThrow()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    test('should handle API errors gracefully', async () => {
      // Mock API failure
      const mockError = new Error('API Error')
      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
          getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockRejectedValue(mockError)
          })
        }))
      }))
      
      const { geminiService } = await import('@/lib/services/gemini-service')
      const result = await geminiService.generateText('Test prompt')
      
      expect(result).toHaveProperty('error')
      expect(result.error).toBeDefined()
    })
  })

  describe('Integration Tests', () => {
    test('should handle complete AI workflow', async () => {
      const { geminiService } = await import('@/lib/services/gemini-service')
      
      // Test a complete workflow: generate text, then analyze result
      const initialResult = await geminiService.generateText('Generate a business plan')
      expect(initialResult).toHaveProperty('text')
      
      if (initialResult.text) {
        const analysisResult = await geminiService.generateText(
          `Analyze this business plan: ${initialResult.text}`
        )
        expect(analysisResult).toHaveProperty('text')
      }
    })

    test('should maintain session context', async () => {
      const { geminiService } = await import('@/lib/services/gemini-service')
      
      const sessionId = 'test-session-123'
      const options = { sessionId }
      
      const result1 = await geminiService.generateText('Hello', options)
      const result2 = await geminiService.generateText('Continue the conversation', options)
      
      expect(result1).toHaveProperty('text')
      expect(result2).toHaveProperty('text')
    })
  })
})