"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Loader2, User, Bot, Send, Brain, MessageSquare,
  Lightbulb, Copy, Check, Clock, AlertCircle, Sparkles,
  TrendingUp, Users, Calendar, Mail, DollarSign, Activity,
  Search, Eye, FileText, Download
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from '@/src/core/utils'

interface AdminChatInterfaceProps {
  className?: string
}

interface Conversation {
  id: string
  name: string | null
  email: string | null
  summary: string | null
  leadScore: number | null
  researchJson: any
  pdfUrl: string | null
  emailStatus: string | null
  createdAt: string | null
}

const QUICK_ACTIONS = [
  {
    title: "Lead Analysis",
    description: "Analyze lead performance",
    icon: Users,
    prompt: "Analyze our recent leads and provide insights on conversion rates and scoring"
  },
  {
    title: "Conversation Insights",
    description: "Get conversation analysis",
    icon: MessageSquare,
    prompt: "Analyze recent conversations and provide insights on lead quality and engagement patterns"
  },
  {
    title: "Performance Review",
    description: "Check system performance",
    icon: TrendingUp,
    prompt: "Review our AI performance metrics and identify areas for improvement"
  },
  {
    title: "Cost Analysis",
    description: "Review AI usage costs",
    icon: DollarSign,
    prompt: "Analyze our AI usage costs and suggest optimization strategies"
  },
  {
    title: "Email Campaign",
    description: "Draft email content",
    icon: Mail,
    prompt: "Draft a professional email campaign for our engaged leads"
  },
  {
    title: "Meeting Strategy",
    description: "Optimize scheduling",
    icon: Calendar,
    prompt: "Analyze our meeting schedule and suggest optimization strategies"
  },
  {
    title: "Activity Summary",
    description: "Get recent overview",
    icon: Activity,
    prompt: "Provide a summary of recent system activities and any alerts"
  }
]

const SUGGESTED_PROMPTS = [
  "What are our top performing leads this month?",
  "Analyze recent conversations and identify patterns",
  "Draft a follow-up email for qualified leads",
  "Review conversation quality and lead scoring trends",
  "Analyze our meeting conversion rates",
  "Suggest cost optimization strategies",
  "Review our AI response accuracy",
  "What insights can you provide about user engagement?",
  "Generate conversation insights for a specific lead",
  "Analyze PDF generation success rates"
]

