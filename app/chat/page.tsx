'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Send, 
  Loader2,
  Plus,
  Settings,
  Bot,
  User,
  Paperclip,
  Mic,
  Image,
  FileText,
  Code,
  Copy,
  RefreshCw,
  Camera,
  Monitor,
  Calculator,
  Search,
  Brain,
  Sparkles,
  Database,
  Globe,
  Zap,
  Shield,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  Archive
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUnifiedChat } from '@/hooks/useUnifiedChat'

interface Conversation {
  id: string
  title: string
  date: string
  messages: number
  mode: string
}

export default function ChatPage() {
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    error,
    clear,
    setInput
  } = useUnifiedChat({ mode: 'standard' })
  
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', title: 'Chat Interface', date: 'Today', messages: 3, mode: 'standard' },
    { id: '2', title: 'Learning Modules', date: 'Yesterday', messages: 12, mode: 'standard' },
    { id: '3', title: 'Admin Dashboard', date: '2 days ago', messages: 7, mode: 'admin' },
    { id: '4', title: 'Settings Page', date: '3 days ago', messages: 5, mode: 'standard' },
    { id: '5', title: 'Tools Page', date: '3 days ago', messages: 15, mode: 'multimodal' }
  ])
  
  const [selectedConv, setSelectedConv] = useState('1')
  const [showToolPanel, setShowToolPanel] = useState(false)
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

  const tools = [
    { icon: Camera, label: 'Webcam', description: 'Capture from camera', color: 'text-blue-500' },
    { icon: Monitor, label: 'Screen Share', description: 'Share your screen', color: 'text-green-500' },
    { icon: Calculator, label: 'ROI Calculator', description: 'Calculate returns', color: 'text-purple-500' },
    { icon: FileText, label: 'Document', description: 'Analyze documents', color: 'text-orange-500' },
    { icon: Mic, label: 'Voice', description: 'Voice input', color: 'text-red-500' },
    { icon: Search, label: 'Web Search', description: 'Search the web', color: 'text-cyan-500' },
    { icon: Database, label: 'Data Analysis', description: 'Analyze data', color: 'text-indigo-500' },
    { icon: Brain, label: 'AI Models', description: 'Switch models', color: 'text-pink-500' }
  ]

  const quickPrompts = [
    "Explain quantum computing",
    "Write Python code for data analysis",
    "Create a business plan template",
    "Analyze market trends"
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Conversations */}
      <div className="w-80 border-r bg-surface/50 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">F.B/c Chat</h2>
          <Button 
            className="w-full justify-start gap-2"
            onClick={() => clear()}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Conversations Tabs */}
        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="standard">Standard</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="multimodal">Multimodal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4">
              <div className="space-y-2 py-2">
                {conversations.map((conv) => (
                  <Card 
                    key={conv.id}
                    className={cn(
                      "p-3 cursor-pointer hover:bg-accent transition-colors",
                      selectedConv === conv.id && "bg-accent"
                    )}
                    onClick={() => setSelectedConv(conv.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{conv.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {conv.date} · {conv.messages} messages
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 hover:opacity-100">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Sidebar Footer */}
        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <header className="border-b px-6 py-3 flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-base font-semibold">Chat Interface</h1>
              <p className="text-xs text-muted-foreground">
                Standard mode · No mixed imports from different AI libraries
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowToolPanel(!showToolPanel)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Tools
            </Button>
            <Button variant="ghost" size="icon">
              <Shield className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Bot className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2">How can I help you today?</h2>
                    <p className="text-sm text-muted-foreground mb-8">
                      I'm your AI assistant with advanced capabilities
                    </p>
                    
                    {/* Quick Prompts */}
                    <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                      {quickPrompts.map((prompt) => (
                        <Card 
                          key={prompt}
                          className="p-3 cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => {
                            setInput(prompt)
                            textareaRef.current?.focus()
                          }}
                        >
                          <p className="text-sm text-left">{prompt}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3 group',
                      message.role === 'user' && 'flex-row-reverse'
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      message.role === 'user' ? "bg-primary" : "bg-primary/10"
                    )}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    
                    <div className={cn(
                      'flex-1 space-y-2',
                      message.role === 'user' && 'flex flex-col items-end'
                    )}>
                      <div className={cn(
                        'rounded-lg px-4 py-3 max-w-[85%]',
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
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
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4 bg-surface/50">
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                <div className="bg-background rounded-lg border">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="min-h-[60px] max-h-[200px] resize-none border-0 p-3 focus:ring-0"
                    rows={1}
                  />
                  
                  <div className="flex items-center justify-between p-2 border-t">
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                        <Code className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={isLoading || !input.trim()}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Tools Panel */}
          {showToolPanel && (
            <div className="w-80 border-l bg-surface/50 p-4">
              <h3 className="font-semibold mb-4">Tools & Features</h3>
              <div className="grid gap-3">
                {tools.map((tool) => (
                  <Card 
                    key={tool.label}
                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-0.5", tool.color)}>
                        <tool.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{tool.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {tool.description}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}