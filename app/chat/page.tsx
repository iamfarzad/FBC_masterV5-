'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
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
  Archive,
  Video,
  FileCode,
  Languages,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUnifiedChat } from '@/hooks/useUnifiedChat'
import { ChatTools } from '@/components/chat/ChatTools'
import { GeminiLiveStream } from '@/components/chat/GeminiLiveStream'

interface Conversation {
  id: string
  title: string
  date: string
  messages: number
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
  } = useUnifiedChat({ mode: 'multimodal' }) // Always multimodal - best of everything
  
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', title: 'New Conversation', date: 'Today', messages: 0 }
  ])
  
  const [selectedConv, setSelectedConv] = useState('1')
  const [showToolPanel, setShowToolPanel] = useState(false)
  const [showLiveStream, setShowLiveStream] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachedFile(file)
    }
  }

  const tools = [
    { icon: Camera, label: 'Webcam', description: 'Live camera capture with AI vision', color: 'text-blue-500' },
    { icon: Monitor, label: 'Screen Share', description: 'Share & analyze screen content', color: 'text-green-500' },
    { icon: Video, label: 'Live Stream', description: 'Real-time Gemini Live API', color: 'text-purple-500' },
    { icon: FileCode, label: 'Code Analysis', description: 'Analyze & generate code', color: 'text-orange-500' },
    { icon: Languages, label: 'Translation', description: 'Real-time translation', color: 'text-red-500' },
    { icon: FileText, label: 'PDF Generation', description: 'Create PDF documents', color: 'text-cyan-500' },
    { icon: Database, label: 'Data Analysis', description: 'Process & visualize data', color: 'text-indigo-500' },
    { icon: Calculator, label: 'ROI Calculator', description: 'Business calculations', color: 'text-pink-500' }
  ]

  const quickPrompts = [
    "Analyze this image and explain what you see",
    "Help me write production-ready code",
    "Generate a comprehensive business report",
    "Translate this document to multiple languages"
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Conversations */}
      <div className="w-80 border-r bg-surface/50 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">F.B/c Multimodal Chat</h2>
          <Button 
            className="w-full justify-start gap-2"
            onClick={() => {
              clear()
              const newId = Date.now().toString()
              setConversations([
                { id: newId, title: 'New Conversation', date: 'Today', messages: 0 },
                ...conversations
              ])
              setSelectedConv(newId)
            }}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 px-4">
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
              <h1 className="text-base font-semibold">Unified Multimodal Chat</h1>
              <p className="text-xs text-muted-foreground">
                Gemini 2.0 Flash · Vision · Live Stream · All Tools Integrated
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={showLiveStream ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLiveStream(!showLiveStream)}
            >
              <Video className="h-4 w-4 mr-2" />
              {showLiveStream ? 'Hide Live' : 'Go Live'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowToolPanel(!showToolPanel)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Tools
            </Button>
          </div>
        </header>

        {/* Live Stream Panel */}
        {showLiveStream && (
          <div className="border-b bg-muted/30 p-4">
            <GeminiLiveStream />
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2">Unified Multimodal Assistant</h2>
                    <p className="text-sm text-muted-foreground mb-8">
                      Text, Images, Voice, Code, Documents - All in one powerful chat
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
                        
                        {/* Show attached files in message */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.attachments.map((file: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1 text-xs bg-background/20 px-2 py-1 rounded">
                                <FileText className="h-3 w-3" />
                                {file.name}
                              </div>
                            ))}
                          </div>
                        )}
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
                {/* Show attached file */}
                {attachedFile && (
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {attachedFile.name}
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => setAttachedFile(null)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                <div className="bg-background rounded-lg border">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type, paste images, upload files, or use voice..."
                    disabled={isLoading}
                    className="min-h-[60px] max-h-[200px] resize-none border-0 p-3 focus:ring-0"
                    rows={1}
                  />
                  
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    onChange={handleFileSelect}
                    accept="image/*,application/pdf,.txt,.doc,.docx"
                  />
                  
                  <div className="flex items-center justify-between p-2 border-t">
                    <div className="flex gap-1">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => fileInputRef.current?.click()}
                      >
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
                      disabled={isLoading || (!input.trim() && !attachedFile)}
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
            <div className="w-80 border-l bg-surface/50 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold mb-4">Integrated Tools</h3>
                <div className="space-y-2">
                  {tools.map((tool) => (
                    <Card 
                      key={tool.label}
                      className="p-3 cursor-pointer hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <tool.icon className={cn("h-5 w-5 mt-0.5", tool.color)} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{tool.label}</div>
                          <div className="text-xs text-muted-foreground">{tool.description}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="border-t p-4">
                <ChatTools 
                  onToolResult={(result) => {
                    console.log('Tool result:', result)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}