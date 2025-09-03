'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Send, 
  Camera, 
  Monitor, 
  Calculator, 
  Mic, 
  FileText,
  Image,
  Video,
  Brain,
  Zap,
  Settings,
  Plus,
  X,
  ChevronDown,
  Sparkles,
  Code,
  Globe,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  tools?: string[]
  streaming?: boolean
}

interface Tool {
  id: string
  name: string
  icon: any
  description: string
  color: string
  action: () => void
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to AI Studio Pro! I\'m your advanced AI assistant with multimodal capabilities. I can help you with:\n\n• 🎥 Video and image analysis\n• 🎙️ Voice processing and transcription\n• 📊 Data analysis and visualization\n• 🧮 Complex calculations and ROI analysis\n• 🌐 Web scraping and research\n• 💻 Code generation and debugging\n\nHow can I assist you today?',
      timestamp: new Date(),
      tools: ['video', 'voice', 'calculator', 'code']
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-4-vision')
  const [showTools, setShowTools] = useState(true)
  const [streamingText, setStreamingText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const models = [
    { id: 'gpt-4-vision', name: 'GPT-4 Vision', badge: 'Multimodal' },
    { id: 'claude-3', name: 'Claude 3 Opus', badge: 'Advanced' },
    { id: 'gemini-ultra', name: 'Gemini Ultra', badge: 'Latest' },
    { id: 'llama-3', name: 'Llama 3 70B', badge: 'Open Source' }
  ]

  const tools: Tool[] = [
    {
      id: 'camera',
      name: 'Camera',
      icon: Camera,
      description: 'Capture and analyze images',
      color: 'from-blue-500 to-cyan-500',
      action: () => handleToolAction('camera')
    },
    {
      id: 'screen',
      name: 'Screen Share',
      icon: Monitor,
      description: 'Share and analyze screen',
      color: 'from-purple-500 to-pink-500',
      action: () => handleToolAction('screen')
    },
    {
      id: 'voice',
      name: 'Voice',
      icon: Mic,
      description: 'Voice input and analysis',
      color: 'from-red-500 to-orange-500',
      action: () => handleToolAction('voice')
    },
    {
      id: 'calculator',
      name: 'Calculator',
      icon: Calculator,
      description: 'Advanced calculations',
      color: 'from-green-500 to-emerald-500',
      action: () => handleToolAction('calculator')
    },
    {
      id: 'code',
      name: 'Code',
      icon: Code,
      description: 'Code generation and analysis',
      color: 'from-indigo-500 to-blue-500',
      action: () => handleToolAction('code')
    },
    {
      id: 'web',
      name: 'Web Search',
      icon: Globe,
      description: 'Search and scrape web',
      color: 'from-yellow-500 to-amber-500',
      action: () => handleToolAction('web')
    },
    {
      id: 'document',
      name: 'Document',
      icon: FileText,
      description: 'Process documents',
      color: 'from-gray-500 to-slate-500',
      action: () => handleToolAction('document')
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      description: 'Data visualization',
      color: 'from-teal-500 to-cyan-500',
      action: () => handleToolAction('analytics')
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleToolAction = (toolName: string) => {
    toast.success(`${toolName} tool activated!`)
    const toolMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: `🔧 ${toolName.charAt(0).toUpperCase() + toolName.slice(1)} tool is ready to use`,
      timestamp: new Date(),
      tools: [toolName]
    }
    setMessages(prev => [...prev, toolMessage])
  }

  const simulateStreaming = async (text: string) => {
    const words = text.split(' ')
    let currentText = ''
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i]
      setStreamingText(currentText)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    return currentText
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setStreamingText('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          model: selectedModel 
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Create streaming message
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          streaming: true
        }
        
        setMessages(prev => [...prev, assistantMessage])
        
        // Simulate streaming
        const finalText = await simulateStreaming(data.message || 'I can help you with that! This platform includes advanced AI capabilities for processing text, images, video, and more. Try using one of the tools above for specific tasks.')
        
        // Update message with final content
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: finalText, streaming: false }
            : msg
        ))
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
      setStreamingText('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Model Selection */}
            <Card className="glass-dark border-gray-800 p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                AI Model
              </h3>
              <div className="space-y-2">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={cn(
                      'w-full text-left p-2 rounded-lg transition-all',
                      selectedModel === model.id
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500'
                        : 'hover:bg-gray-800'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{model.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {model.badge}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-dark border-gray-800 p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setInput('Analyze the latest AI trends')}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Trends Analysis
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setInput('Generate a business plan')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Business Plan
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setInput('Create a marketing strategy')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Marketing Strategy
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="glass-dark border-gray-800 h-[calc(100vh-12rem)]">
              {/* Chat Header */}
              <div className="border-b border-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-semibold">AI Assistant</span>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                      {selectedModel}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowTools(!showTools)}
                  >
                    <ChevronDown className={cn(
                      'w-4 h-4 transition-transform',
                      showTools && 'rotate-180'
                    )} />
                  </Button>
                </div>
              </div>

              {/* Tools Grid */}
              <AnimatePresence>
                {showTools && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-gray-800 p-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {tools.map((tool) => (
                        <motion.button
                          key={tool.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={tool.action}
                          className="group relative"
                        >
                          <div className={cn(
                            'p-3 rounded-xl bg-gradient-to-br opacity-90 hover:opacity-100 transition-all',
                            tool.color
                          )}>
                            <tool.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {tool.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 180px)' }}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-3',
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : message.role === 'system'
                          ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-200'
                          : 'glass-dark border border-gray-800'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.streaming ? streamingText : message.content}
                        {message.streaming && <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />}
                      </p>
                      {message.tools && message.tools.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {message.tools.map((tool) => (
                            <Badge key={tool} variant="outline" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <span className="text-xs opacity-70 mt-2 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {isLoading && !streamingText && (
                  <div className="flex justify-start">
                    <div className="glass-dark border border-gray-800 rounded-2xl px-4 py-3">
                      <div className="loading-dots flex gap-1">
                        <span className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span className="w-2 h-2 bg-purple-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-800 p-4">
                <div className="flex gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask anything... (Press Enter to send, Shift+Enter for new line)"
                    disabled={isLoading}
                    className="flex-1 min-h-[50px] max-h-[150px] resize-none bg-gray-800/50 border-gray-700"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}