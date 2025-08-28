"use client"

import React, { useMemo, useRef, useCallback, useState } from "react"
import { cn } from '@/src/core/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToolActions } from "@/hooks/use-tool-actions"
import { useMediaTools } from "@/hooks/use-media-tools"
import { 
  MessageCircle, 
  Search, 
  Calculator, 
  Camera, 
  Monitor, 
  Globe, 
  FileText, 
  Code, 
  Mic,
  Languages,
  TrendingUp
} from "lucide-react"

export interface ConnectedToolItem {
  id: string
  icon: React.ReactNode
  label: string
  active?: boolean
  disabled?: boolean
  action: 'chat' | 'search' | 'calc' | 'webcam' | 'screen' | 'url' | 'doc' | 'code' | 'voice' | 'translate' | 'roi'
}

interface LeftToolRailConnectedProps {
  className?: string
  ariaLabel?: string
  sessionId?: string
  userId?: string
  currentTool?: string
  onToolChange?: (toolId: string) => void
  onToolResult?: (toolId: string, result: any) => void
}

export function LeftToolRailConnected({ 
  className, 
  ariaLabel = "Primary tools",
  sessionId,
  userId,
  currentTool = 'chat',
  onToolChange,
  onToolResult
}: LeftToolRailConnectedProps) {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([])
  const [isExecuting, setIsExecuting] = useState<string | null>(null)
  
  const { 
    search, 
    calculate, 
    analyzeURL, 
    analyzeCode, 
    analyzeDocument,
    translate,
    calculateROI,
    transcribeVoice,
    isToolLoading 
  } = useToolActions()
  
  const { 
    captureScreen, 
    startWebcam, 
    captureWebcamImage,
    isAnalyzing 
  } = useMediaTools({ sessionId, userId, autoAnalyze: false })

  // Define available tools
  const toolItems: ConnectedToolItem[] = useMemo(() => [
    {
      id: 'chat',
      icon: <MessageCircle className="h-5 w-5" />,
      label: 'Chat',
      action: 'chat',
      active: currentTool === 'chat'
    },
    {
      id: 'search',
      icon: <Search className="h-5 w-5" />,
      label: 'Search',
      action: 'search',
      active: currentTool === 'search',
      disabled: isToolLoading('search')
    },
    {
      id: 'calc',
      icon: <Calculator className="h-5 w-5" />,
      label: 'Calculator',
      action: 'calc',
      active: currentTool === 'calc',
      disabled: isToolLoading('calc')
    },
    {
      id: 'webcam',
      icon: <Camera className="h-5 w-5" />,
      label: 'Webcam',
      action: 'webcam',
      active: currentTool === 'webcam',
      disabled: isAnalyzing || isToolLoading('webcam')
    },
    {
      id: 'screen',
      icon: <Monitor className="h-5 w-5" />,
      label: 'Screen Capture',
      action: 'screen',
      active: currentTool === 'screen',
      disabled: isAnalyzing || isToolLoading('screen')
    },
    {
      id: 'url',
      icon: <Globe className="h-5 w-5" />,
      label: 'URL Analysis',
      action: 'url',
      active: currentTool === 'url',
      disabled: isToolLoading('url')
    },
    {
      id: 'doc',
      icon: <FileText className="h-5 w-5" />,
      label: 'Document',
      action: 'doc',
      active: currentTool === 'doc',
      disabled: isToolLoading('doc')
    },
    {
      id: 'code',
      icon: <Code className="h-5 w-5" />,
      label: 'Code Analysis',
      action: 'code',
      active: currentTool === 'code',
      disabled: isToolLoading('code')
    },
    {
      id: 'voice',
      icon: <Mic className="h-5 w-5" />,
      label: 'Voice Transcript',
      action: 'voice',
      active: currentTool === 'voice',
      disabled: isToolLoading('voice-transcript')
    },
    {
      id: 'translate',
      icon: <Languages className="h-5 w-5" />,
      label: 'Translate',
      action: 'translate',
      active: currentTool === 'translate',
      disabled: isToolLoading('translate')
    },
    {
      id: 'roi',
      icon: <TrendingUp className="h-5 w-5" />,
      label: 'ROI Calculator',
      action: 'roi',
      active: currentTool === 'roi',
      disabled: isToolLoading('roi')
    }
  ], [currentTool, isToolLoading, isAnalyzing])

  const focusIndex = useCallback((idx: number) => {
    const btn = buttonsRef.current[idx]
    if (btn) btn.focus()
  }, [])

  const activeIndex = useMemo(() => {
    const i = toolItems.findIndex(i => i.active)
    return i >= 0 ? i : 0
  }, [toolItems])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const count = toolItems.length
    if (count === 0) return
    const current = document.activeElement
    const currentIdx = buttonsRef.current.findIndex(b => b === current)
    let nextIdx = currentIdx >= 0 ? currentIdx : activeIndex
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault()
        nextIdx = (nextIdx + 1 + count) % count
        focusIndex(nextIdx)
        break
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault()
        nextIdx = (nextIdx - 1 + count) % count
        focusIndex(nextIdx)
        break
      case "Home":
        e.preventDefault()
        focusIndex(0)
        break
      case "End":
        e.preventDefault()
        focusIndex(count - 1)
        break
      case "Enter":
      case " ":
        if (currentIdx >= 0) {
          e.preventDefault()
          const item = toolItems[currentIdx]
          if (item && !item.disabled) handleToolClick(item)
        }
        break
    }
  }, [toolItems, activeIndex, focusIndex])

  // Handle tool button clicks
  const handleToolClick = useCallback(async (item: ConnectedToolItem) => {
    if (item.disabled || isExecuting) return

    // Change active tool
    onToolChange?.(item.id)
    
    // For some tools, we can execute them immediately
    // For others, we just change the active state
    switch (item.action) {
      case 'chat':
        // Just activate chat mode
        break
        
      case 'search':
        // Trigger search with a sample query or open search dialog
        setIsExecuting(item.id)
        try {
          const result = await search("latest business trends", { sessionId, userId })
          onToolResult?.(item.id, result)
        } catch (error) {
          console.error('Search failed:', error)
        } finally {
          setIsExecuting(null)
        }
        break
        
      case 'calc':
        // Perform sample calculation
        setIsExecuting(item.id)
        try {
          const result = await calculate([10, 20, 30, 40], { sessionId, userId, op: 'sum' })
          onToolResult?.(item.id, result)
        } catch (error) {
          console.error('Calculation failed:', error)
        } finally {
          setIsExecuting(null)
        }
        break
        
      case 'webcam':
        // Start webcam capture
        setIsExecuting(item.id)
        try {
          const started = await startWebcam()
          if (started) {
            // Wait a moment then capture
            setTimeout(async () => {
              try {
                const result = await captureWebcamImage()
                onToolResult?.(item.id, result)
              } catch (error) {
                console.error('Webcam capture failed:', error)
              } finally {
                setIsExecuting(null)
              }
            }, 2000)
          } else {
            setIsExecuting(null)
          }
        } catch (error) {
          console.error('Webcam start failed:', error)
          setIsExecuting(null)
        }
        break
        
      case 'screen':
        // Capture screen
        setIsExecuting(item.id)
        try {
          const result = await captureScreen()
          onToolResult?.(item.id, result)
        } catch (error) {
          console.error('Screen capture failed:', error)
        } finally {
          setIsExecuting(null)
        }
        break
        
      case 'url':
        // Analyze sample URL
        setIsExecuting(item.id)
        try {
          const result = await analyzeURL("https://example.com", { sessionId, userId })
          onToolResult?.(item.id, result)
        } catch (error) {
          console.error('URL analysis failed:', error)
        } finally {
          setIsExecuting(null)
        }
        break
        
      case 'roi':
        // Calculate sample ROI
        setIsExecuting(item.id)
        try {
          const result = await calculateROI(10000, 15000, 12, { sessionId, userId })
          onToolResult?.(item.id, result)
        } catch (error) {
          console.error('ROI calculation failed:', error)
        } finally {
          setIsExecuting(null)
        }
        break
        
      default:
        // For other tools, just activate them
        break
    }
  }, [
    isExecuting, 
    onToolChange, 
    onToolResult, 
    search, 
    calculate, 
    startWebcam, 
    captureWebcamImage, 
    captureScreen, 
    analyzeURL, 
    calculateROI, 
    sessionId, 
    userId
  ])

  return (
    <TooltipProvider>
      <div
        role="navigation"
        aria-label={ariaLabel}
        className={cn("flex flex-col items-center gap-2 p-2", className)}
        onKeyDown={onKeyDown}
      >
        {toolItems.map((item, idx) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <button
                ref={el => (buttonsRef.current[idx] = el)}
                aria-label={item.label}
                aria-current={item.active ? "page" : undefined}
                disabled={item.disabled || isExecuting === item.id}
                onClick={() => handleToolClick(item)}
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.40)] focus-visible:ring-offset-2 hover:-translate-y-0.5 active:translate-y-0",
                  item.active
                    ? "bg-[hsl(var(--accent)/0.10)] border-[hsl(var(--accent)/0.30)] text-[hsl(var(--accent))]"
                    : "bg-card/60 border-border/40 text-muted-foreground hover:text-foreground",
                  (item.disabled || isExecuting === item.id) && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="relative">
                  <span aria-hidden>{item.icon}</span>
                  {item.active && (
                    <span className="absolute -right-1 -bottom-1 inline-block h-2 w-2 rounded-full bg-[hsl(var(--accent))] shadow-[0_0_6px_hsl(var(--accent))]" aria-hidden />
                  )}
                  {isExecuting === item.id && (
                    <span className="absolute -top-1 -right-1 inline-block h-3 w-3 rounded-full bg-blue-500 animate-pulse" aria-hidden />
                  )}
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isExecuting === item.id ? `${item.label} (Running...)` : item.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}