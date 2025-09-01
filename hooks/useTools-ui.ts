import { useState, useCallback } from 'react'

export interface ToolInput {
  [key: string]: unknown
}

export interface ToolOutput {
  [key: string]: unknown
}

export interface ToolResult {
  ok: boolean
  output?: ToolOutput
  error?: string
}

export interface ToolExecution {
  id: string
  type: string
  input: ToolInput
  output?: ToolOutput
  error?: string
  status: 'pending' | 'running' | 'completed' | 'error'
  startTime: Date
  endTime?: Date
}

export function useTools() {
  const [executions, setExecutions] = useState<ToolExecution[]>([])

  const executeTool = useCallback(async (
    type: string, 
    input: ToolInput,
    sessionId?: string
  ): Promise<ToolResult> => {
    const execution: ToolExecution = {
      id: `tool-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      input,
      status: 'pending',
      startTime: new Date()
    }

    setExecutions(prev => [...prev, execution])

    try {
      // Update to running
      setExecutions(prev => prev.map(e => 
        e.id === execution.id ? { ...e, status: 'running' as const } : e
      ))

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (sessionId) {
        headers['x-intelligence-session-id'] = sessionId
      }

      const response = await fetch(`/api/tools/${type}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(input)
      })

      const result: ToolResult = await response.json()

      // Update with result
      setExecutions(prev => prev.map(e => 
        e.id === execution.id ? { 
          ...e, 
          status: result.ok ? 'completed' as const : 'error' as const,
          output: result.output,
          error: result.error,
          endTime: new Date()
        } : e
      ))

      return result
    } catch (error) {
      // Update with error
      setExecutions(prev => prev.map(e => 
        e.id === execution.id ? { 
          ...e, 
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error',
          endTime: new Date()
        } : e
      ))

      return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }, [])

  const getExecution = useCallback((id: string) => {
    return executions.find(e => e.id === id)
  }, [executions])

  const clearExecutions = useCallback(() => {
    setExecutions([])
  }, [])

  return {
    executions,
    executeTool,
    getExecution,
    clearExecutions
  }
}