/**
 * AI SDK Tools - Chat Debugging Component
 * Real-time debugging interface for chat state and performance
 */

'use client'

import React, { useState } from 'react'
import { useChatStore, chatSelectors } from '@/hooks/useUnifiedChatStore'
import { cn } from '@/src/core/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bug, 
  Activity, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Trash2,
  RefreshCw
} from 'lucide-react'

interface ChatDevtoolsProps {
  className?: string
  position?: 'fixed' | 'relative'
}

export function ChatDevtools({ className, position = 'fixed' }: ChatDevtoolsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  // Global store state
  const sessions = useChatStore(state => state.sessions)
  const clearMessages = useChatStore(state => state.clearMessages)
  
  // Get all session IDs
  const sessionIds = Array.from(sessions.keys())
  
  // Selected session data
  const selectedSessionData = selectedSession ? sessions.get(selectedSession) : null

  // Performance metrics
  const totalMessages = Array.from(sessions.values()).reduce(
    (total, session) => total + session.messages.length, 
    0
  )
  const activeStreams = Array.from(sessions.values()).filter(
    session => session.isStreaming
  ).length
  const errorSessions = Array.from(sessions.values()).filter(
    session => session.error !== null
  ).length

  if (!isOpen) {
    return (
      <div className={cn(
        position === 'fixed' && "fixed bottom-4 right-4 z-[9999]",
        className
      )}>
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          variant="outline"
          className="bg-background/95 border-border hover:bg-surface shadow-lg backdrop-blur"
        >
          <Bug className="size-4 mr-2" />
          Chat Debug
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(
      position === 'fixed' && "fixed inset-4 z-[9999] pointer-events-none",
      className
    )}>
      <div className="flex justify-end">
        <Card className="w-96 max-h-[80vh] bg-background/95 border-border shadow-xl backdrop-blur pointer-events-auto">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="size-5 text-brand" />
                <CardTitle className="text-lg">Chat Devtools</CardTitle>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                size="sm"
                variant="ghost"
                className="size-8 p-0"
              >
                ×
              </Button>
            </div>
            
            {/* Performance Overview */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center">
                <div className="text-lg font-semibold text-brand">{sessionIds.length}</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{totalMessages}</div>
                <div className="text-xs text-muted-foreground">Messages</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-lg font-semibold",
                  activeStreams > 0 ? "text-brand" : "text-muted-foreground"
                )}>
                  {activeStreams}
                </div>
                <div className="text-xs text-muted-foreground">Streaming</div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <Tabs defaultValue="sessions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="sessions" className="mt-4">
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {sessionIds.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageSquare className="size-8 mx-auto mb-2 opacity-50" />
                        <p>No active sessions</p>
                      </div>
                    ) : (
                      sessionIds.map(sessionId => {
                        const session = sessions.get(sessionId)!
                        return (
                          <Card
                            key={sessionId}
                            className={cn(
                              "p-3 cursor-pointer transition-colors",
                              selectedSession === sessionId && "border-brand"
                            )}
                            onClick={() => setSelectedSession(sessionId)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-mono text-sm truncate">
                                {sessionId}
                              </div>
                              <div className="flex items-center gap-1">
                                {session.isStreaming && (
                                  <Badge variant="default" className="bg-brand">
                                    <Loader2 className="size-3 mr-1 animate-spin" />
                                    Streaming
                                  </Badge>
                                )}
                                {session.isLoading && (
                                  <Badge variant="secondary">
                                    <Clock className="size-3 mr-1" />
                                    Loading
                                  </Badge>
                                )}
                                {session.error && (
                                  <Badge variant="destructive">
                                    <AlertTriangle className="size-3 mr-1" />
                                    Error
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{session.messages.length} messages</span>
                              <span>{session.mode}</span>
                            </div>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="messages" className="mt-4">
                {selectedSessionData ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-mono text-sm text-muted-foreground">
                        {selectedSession}
                      </div>
                      <Button
                        onClick={() => selectedSession && clearMessages(selectedSession)}
                        size="sm"
                        variant="outline"
                        className="size-8 p-0"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {selectedSessionData.messages.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            <MessageSquare className="size-8 mx-auto mb-2 opacity-50" />
                            <p>No messages</p>
                          </div>
                        ) : (
                          selectedSessionData.messages.map(message => (
                            <Card key={message.id} className="p-2">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge 
                                  variant={message.role === 'user' ? 'secondary' : 'default'}
                                  className="text-xs"
                                >
                                  {message.role}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {message.id.slice(0, 8)}
                                </span>
                              </div>
                              <div className="text-sm truncate">
                                {message.content}
                              </div>
                              {message.metadata?.error === true && (
                                <div className="mt-1 text-xs text-destructive">
                                  Error: {String(message.metadata.errorCode || 'Unknown')}
                                </div>
                              )}
                            </Card>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="size-8 mx-auto mb-2 opacity-50" />
                    <p>Select a session to view messages</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="performance" className="mt-4">
                <div className="space-y-4">
                  {/* System Health */}
                  <Card className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="size-4 text-green-500" />
                      <span className="font-medium">System Health</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">Error Rate</div>
                        <div className="font-semibold">
                          {sessionIds.length > 0 
                            ? `${Math.round((errorSessions / sessionIds.length) * 100)}%`
                            : '0%'
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Active Streams</div>
                        <div className="font-semibold">{activeStreams}</div>
                      </div>
                    </div>
                  </Card>

                  {/* Memory Usage */}
                  <Card className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="size-4 text-blue-500" />
                      <span className="font-medium">Memory Usage</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Messages</span>
                        <span className="font-semibold">{totalMessages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg per Session</span>
                        <span className="font-semibold">
                          {sessionIds.length > 0 
                            ? Math.round(totalMessages / sessionIds.length)
                            : 0
                          }
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        sessionIds.forEach(sessionId => clearMessages(sessionId))
                      }}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Trash2 className="size-3 mr-2" />
                      Clear All
                    </Button>
                    <Button
                      onClick={() => window.location.reload()}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <RefreshCw className="size-3 mr-2" />
                      Reload
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}