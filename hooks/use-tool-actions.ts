"use client"

import { useCallback, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

export interface ToolResult {
  ok: boolean
  output?: unknown
  error?: string
}

export interface ToolOptions {
  sessionId?: string
  userId?: string
  idempotencyKey?: string
}

export function useToolActions() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})

  const callTool = useCallback(async (
    endpoint: string,
    data: unknown,
    options: ToolOptions = {}
  ): Promise<ToolResult> => {
    const toolId = endpoint.split('/').pop() || endpoint
    setIsLoading(prev => ({ ...prev, [toolId]: true }))

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (options.sessionId) {
        headers['x-intelligence-session-id'] = options.sessionId
      }
      if (options.userId) {
        headers['x-user-id'] = options.userId
      }
      if (options.idempotencyKey) {
        headers['x-idempotency-key'] = options.idempotencyKey
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast({
        title: "Tool Error",
        description: errorMessage,
        variant: "destructive"
      })
      return { ok: false, error: errorMessage }
    } finally {
      setIsLoading(prev => ({ ...prev, [toolId]: false }))
    }
  }, [toast])

  // Search Tool
  const search = useCallback(async (
    query: string, 
    options: ToolOptions & { urls?: string[] } = {}
  ) => {
    return callTool('/api/tools/search', {
      query,
      sessionId: options.sessionId,
      urls: options.urls
    }, options)
  }, [callTool])

  // Calculator Tool
  const calculate = useCallback(async (
    values: number[],
    options: ToolOptions & { op?: 'sum' | 'avg' | 'min' | 'max' } = {}
  ) => {
    return callTool('/api/tools/calc', {
      values,
      op: options.op
    }, options)
  }, [callTool])

  // Other tools...
  const analyzeWebcam = useCallback(async (
    imageData: string,
    options: ToolOptions & { type?: string } = {}
  ) => {
    return callTool('/api/tools/webcam', {
      image: imageData,
      type: options.type || 'webcam'
    }, options)
  }, [callTool])

  const analyzeScreen = useCallback(async (
    imageData: string,
    options: ToolOptions & { type?: 'screen' | 'document' } = {}
  ) => {
    return callTool('/api/tools/screen', {
      image: imageData,
      type: options.type || 'screen'
    }, options)
  }, [callTool])

  const analyzeURL = useCallback(async (
    url: string,
    options: ToolOptions = {}
  ) => {
    return callTool('/api/tools/url', {
      url
    }, options)
  }, [callTool])

  return {
    // Tool functions
    search,
    calculate,
    analyzeWebcam,
    analyzeScreen,
    analyzeURL,
    
    // Generic tool caller
    callTool,
    
    // Loading states
    isLoading,
    isToolLoading: (toolName: string) => isLoading[toolName] || false
  }
}