import type { UnifiedMessage } from '@/src/core/chat/unified-types'

export type AiToolMetadata = {
  id?: string
  type: string
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error'
  input?: unknown
  output?: unknown
  errorText?: string
}

export type AiTaskMetadata = {
  id?: string
  title?: string
  items?: Array<{
    id?: string
    title?: string
    description?: string
    completed?: boolean
    files?: Array<{ name?: string }>
  }>
  files?: Array<{ name?: string }>
}

export type AiCitationMetadata = {
  uri: string
  title?: string
  description?: string
}

export type AiChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  displayRole: 'user' | 'assistant'
  content?: string
  timestamp: Date
  isComplete: boolean
  suggestions?: string[]
  sources?: Array<{ title?: string; url: string; excerpt?: string }>
  reasoning?: string
  tools?: AiToolMetadata[]
  tasks?: AiTaskMetadata[]
  citations?: AiCitationMetadata[]
  metadata?: Record<string, unknown>
}

const TOOL_STATES = new Set([
  'input-streaming',
  'input-available',
  'output-available',
  'output-error',
])

function parseToolsMetadata(tools: unknown): AiToolMetadata[] | undefined {
  if (!Array.isArray(tools)) return undefined

  const mapped = tools
    .map((tool: any) => {
      if (!tool) return null
      const state = TOOL_STATES.has(tool?.state)
        ? (tool.state as AiToolMetadata['state'])
        : 'output-available'

      return {
        id: typeof tool?.id === 'string' ? tool.id : undefined,
        type: typeof tool?.type === 'string' ? tool.type : 'tool',
        state,
        input: tool?.input,
        output: tool?.output,
        errorText: typeof tool?.errorText === 'string' ? tool.errorText : undefined,
      } satisfies AiToolMetadata
    })
    .filter(Boolean) as AiToolMetadata[]

  return mapped.length > 0 ? mapped : undefined
}

function parseTasksMetadata(tasks: unknown): AiTaskMetadata[] | undefined {
  if (!Array.isArray(tasks)) return undefined

  const mapped = tasks
    .map((task: any) => {
      if (!task) return null
      return {
        id: typeof task?.id === 'string' ? task.id : undefined,
        title: typeof task?.title === 'string' ? task.title : undefined,
        files: Array.isArray(task?.files)
          ? task.files.map((file: any) => ({
              name: typeof file?.name === 'string' ? file.name : undefined,
            }))
          : undefined,
        items: Array.isArray(task?.items)
          ? task.items.map((item: any) => ({
              id: typeof item?.id === 'string' ? item.id : undefined,
              title: typeof item?.title === 'string' ? item.title : undefined,
              description: typeof item?.description === 'string' ? item.description : undefined,
              completed: typeof item?.completed === 'boolean' ? item.completed : undefined,
              files: Array.isArray(item?.files)
                ? item.files.map((file: any) => ({
                    name: typeof file?.name === 'string' ? file.name : undefined,
                  }))
                : undefined,
            }))
          : undefined,
      } satisfies AiTaskMetadata
    })
    .filter(Boolean) as AiTaskMetadata[]

  return mapped.length > 0 ? mapped : undefined
}

function parseCitationsMetadata(citations: unknown): AiCitationMetadata[] | undefined {
  if (!Array.isArray(citations)) return undefined

  const mapped = citations
    .map((citation: any) => {
      if (typeof citation?.uri !== 'string') return null
      return {
        uri: citation.uri,
        title: typeof citation?.title === 'string' ? citation.title : undefined,
        description: typeof citation?.description === 'string' ? citation.description : undefined,
      } satisfies AiCitationMetadata
    })
    .filter(Boolean) as AiCitationMetadata[]

  return mapped.length > 0 ? mapped : undefined
}

// DEPRECATED: mapUnifiedMessagesToAiMessages function removed
// Components now use native AI SDK Message types directly
// This conversion is now handled inline in components that need it
