'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Send, 
  Loader2,
  AlertCircle,
  Plus,
  Settings,
  Menu,
  X,
  User,
  Bot,
  Paperclip,
  Mic,
  Image,
  FileText,
  Code,
  ChevronRight,
  Copy,
  Download,
  RefreshCw,
  Star,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUnifiedChat } from '@/hooks/useUnifiedChat'

export default function ChatPage() {
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    error,
    clear
  } = useUnifiedChat({ mode: 'standard' })
  
  const [showSidebar, setShowSidebar] = useState(true)
  const [conversations, setConversations] = useState([
    { id: '1', title: 'Chat Interface', date: 'Today' },
    { id: '2', title: 'Learning Modules', date: 'Yesterday' },
    { id: '3', title: 'Admin Dashboard', date: '2 days ago' },
    { id: '4', title: 'Settings Page', date: '3 days ago' },
    { id: '5', title: 'Tools Page', date: '3 days ago' }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "w-64 border-r bg-surface flex flex-col transition-all duration-300",
        !showSidebar && "-ml-64"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => clear()}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground mb-2">Recent</div>
            {conversations.map((conv) => (
              <Button
                key={conv.id}
                variant="ghost"
                className="w-full justify-start text-left"
              >
                <div className="flex-1 truncate">
                  <div className="text-sm">{conv.title}</div>
                  <div className="text-xs text-muted-foreground">{conv.date}</div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <header className="border-b px-6 py-4 flex items-center justify-between bg-surface">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">F.B/c Chat</h1>
              <p className="text-xs text-muted-foreground">
                AI-powered assistant with advanced capabilities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Standard Mode</Badge>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">Start a New Conversation</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Ask me anything or explore the features below
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  <Card className="p-3 cursor-pointer hover:bg-accent">
                    <CardContent className="p-0">
                      <div className="text-sm font-medium">Explain a concept</div>
                      <div className="text-xs text-muted-foreground">
                        Break down complex topics
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="p-3 cursor-pointer hover:bg-accent">
                    <CardContent className="p-0">
                      <div className="text-sm font-medium">Write code</div>
                      <div className="text-xs text-muted-foreground">
                        Generate and debug code
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="p-3 cursor-pointer hover:bg-accent">
                    <CardContent className="p-0">
                      <div className="text-sm font-medium">Analyze data</div>
                      <div className="text-xs text-muted-foreground">
                        Process and visualize data
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="p-3 cursor-pointer hover:bg-accent">
                    <CardContent className="p-0">
                      <div className="text-sm font-medium">Creative writing</div>
                      <div className="text-xs text-muted-foreground">
                        Stories, scripts, and more
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-4 group',
                  message.role === 'user' && 'justify-end'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                
                <div className={cn(
                  'flex-1 space-y-2',
                  message.role === 'user' && 'max-w-[80%]'
                )}>
                  <div className={cn(
                    'rounded-lg px-4 py-3',
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  )}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                  
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Star className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 bg-surface">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="flex items-end gap-2 bg-background rounded-lg border p-2">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 min-h-[40px] max-h-[200px] resize-none border-0 p-2 focus:ring-0"
                  rows={1}
                />
                
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="h-8 w-8"
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground px-2">
              <div className="flex gap-4">
                <button type="button" className="hover:text-foreground transition-colors">
                  <Image className="h-4 w-4 inline mr-1" />
                  Image
                </button>
                <button type="button" className="hover:text-foreground transition-colors">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Document
                </button>
                <button type="button" className="hover:text-foreground transition-colors">
                  <Code className="h-4 w-4 inline mr-1" />
                  Code
                </button>
              </div>
              <span>F.B/c platform is properly organized with no mixed imports</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}