"use client"

import React, { useMemo } from 'react'
import { Copy, RefreshCw } from 'lucide-react'

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

import type { AiChatMessage } from '@/src/core/chat/ai-elements'

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

export interface AiElementsConversationProps {
  messages: AiChatMessage[]
  onSuggestionClick: (suggestion: string) => void
  onMessageAction: (action: 'copy' | 'regenerate', messageId: string) => void
  emptyState?: React.ReactNode
}

export function AiElementsConversation({
  messages,
  onSuggestionClick,
  onMessageAction,
  emptyState,
}: AiElementsConversationProps) {
  const renderedMessages = useMemo(() => messages, [messages])

  return (
    <Conversation className="relative">
      <ConversationContent className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {renderedMessages.length === 0 ? (
          emptyState ?? null
        ) : (
          renderedMessages.map((message) => {
            const isAssistant = message.displayRole === 'assistant'
            const suggestions = message.suggestions ?? []

            return (
              <AiMessage key={message.id} from={message.displayRole}>
                <MessageAvatar
                  name={isAssistant ? 'F.B/c AI' : 'You'}
                  src={isAssistant ? '' : ''}
                />
                <MessageContent>
                  {isAssistant ? (
                    <>
                      {message.content && (
                        <Response parseIncompleteMarkdown={!message.isComplete}>
                          {message.content}
                        </Response>
                      )}

                      {message.reasoning && (
                        <Reasoning isStreaming={!message.isComplete}>
                          <ReasoningTrigger />
                          <ReasoningContent>
                            {message.reasoning}
                          </ReasoningContent>
                        </Reasoning>
                      )}

                      {message.tools && message.tools.length > 0 && (
                        <div className="space-y-2">
                          {message.tools.map((tool, idx) => (
                            <Tool key={tool.id ?? `${message.id}-tool-${idx}`}>
                              <ToolHeader type={`tool-${tool.type}` as `tool-${string}`} state={tool.state} />
                              <ToolContent>
                                {tool.input && <ToolInput input={tool.input as any} />}
                                <ToolOutput
                                  output={renderToolOutput(tool.output) as React.ReactNode}
                                  errorText={tool.errorText}
                                />
                              </ToolContent>
                            </Tool>
                          ))}
                        </div>
                      )}

                      {message.tasks && message.tasks.length > 0 && (
                        <div className="space-y-2">
                          {message.tasks.map((task, idx) => (
                            <Task key={task.id ?? `${message.id}-task-${idx}`}>
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

                      {suggestions.length > 0 && (
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

                      {message.sources && message.sources.length > 0 && (
                        <Sources>
                          <SourcesTrigger count={message.sources.length} />
                          <SourcesContent>
                            {message.sources.map((source, index) => (
                              <Source
                                key={source.url ?? index}
                                href={source.url}
                                title={source.title || source.url || 'Source'}
                              />
                            ))}
                          </SourcesContent>
                        </Sources>
                      )}

                      {message.citations && message.citations.length > 0 && (
                        <GroundedCitation citations={message.citations} className="mt-2" />
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

                      {!message.isComplete && message.content && (
                        <Loader type="typing" text="Streaming..." className="mt-3 text-brand" />
                      )}
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

