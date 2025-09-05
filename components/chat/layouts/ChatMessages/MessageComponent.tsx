import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Languages } from 'lucide-react'
import { cn } from '@/src/core/utils'
import {
  Message,
  MessageContent,
  MessageAvatar
} from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ai-elements/reasoning'
import { Sources, SourcesTrigger, SourcesContent, Source } from '@/components/ai-elements/source'
import { Actions, Action } from '@/components/ai-elements/actions'
import { Image } from '@/components/ai-elements/image'
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool'
import { Task, TaskTrigger, TaskContent, TaskItem } from '@/components/ai-elements/task'
import { WebPreview, WebPreviewNavigation, WebPreviewUrl, WebPreviewBody } from '@/components/ai-elements/web-preview'
// Removed ActivityDisplay - using ai-elements instead
import type { ChatMessageUI } from '@/components/chat/types';

// Type alias for compatibility
type ChatMessage = ChatMessageUI;

interface MessageComponentProps {
  message: ChatMessage
  isLast: boolean
  isLoading?: boolean
  sessionId?: string | null
  onExecuteTool?: (type: string, input: unknown, sessionId?: string) => Promise<unknown>
}

export function MessageComponent({ message, isLast, isLoading, sessionId, onExecuteTool }: MessageComponentProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translation, setTranslation] = useState<string | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopiedMessageId(message.id)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      // Copy failed - could show toast notification here
    }
  }

  const handleTranslate = async () => {
    if (!onExecuteTool) return

    setIsTranslating(true)
    try {
      const result = await onExecuteTool('translate', {
        text: message.content,
        targetLang: 'es'
      }, sessionId || undefined)

      type TranslateResult = { ok: boolean; output?: { translated?: string } };
      const r = result as TranslateResult;
      if (r.ok && r.output?.translated) {
        setTranslation(r.output.translated)
      }
    } catch (error) {
      // Translation failed - could show error notification here
    } finally {
      setIsTranslating(false)
    }
  }

  // Extract activities from content
  const contentParts = React.useMemo(() => {
    const content = message.content
    const regex = /\[(ACTIVITY_IN|ACTIVITY_OUT):([^\]]+)\]/g
    const parts: Array<{ type: 'text' | 'activity'; value: string; dir?: 'in' | 'out' }> = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: content.slice(lastIndex, match.index) })
      }
      if (match && match[2]) {
        const dir = match[1] === 'ACTIVITY_IN' ? 'in' : 'out'
        parts.push({ type: 'activity', value: match[2].trim(), dir })
      }
      lastIndex = regex.lastIndex
    }
    if (lastIndex < content.length) {
      parts.push({ type: 'text', value: content.slice(lastIndex) })
    }
    return parts
  }, [message.content])

  return (
    <Message from={message.role}>
      {/* Avatar using ai-elements */}
      <MessageAvatar
        src={message.role === 'assistant' ? "/api/placeholder-avatar" : "/api/user-avatar"}
        name={message.role === 'assistant' ? "F.B/c AI" : "You"}
      />

      {/* Message Content using ai-elements */}
      <MessageContent>
        {/* Reasoning (for assistant messages) */}
        {(() => {
          const bc = message.businessContent;
          const bcType = typeof bc === 'string' ? 'text' : bc?.type ?? 'text';
          return message.role === 'assistant' && bcType === 'business_analysis' && (
          <Reasoning defaultOpen={false} isStreaming={!!(isLast && isLoading)}>
            <ReasoningTrigger>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="size-2 animate-pulse rounded-full bg-accent" />
                <p>AI Analysis Process</p>
              </div>
            </ReasoningTrigger>
            {/* @ts-ignore - ReasoningContent expects string children but we need JSX */}
            <ReasoningContent key="business-analysis">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-1 rounded-full bg-green-500" />
                  <span>Analyzing business context and requirements</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-1 rounded-full bg-green-500" />
                  <span>Identifying key performance indicators and metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-1 rounded-full bg-green-500" />
                  <span>Researching industry benchmarks and best practices</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-1 animate-pulse rounded-full bg-accent" />
                  <span>Generating actionable recommendations and ROI projections</span>
                </div>
                <div className="bg-muted/20 mt-3 rounded-lg p-3 text-xs">
                  <strong>Confidence:</strong> 94% • <strong>Processing time:</strong> 2.3s • <strong>Sources:</strong> 15 validated
                </div>
              </div>
            </ReasoningContent>
          </Reasoning>
        );
        })()}

        {/* Main content with activity chips */}
        <div className="prose prose-sm max-w-none break-words leading-relaxed dark:prose-invert">
          {contentParts.map((part, idx) => {
            if (part.type === 'activity' && part.dir) {
              return (
                <span
                  key={`${message.id}-act-${idx}`}
                  className="mx-1 inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/20"
                >
                  {part.dir === 'in' ? '→' : '←'} {part.value}
                </span>
              )
            }
            return (
              <Response key={`${message.id}-txt-${idx}`}>
                {part.value}
              </Response>
            )
          })}
        </div>

        {/* Tool Results using ai-elements */}
        {(() => {
          const bc = message.businessContent;
          const bcType = typeof bc === 'string' ? 'text' : bc?.type ?? 'text';
          return bcType === 'roi_calculator' && (
          <div className="mt-3">
            <Tool>
              <ToolHeader
                type="tool-roi_calculator"
                state="output-available"
              />
              <ToolContent>
                <ToolInput
                  input={{
                    initialInvestment: 10000,
                    monthlyRevenue: 5000,
                    monthlyExpenses: 3000,
                    timePeriod: 12
                  }}
                />
                <ToolOutput
                  output={
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-accent/10 rounded-lg p-3 text-center">
                        <div className="font-semibold text-accent">140%</div>
                        <div className="text-xs text-muted-foreground">ROI</div>
                      </div>
                      <div className="bg-accent/5 rounded-lg p-3 text-center">
                        <div className="font-semibold">5 months</div>
                        <div className="text-xs text-muted-foreground">Payback</div>
                      </div>
                      <div className="bg-accent/5 rounded-lg p-3 text-center">
                        <div className="font-semibold">$14,000</div>
                        <div className="text-xs text-muted-foreground">Net Profit</div>
                      </div>
                    </div>
                  }
                  errorText={undefined}
                />
              </ToolContent>
            </Tool>
          </div>
        );
        })()}

        {/* Image using ai-elements */}
        {message.imageUrl && (
          <div className="mt-3">
            <Image
              src={message.imageUrl}
              alt="Generated image"
              className="rounded-lg shadow-lg"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Generated image • Click to analyze
            </div>
          </div>
        )}

        {/* Demo: Show generated image for business analysis */}
        {(() => {
          const bc = message.businessContent;
          const bcType = typeof bc === 'string' ? 'text' : bc?.type ?? 'text';
          return message.role === 'assistant' && bcType === 'business_analysis' && (
          <div className="mt-3">
            <Image
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=450&fit=crop"
              alt="Business productivity dashboard"
              className="rounded-lg shadow-lg"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              AI-generated business visualization • Productivity metrics dashboard
            </div>
          </div>
        );
        })()}

        {/* WebPreview for URLs */}
        {message.videoToAppCard && (
          <div className="mt-3">
            <WebPreview defaultUrl={message.videoToAppCard.videoUrl ?? ''}>
              <WebPreviewNavigation>
                <WebPreviewUrl />
                <div className="ml-auto flex items-center gap-2">
                  <div className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    message.videoToAppCard.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                    message.videoToAppCard.status === 'analyzing' ? 'bg-blue-500/10 text-blue-600' :
                    message.videoToAppCard.status === 'generating' ? 'bg-yellow-500/10 text-yellow-600' :
                    message.videoToAppCard.status === 'error' ? 'bg-red-500/10 text-red-600' :
                    'bg-gray-500/10 text-gray-600'
                  )}>
                    {message.videoToAppCard.status}
                  </div>
                  {message.videoToAppCard.progress && (
                    <div className="text-xs text-muted-foreground">
                      {message.videoToAppCard.progress}%
                    </div>
                  )}
                </div>
              </WebPreviewNavigation>
              <WebPreviewBody className="h-64">
                {message.videoToAppCard.code ? (
                  <iframe
                    srcDoc={message.videoToAppCard.code}
                    className="size-full border-0"
                    title="Generated App Preview"
                  />
                ) : (
                  <div className="bg-muted/20 flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-sm text-muted-foreground">
                        Converting video to interactive app...
                      </div>
                      {message.videoToAppCard.status === 'analyzing' && (
                        <div className="text-xs text-muted-foreground">
                          Analyzing video content and extracting key concepts
                        </div>
                      )}
                      {message.videoToAppCard.status === 'generating' && (
                        <div className="text-xs text-muted-foreground">
                          Generating interactive app components
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </WebPreviewBody>
            </WebPreview>
          </div>
        )}

        {/* Sources using ai-elements */}
        {message.sources && message.sources.length > 0 && (
          <Sources>
            <SourcesTrigger count={message.sources.length} />
            <SourcesContent>
              {message.sources!.map((source: { url: string; title?: string }, i: number) => (
                <Source
                  key={`${message.id}-src-${i}`}
                  href={source.url}
                  title={source.title || source.url}
                  onClick={async () => {
                    if (onExecuteTool) {
                      await onExecuteTool('search', {
                        query: source.title || 'Related information',
                        urls: [source.url]
                      }, sessionId || undefined)
                    }
                  }}
                />
              ))}
            </SourcesContent>
          </Sources>
        )}

        {/* Demo: Show sources for business analysis */}
        {(() => {
          const bc = message.businessContent;
          const bcType = typeof bc === 'string' ? 'text' : bc?.type ?? 'text';
          return message.role === 'assistant' && bcType === 'business_analysis' && (
          <Sources>
            <SourcesTrigger count={3} />
            <SourcesContent>
              <Source
                href="https://www.mckinsey.com/capabilities/operations/our-insights/the-state-of-ai-in-2023"
                title="The state of AI in 2023: Generative AI's breakout year"
                onClick={async () => {
                  if (onExecuteTool) {
                    await onExecuteTool('search', {
                      query: 'AI automation business productivity 2023',
                      urls: ['https://www.mckinsey.com/capabilities/operations/our-insights/the-state-of-ai-in-2023']
                    }, sessionId || undefined)
                  }
                }}
              />
              <Source
                href="https://hbr.org/2023/07/how-to-start-an-ai-automation-program"
                title="How to Start an AI Automation Program"
                onClick={async () => {
                  if (onExecuteTool) {
                    await onExecuteTool('search', {
                      query: 'AI automation program implementation guide',
                      urls: ['https://hbr.org/2023/07/how-to-start-an-ai-automation-program']
                    }, sessionId || undefined)
                  }
                }}
              />
              <Source
                href="https://www.gartner.com/en/newsroom/press-releases/2023-10-11-gartner-says-organizations-must-focus-on-business-value-to-realize-ai-success"
                title="Gartner: Organizations Must Focus on Business Value to Realize AI Success"
                onClick={async () => {
                  if (onExecuteTool) {
                    await onExecuteTool('search', {
                      query: 'AI business value ROI measurement',
                      urls: ['https://www.gartner.com/en/newsroom/press-releases/2023-10-11-gartner-says-organizations-must-focus-on-business-value-to-realize-ai-success']
                    }, sessionId || undefined)
                  }
                }}
              />
            </SourcesContent>
          </Sources>
        );
        })()}

        {/* Translation */}
        {translation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-accent/40 text-foreground/90 mt-3 border-l-2 pl-3 text-sm"
          >
            <div className="mb-1 text-xs uppercase tracking-wide opacity-70">
              Translated (ES)
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {translation}
            </div>
          </motion.div>
        )}

        {/* Task Management using ai-elements */}
        {(() => {
          const bc = message.businessContent;
          const bcType = typeof bc === 'string' ? 'text' : bc?.type ?? 'text';
          return bcType === 'consultation_planner' && (
          <div className="mt-3">
            <Task>
              <TaskTrigger title="Consultation Plan" />
              <TaskContent>
                <TaskItem>Schedule initial discovery call</TaskItem>
                <TaskItem>Prepare business analysis framework</TaskItem>
                <TaskItem>Review company documentation</TaskItem>
                <TaskItem>Create consultation proposal</TaskItem>
                <TaskItem>Set up follow-up meetings</TaskItem>
              </TaskContent>
            </Task>
          </div>
        );
        })()}

        {/* Suggestions removed - components not available */}

        {/* Actions using ai-elements */}
        <Actions className="mt-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Action
            tooltip={copiedMessageId === message.id ? 'Copied' : 'Copy'}
            aria-label="Copy"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
          >
            {copiedMessageId === message.id ?
              <div className="size-3 text-green-600">✓</div> :
              <div className="size-3">📋</div>
            }
          </Action>

          {message.role === 'user' && (
            <Action
              tooltip="Edit"
              aria-label="Edit message"
              variant="ghost"
              size="sm"
              onClick={() => {
                // Log removed
              }}
            >
              <div className="size-3">✏️</div>
            </Action>
          )}

          {message.role === 'assistant' && (
            <Action
              tooltip={isTranslating ? 'Translating…' : 'Translate'}
              aria-label="Translate"
              variant="ghost"
              size="sm"
              onClick={handleTranslate}
              disabled={isTranslating}
            >
              <Languages className="size-3" />
            </Action>
          )}
        </Actions>
      </MessageContent>
    </Message>
  )
}