export function AdminChatInterface({ className }: AdminChatInterfaceProps) {
  const { toast } = useToast()
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Conversation context state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [conversationContext, setConversationContext] = useState<string>("")
  const [showConversationSelector, setShowConversationSelector] = useState(false)

    const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [adminId] = useState<string>('admin') // In production, get from auth context

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      const sessionId = `admin-session-${Date.now()}`
      setCurrentSessionId(sessionId)

      try {
        await fetch('/api/admin/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            adminId,
            sessionName: `Admin Session ${new Date().toLocaleDateString()}`
          })
        })
      } catch (error) {
        console.error('Failed to initialize session:', error)
      }
    }

    initializeSession()
  }, [adminId])

  // Load conversations from API
  const loadConversations = async () => {
    try {
      const response = await fetch('/api/admin/conversations?period=last_30_days')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  // Build conversation context for AI
  const buildConversationContext = (conversation: Conversation): string => {
    const research = conversation.researchJson
    const company = research?.company || {}
    const person = research?.person || {}
    const intelligence = research?.intelligence || {}

    return `
CONVERSATION CONTEXT:
Lead: ${conversation.name || 'Unknown'} (${conversation.email})
Lead Score: ${conversation.leadScore}/100
Summary: ${conversation.summary || 'No summary available'}

COMPANY RESEARCH:
- Name: ${company.name || 'Unknown'}
- Industry: ${company.industry || 'Unknown'}
- Website: ${company.website || 'Unknown'}
- Size: ${company.size || 'Unknown'}
- Summary: ${company.summary || 'No company summary'}

PERSON RESEARCH:
- Name: ${person.fullName || 'Unknown'}
- Role: ${person.role || 'Unknown'}
- Seniority: ${person.seniority || 'Unknown'}
- LinkedIn: ${person.profileUrl || 'Unknown'}

INTELLIGENCE:
- Confidence: ${intelligence.confidence || 0}%
- Keywords: ${intelligence.keywords?.join(', ') || 'None'}
- HQ: ${intelligence.hq || 'Unknown'}

DELIVERY STATUS:
- PDF Generated: ${conversation.pdfUrl ? 'Yes' : 'No'}
- Email Status: ${conversation.emailStatus || 'Pending'}
- Email Retries: ${conversation.emailRetries || 0}
    `.trim()
  }

  // Handle conversation selection
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setConversationContext(buildConversationContext(conversation))
    setShowConversationSelector(false)
    toast({
      title: "Conversation Loaded",
      description: `Context loaded for ${conversation.name || conversation.email}`,
    })
  }

  // Enhanced send message with conversation context using persistent storage
  const sendMessageWithContext = async (message: string) => {
    if (!currentSessionId) {
      setError('No active session. Please refresh and try again.')
      return
    }

    setIsLoading(true)
    setError(null)

    // Add user message to local state immediately for better UX
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const conversationIds = selectedConversation ? [selectedConversation.id] : []

      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: currentSessionId,
          conversationIds,
          adminId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()

      // Add AI response to local state
      const assistantMessage = {
        role: 'assistant' as const,
        content: data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])

      // Show success toast
      toast({
        title: "AI Analysis Complete",
        description: `Response generated${data.leadsReferenced > 0 ? ` with ${data.leadsReferenced} lead(s) referenced` : ''}`,
      })

    } catch (error: any) {
      console.error('Failed to send message:', error)
      setError(error.message || 'Failed to send message')

      // Add error message to chat
      const errorMessage = {
        role: 'assistant' as const,
        content: `I apologize, but I encountered an error: ${error.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])

      toast({
        title: "Message Error",
        description: error.message || 'Failed to send message',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Clear messages from current session
  const clearMessages = async () => {
    setMessages([])
    setError(null)
    toast({
      title: "Chat Cleared",
      description: "Conversation history cleared from this session",
    })
  }

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      await sendMessageWithContext(input.trim())
      setInput('')
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Check if scrollIntoView is available (not in test environment)
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleQuickAction = async (prompt: string) => {
    setInput(prompt)
    await sendMessageWithContext(prompt)
  }

  const handleSuggestedPrompt = async (prompt: string) => {
    setInput(prompt)
    await sendMessageWithContext(prompt)
  }

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      toast({
        title: "Copied to clipboard",
        description: "Message content copied successfully",
      })
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy message to clipboard",
        variant: "destructive"
      })
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp)
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-hover rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-surface" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Business Assistant</h3>
            <p className="text-sm text-muted-foreground">Powered by real-time dashboard data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
            Connected
          </Badge>

          {/* Conversation Context Selector */}
          <Dialog open={showConversationSelector} onOpenChange={setShowConversationSelector}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1"
              >
                <MessageSquare className="w-3 h-3" />
                {selectedConversation ? 'Change Context' : 'Load Conversation'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[70vh]">
              <DialogHeader>
                <DialogTitle>Select Conversation Context</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No conversations found. Try refreshing or check if conversations are being saved.
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const researchData = conversation.researchJson
                    const company = researchData?.company || {}
                    const person = researchData?.person || {}

                    return (
                      <Card
                        key={conversation.id}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-muted/50",
                          selectedConversation?.id === conversation.id && "ring-2 ring-primary"
                        )}
                        onClick={() => handleConversationSelect(conversation)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">
                                  {conversation.name || conversation.email || 'Unknown Lead'}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {conversation.leadScore || 0}/100
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {company.name || 'Unknown Company'} • {person.role || 'Unknown Role'}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {conversation.summary || 'No summary available'}
                              </p>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <div className="flex items-center gap-1 mb-1">
                                {conversation.pdfUrl ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Clock className="w-3 h-3 text-yellow-500" />
                                )}
                                PDF
                              </div>
                              <div className="flex items-center gap-1">
                                {conversation.emailStatus === 'sent' ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : conversation.emailStatus === 'failed' ? (
                                  <AlertCircle className="w-3 h-3 text-red-500" />
                                ) : (
                                  <Clock className="w-3 h-3 text-yellow-500" />
                                )}
                                Email
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </DialogContent>
          </Dialog>

          {selectedConversation && (
            <Badge variant="outline" className="text-xs bg-info/10 text-info border-info/20">
              {selectedConversation.name || selectedConversation.email}
            </Badge>
          )}

          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearMessages}
              className="text-xs"
            >
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      {/* Conversation Context Display */}
      {selectedConversation && conversationContext && (
        <div className="px-4 py-2 bg-info/5 border-b border-info/20">
          <div className="flex items-center gap-2 text-sm text-info">
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">Conversation Context Active:</span>
            <span>{selectedConversation.name || selectedConversation.email}</span>
            <Badge variant="outline" className="text-xs">
              {selectedConversation.leadScore}/100
            </Badge>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-4 border-b border-border">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {QUICK_ACTIONS.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto p-2 text-xs justify-start"
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isLoading}
                  >
                    <Icon className="w-3 h-3 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Suggested Questions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-auto p-2 text-xs justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => handleSuggestedPrompt(prompt)}
                  disabled={isLoading}
                >
                  <MessageSquare className="w-3 h-3 mr-2" />
                  <span className="truncate">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to analyze your data</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Ask me anything about your leads, meetings, emails, costs, analytics, or system performance. 
                  I have access to all your dashboard data in real-time.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-brand to-brand-hover text-surface">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "flex-1 max-w-[85%] space-y-1",
                    message.role === "user" ? "order-2" : "order-1"
                  )}
                >
                  <Card className={cn(
                    "border-0 shadow-sm",
                    message.role === "user"
                      ? "bg-brand text-surface"
                      : "bg-card"
                  )}>
                    <CardContent className="p-3">
                      <div className={cn(
                        "whitespace-pre-wrap text-sm",
                        message.role === "user" ? "text-surface" : "text-foreground"
                      )}>
                        {message.content}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(message.timestamp)}</span>
                    {message.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-1"
                        onClick={() => copyMessage(message.content, message.id)}
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {message.role === "user" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-brand to-brand-hover text-surface">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 max-w-[85%] space-y-1">
                  <Card className="border-0 shadow-sm bg-card">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-info" />
                        <div>
                          <div className="text-sm font-medium text-foreground">Analyzing your data...</div>
                          <div className="text-xs text-muted-foreground">Gathering insights from dashboard</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {error && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-error/10 text-error">
                    <AlertCircle className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 max-w-[85%] space-y-1">
                  <Card className="border-0 shadow-sm bg-error/5 border border-error/20">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-error" />
                        <div>
                          <div className="text-sm font-medium text-error">Analysis Error</div>
                          <div className="text-xs text-error">{error.message}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your business data, draft emails, analyze leads..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
