"use client"

import React, { useMemo } from 'react'
import { Copy, RefreshCw } from 'lucide-react'
import type { Message } from 'ai'

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message as AiMessage,
  MessageAvatar,
  MessageContent,
} from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion'
import { Actions, Action } from '@/components/ai-elements/actions'
import { Loader } from '@/components/ai-elements/loader'
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ai-elements/reasoning'
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool'
import {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
} from '@/components/ai-elements/task'
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from '@/components/ai-elements/source'
import { GroundedCitation } from '@/components/ai-elements/inline-citation'

export interface NativeAISDKConversationProps {
  messages: Message[]
  toolInvocations?: any[]
  annotations?: any[]
  onSuggestionClick: (suggestion: string) => void
  onMessageAction: (action: 'copy' | 'regenerate', messageId: string) => void
  emptyState?: React.ReactNode
}

function renderToolOutput(output: unknown): React.ReactNode {
  if (output === undefined || output === null) return null
  if (typeof output === 'string') {
    return <div className="whitespace-pre-wrap text-sm">{output}</div>
  }
  if (typeof output === 'object') {
    try {
      return <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(output, null, 2)}</pre>
    } catch {
      return <div className="whitespace-pre-wrap text-sm">{String(output)}</div>
    }
  }
  return <div className="whitespace-pre-wrap text-sm">{String(output)}</div>
}

export function NativeAISDKConversation({
  messages,
  toolInvocations = [],
  annotations = [],
  onSuggestionClick,
  onMessageAction,
  emptyState,
}: NativeAISDKConversationProps) {
  const renderedMessages = useMemo(() => messages, [messages])

  // Extract suggestions from the last assistant message
  const lastAssistantMessage = useMemo(() => {
    return messages.filter(msg => msg.role === 'assistant').pop()
  }, [messages])

  const suggestions = useMemo(() => {
    // Extract suggestions from annotations or generate based on content
    const suggestionAnnotations = annotations.filter(ann => ann.type === 'suggestion')
    if (suggestionAnnotations.length > 0) {
      return suggestionAnnotations.map(ann => ann.content).filter(Boolean)
    }

    // Generate suggestions based on content
    if (lastAssistantMessage?.content) {
      const content = lastAssistantMessage.content.toLowerCase()
      if (content.includes('roi')) {
        return [
          'Ask for underlying ROI assumptions.',
          'Request a sensitivity analysis.',
          'Draft a follow-up note to share the ROI findings.',
        ]
      }
      if (content.includes('lead') || content.includes('prospect')) {
        return [
          'Prioritise the next lead stage.',
          'Draft a tailored outreach email.',
          'Identify supporting assets for the lead.',
        ]
      }
    }

    return [
      'What else should I explore?',
      'Summarise this for an email.',
      'Outline the next actions.',
    ]
  }, [lastAssistantMessage, annotations])

  // Extract reasoning from annotations
  const reasoning = useMemo(() => {
    const reasoningAnnotation = annotations.find(ann => ann.type === 'reasoning')
    return reasoningAnnotation?.content
  }, [annotations])

  // Extract tasks from annotations
  const tasks = useMemo(() => {
    return annotations.filter(ann => ann.type === 'task')
  }, [annotations])

  // Extract citations from annotations
  const citations = useMemo(() => {
    return annotations.filter(ann => ann.type === 'citation')
  }, [annotations])

  // Extract sources from annotations
  const sources = useMemo(() => {
    return annotations.filter(ann => ann.type === 'source')
  }, [annotations])

  return (
    <Conversation className="relative">
      <ConversationContent className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {renderedMessages.length === 0 ? (
          emptyState ?? null
        ) : (
          renderedMessages.map((message) => {
            const isAssistant = message.role === 'assistant'
            const isLastMessage = message.id === lastAssistantMessage?.id

            return (
              <AiMessage key={message.id} from={message.role}>
                <MessageAvatar
                  name={isAssistant ? 'F.B/c AI' : 'You'}
                  src={isAssistant ? '' : ''}
                />
                <MessageContent>
                  {isAssistant ? (
                    <>
                      {message.content && (
                        <Response parseIncompleteMarkdown={!isLastMessage}>
                          {message.content}
                        </Response>
                      )}

                      {reasoning && isLastMessage && (
                        <Reasoning isStreaming={false}>
                          <ReasoningTrigger />
                          <ReasoningContent>
                            {reasoning}
                          </ReasoningContent>
                        </Reasoning>
                      )}

                      {toolInvocations.length > 0 && isLastMessage && (
                        <div className="space-y-2">
                          {toolInvocations.map((tool, idx) => (
                            <Tool key={tool.toolCallId ?? `tool-${idx}`}>
                              <ToolHeader 
                                type={tool.toolName || 'tool'} 
                                state={tool.state || 'output-available'} 
                              />
                              <ToolContent>
                                {tool.args && <ToolInput input={tool.args} />}
                                <ToolOutput
                                  output={renderToolOutput(tool.result)}
                                  errorText={tool.error}
                                />
                              </ToolContent>
                            </Tool>
                          ))}
                        </div>
                      )}

                      {tasks.length > 0 && isLastMessage && (
                        <div className="space-y-2">
                          {tasks.map((task, idx) => (
                            <Task key={task.id ?? `task-${idx}`}>
                              <TaskTrigger title={task.title ?? 'Task'} />
                              <TaskContent>
                                {task.files?.map((file, fileIdx) => (
                                  <TaskItemFile key={file.name ?? fileIdx}>
                                    {file.name ?? 'Attachment'}
                                  </TaskItemFile>
                                ))}
                                {task.items?.map((item, itemIdx) => (
                                  <TaskItem key={item.id ?? itemIdx}>
                                    {item.title ?? 'Task item'}
                                    {item.description && (
                                      <p className="text-xs text-muted-foreground">
                                        {item.description}
                                      </p>
                                    )}
                                  </TaskItem>
                                ))}
                              </TaskContent>
                            </Task>
                          ))}
                        </div>
                      )}

                      {suggestions.length > 0 && isLastMessage && (
                        <Suggestions>
                          {suggestions.map((suggestion) => (
                            <Suggestion
                              key={suggestion}
                              suggestion={suggestion}
                              onClick={onSuggestionClick}
                            />
                          ))}
                        </Suggestions>
                      )}

                      {sources.length > 0 && isLastMessage && (
                        <Sources>
                          <SourcesTrigger count={sources.length} />
                          <SourcesContent>
                            {sources.map((source, index) => (
                              <Source
                                key={source.url ?? index}
                                href={source.url}
                                title={source.title || source.url || 'Source'}
                              />
                            ))}
                          </SourcesContent>
                        </Sources>
                      )}

                      {citations.length > 0 && isLastMessage && (
                        <GroundedCitation citations={citations} className="mt-2" />
                      )}

                      <Actions className="mt-2">
                        <Action
                          tooltip="Copy response"
                          onClick={() => onMessageAction('copy', message.id)}
                        >
                          <Copy className="size-4" />
                        </Action>
                        <Action
                          tooltip="Regenerate"
                          onClick={() => onMessageAction('regenerate', message.id)}
                        >
                          <RefreshCw className="size-4" />
                        </Action>
                      </Actions>
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                      {message.content}
                    </p>
                  )}
                </MessageContent>
              </AiMessage>
            )
          })
        )}
      </ConversationContent>
      <ConversationScrollButton className="border border-border/40 bg-background/80" />
    </Conversation>
  )
}
