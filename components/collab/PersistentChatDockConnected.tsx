"use client"

import { useEffect, useMemo, useState } from "react"
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { Response } from "@/components/ai-elements/response"
import { Sources, SourcesTrigger, SourcesContent, Source } from "@/components/ai-elements/source"
import { PromptInput, PromptInputToolbar, PromptInputTools, PromptInputTextarea, PromptInputSubmit } from "@/components/ai-elements/prompt-input"
import { useChat } from "@/ui/hooks/useChat"
import { useToolActions } from "@/hooks/use-tool-actions"
import { useMediaTools } from "@/hooks/use-media-tools"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Video, Monitor, Camera, Search, Calculator, Globe, FileText } from "@/lib/icon-mapping"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type FeatureType = "home" | "chat" | "webcam" | "screenshare" | "workshop" | "pdf" | "learning" | "search" | "calculator" | "url"

interface PersistentChatDockConnectedProps {
  currentFeature: string
  onOpenFeature?: (feature: FeatureType) => void
  sessionId?: string
  userId?: string
}

export function PersistentChatDockConnected({ 
  currentFeature, 
  onOpenFeature, 
  sessionId,
  userId 
}: PersistentChatDockConnectedProps) {
  const { messages, input, setInput, isLoading, handleSubmit, handleInputChange, clearMessages } = useChat({})
  const { search, calculate, analyzeURL, isToolLoading } = useToolActions()
  const { 
    startWebcam, 
    stopWebcam, 
    captureWebcamImage, 
    captureScreen, 
    isCapturing, 
    videoRef, 
    canvasRef,
    isAnalyzing 
  } = useMediaTools({ sessionId, userId, autoAnalyze: true })

  // Tool dialog states
  const [searchDialog, setSearchDialog] = useState(false)
  const [calcDialog, setCalcDialog] = useState(false)
  const [urlDialog, setUrlDialog] = useState(false)
  const [webcamDialog, setWebcamDialog] = useState(false)
  
  // Tool input states
  const [searchQuery, setSearchQuery] = useState('')
  const [calcValues, setCalcValues] = useState('')
  const [urlToAnalyze, setUrlToAnalyze] = useState('')

  const uiMessages = useMemo(() => messages.map(m => ({
    id: m.id,
    role: m.role,
    text: m.content,
    sources: m.sources,
    citations: m.citations,
  })), [messages])

  // Tool action handlers
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    const result = await search(searchQuery, { sessionId, userId })
    if (result.ok) {
      // Add search result to chat
      const searchMessage = `Search results for "${searchQuery}":\n\n${result.output?.answer || 'No results found'}`
      // You can integrate this with your chat system
      console.log('Search result:', result.output)
    }
    setSearchQuery('')
    setSearchDialog(false)
  }

  const handleCalculate = async () => {
    const values = calcValues.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
    if (values.length === 0) return
    
    const result = await calculate(values, { sessionId, userId })
    if (result.ok) {
      const calcMessage = `Calculation result: ${JSON.stringify(result.output)}`
      console.log('Calculation result:', result.output)
    }
    setCalcValues('')
    setCalcDialog(false)
  }

  const handleURLAnalysis = async () => {
    if (!urlToAnalyze.trim()) return
    
    const result = await analyzeURL(urlToAnalyze, { sessionId, userId })
    if (result.ok) {
      console.log('URL analysis result:', result.output)
    }
    setUrlToAnalyze('')
    setUrlDialog(false)
  }

  const handleWebcamCapture = async () => {
    try {
      const result = await captureWebcamImage()
      if (result.analysis) {
        console.log('Webcam analysis:', result.analysis)
      }
    } catch (error) {
      console.error('Webcam capture failed:', error)
    }
  }

  const handleScreenCapture = async () => {
    try {
      const result = await captureScreen()
      if (result.analysis) {
        console.log('Screen analysis:', result.analysis)
      }
    } catch (error) {
      console.error('Screen capture failed:', error)
    }
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        <Conversation className="relative h-full">
          <ConversationContent className="mx-auto w-full max-w-3xl space-y-2 p-4 pb-24">
            {uiMessages.map(m => (
              <Message key={m.id} from={m.role as any}>
                <MessageContent>
                  {!!m.text && <Response>{m.text}</Response>}
                  {!!m.sources?.length && (
                    <div className="mt-2">
                      <Sources>
                        <SourcesTrigger count={m.sources.length} />
                        <SourcesContent>
                          {m.sources.map((s, i) => (
                            <Source key={`${m.id}-src-${i}`} href={s.url} title={s.title || s.url} />
                          ))}
                        </SourcesContent>
                      </Sources>
                    </div>
                  )}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton className="bg-background/80 backdrop-blur z-50" />
        </Conversation>

        <div className="sticky bottom-0 z-10 mx-auto w-full max-w-3xl bg-gradient-to-t from-background via-background/90 to-transparent px-4 pb-4 pt-2">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputToolbar>
              <PromptInputTools>
                {/* Search Tool */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      aria-label="Search" 
                      className="text-muted-foreground hover:text-foreground disabled:opacity-50" 
                      onClick={() => setSearchDialog(true)}
                      disabled={isToolLoading('search')}
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Search</TooltipContent>
                </Tooltip>

                {/* Calculator Tool */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      aria-label="Calculator" 
                      className="text-muted-foreground hover:text-foreground disabled:opacity-50" 
                      onClick={() => setCalcDialog(true)}
                      disabled={isToolLoading('calc')}
                    >
                      <Calculator className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Calculator</TooltipContent>
                </Tooltip>

                {/* URL Analysis Tool */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      aria-label="Analyze URL" 
                      className="text-muted-foreground hover:text-foreground disabled:opacity-50" 
                      onClick={() => setUrlDialog(true)}
                      disabled={isToolLoading('url')}
                    >
                      <Globe className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Analyze URL</TooltipContent>
                </Tooltip>

                {/* Webcam Tool */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      aria-label="Webcam" 
                      className="text-muted-foreground hover:text-foreground disabled:opacity-50" 
                      onClick={() => setWebcamDialog(true)}
                      disabled={isAnalyzing}
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Webcam</TooltipContent>
                </Tooltip>

                {/* Screen Share Tool */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      aria-label="Screen Capture" 
                      className="text-muted-foreground hover:text-foreground disabled:opacity-50" 
                      onClick={handleScreenCapture}
                      disabled={isAnalyzing}
                    >
                      <Monitor className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Screen Capture</TooltipContent>
                </Tooltip>

                {/* Learning Tool */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      aria-label="Learning" 
                      className="text-muted-foreground hover:text-foreground" 
                      onClick={() => onOpenFeature?.('learning')}
                    >
                      <Video className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Learning</TooltipContent>
                </Tooltip>

                <button 
                  className="ml-2 text-xs underline text-muted-foreground" 
                  type="button" 
                  onClick={() => clearMessages()}
                >
                  Reset
                </button>
              </PromptInputTools>
            </PromptInputToolbar>
            <PromptInputTextarea
              placeholder="Message F.B/c…"
              className="min-h-[56px] md:min-h-[64px]"
              value={input}
              onChange={handleInputChange as any}
            />
            <div className="flex items-center justify-end p-1">
              <PromptInputSubmit status={isLoading ? 'submitted' : undefined} className="rounded-full" />
            </div>
          </PromptInput>
        </div>

        {/* Search Dialog */}
        <Dialog open={searchDialog} onOpenChange={setSearchDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Search</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter search query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSearchDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSearch} disabled={!searchQuery.trim() || isToolLoading('search')}>
                  {isToolLoading('search') ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Calculator Dialog */}
        <Dialog open={calcDialog} onOpenChange={setCalcDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Calculator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter numbers separated by commas (e.g., 1, 2, 3, 4)"
                value={calcValues}
                onChange={(e) => setCalcValues(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCalcDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCalculate} disabled={!calcValues.trim() || isToolLoading('calc')}>
                  {isToolLoading('calc') ? 'Calculating...' : 'Calculate'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* URL Analysis Dialog */}
        <Dialog open={urlDialog} onOpenChange={setUrlDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Analyze URL</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter URL to analyze..."
                value={urlToAnalyze}
                onChange={(e) => setUrlToAnalyze(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleURLAnalysis()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setUrlDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleURLAnalysis} disabled={!urlToAnalyze.trim() || isToolLoading('url')}>
                  {isToolLoading('url') ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Webcam Dialog */}
        <Dialog open={webcamDialog} onOpenChange={setWebcamDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Webcam Capture</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full max-w-md mx-auto rounded-lg"
                  autoPlay
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex justify-center gap-2">
                {!isCapturing ? (
                  <Button onClick={startWebcam}>Start Webcam</Button>
                ) : (
                  <>
                    <Button onClick={handleWebcamCapture} disabled={isAnalyzing}>
                      {isAnalyzing ? 'Analyzing...' : 'Capture & Analyze'}
                    </Button>
                    <Button variant="outline" onClick={stopWebcam}>
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default PersistentChatDockConnected