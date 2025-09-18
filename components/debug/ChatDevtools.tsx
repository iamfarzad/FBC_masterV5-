/**
 * AI SDK Tools - Chat Debugging Component
 * Real-time debugging interface for chat state and performance
 */

'use client'

import React, { useState } from 'react'
import { useChatStore } from '@/hooks/useUnifiedChatStore'
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
  
  const activeSessions = Array.from(sessions.values()).filter(
    session => session.isLoading || session.isStreaming
  ).length

  const errorSessions = Array.from(sessions.values()).filter(
    session => session.error
  ).length

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "fixed bottom-4 right-4 z-50",
          position === 'relative' && "relative bottom-0 right-0",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <Bug className="h-4 w-4 mr-2" />
        Chat DevTools
        {errorSessions > 0 && (
          <Badge variant="destructive" className="ml-2">
            {errorSessions}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <Card className={cn(
      "w-96 max-h-96",
      position === 'fixed' && "fixed bottom-4 right-4 z-50",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Chat DevTools
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {sessionIds.length} sessions
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions" className="text-xs">Sessions</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sessions" className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Active Sessions</span>
                <Badge variant="outline">{activeSessions}</Badge>
              </div>
              
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {sessionIds.map(sessionId => {
                    const session = sessions.get(sessionId)
                    if (!session) return null
                    
                    return (
                      <div
                        key={sessionId}
                        className={cn(
                          "p-2 rounded border cursor-pointer transition-colors",
                          selectedSession === sessionId 
                            ? "bg-brand/10 border-brand" 
                            : "hover:bg-muted"
                        )}
                        onClick={() => setSelectedSession(sessionId)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono truncate">
                            {sessionId.slice(0, 8)}...
                          </span>
                          <div className="flex items-center gap-1">
                            {session.isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                            {session.isStreaming && <Activity className="h-3 w-3 text-brand" />}
                            {session.error && <AlertTriangle className="h-3 w-3 text-destructive" />}
                            {!session.isLoading && !session.isStreaming && !session.error && (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.messages.length} messages
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 border rounded">
                <div className="text-lg font-semibold">{totalMessages}</div>
                <div className="text-xs text-muted-foreground">Total Messages</div>
              </div>
              <div className="text-center p-2 border rounded">
                <div className="text-lg font-semibold">{activeSessions}</div>
                <div className="text-xs text-muted-foreground">Active Sessions</div>
              </div>
              <div className="text-center p-2 border rounded">
                <div className="text-lg font-semibold">{errorSessions}</div>
                <div className="text-xs text-muted-foreground">Error Sessions</div>
              </div>
              <div className="text-center p-2 border rounded">
                <div className="text-lg font-semibold">{sessionIds.length}</div>
                <div className="text-xs text-muted-foreground">Total Sessions</div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="messages" className="p-4 space-y-3">
            {selectedSessionData ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Messages</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearMessages(selectedSession!)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {selectedSessionData.messages.map((message, index) => (
                      <div
                        key={message.id}
                        className="p-2 border rounded text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {message.role}
                          </Badge>
                          <span className="text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="truncate">
                          {message.content.slice(0, 100)}
                          {message.content.length > 100 && '...'}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-xs py-8">
                Select a session to view messages
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
