/**
 * Original Pipeline Connection Hook
 * Connects V2 to all your existing pipeline features
 */

import { useState, useCallback, useEffect } from 'react'
import { useUnifiedChat } from '@/hooks/useUnifiedChat'

interface OriginalPipelineOptions {
  sessionId?: string
  enableIntelligence?: boolean
  enableMultimodal?: boolean
  enableVoice?: boolean
  enableAdmin?: boolean
}

export function useOriginalPipeline(options: OriginalPipelineOptions = {}) {
  const [intelligenceContext, setIntelligenceContext] = useState<any>(null)
  const [contextLoading, setContextLoading] = useState(false)

  // Use your existing unified chat hook (now with AI SDK backend)
  const chat = useUnifiedChat({
    sessionId: options.sessionId || 'v2-session',
    mode: 'standard',
    context: intelligenceContext ? {
      sessionId: options.sessionId,
      intelligenceContext
    } as any : undefined,
    onMessage: (message) => {
      console.log('[ORIGINAL_PIPELINE] Message received:', message.content?.slice(0, 50) + '...')
    },
    onError: (error) => {
      console.error('[ORIGINAL_PIPELINE] Error:', error)
    }
  })

  // Connect to your original intelligence system
  const fetchIntelligenceContext = useCallback(async () => {
    if (!options.enableIntelligence || !options.sessionId) return

    setContextLoading(true)
    try {
      const response = await fetch(`/api/intelligence/context?sessionId=${options.sessionId}`)
      
      if (response.ok) {
        const data = await response.json()
        const context = data.ok ? (data.output || data) : null
        
        if (context && (context.lead || context.company || context.person)) {
          setIntelligenceContext(context)
          console.log('[ORIGINAL_PIPELINE] Intelligence context loaded:', {
            hasLead: !!context.lead,
            hasCompany: !!context.company,
            hasPerson: !!context.person
          })
        }
      }
    } catch (error) {
      console.error('[ORIGINAL_PIPELINE] Intelligence fetch failed:', error)
    } finally {
      setContextLoading(false)
    }
  }, [options.sessionId, options.enableIntelligence])

  // Initialize intelligence context
  useEffect(() => {
    if (options.enableIntelligence && options.sessionId) {
      fetchIntelligenceContext()
    }
  }, [fetchIntelligenceContext])

  // Connect to your original voice system
  const startVoice = useCallback(async () => {
    if (!options.enableVoice) return

    try {
      console.log('[ORIGINAL_PIPELINE] Starting voice...')
      // Your voice system would be initialized here
      // This connects to your existing /api/gemini-live endpoint
    } catch (error) {
      console.error('[ORIGINAL_PIPELINE] Voice start failed:', error)
    }
  }, [options.enableVoice])

  // Connect to your original multimodal system
  const captureWebcam = useCallback(async (imageData: string) => {
    if (!options.enableMultimodal) return

    try {
      const response = await fetch('/api/tools/webcam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.sessionId ? { 'x-intelligence-session-id': options.sessionId } : {})
        },
        body: JSON.stringify({
          image: imageData,
          type: 'webcam',
          context: { trigger: 'manual', prompt: 'business' }
        })
      })

      const result = await response.json()
      if (result.success && result.output?.analysis) {
        // Add analysis to chat
        chat.addMessage({
          role: 'assistant',
          content: `📷 **Webcam Analysis**\n\n${result.output.analysis}`,
          timestamp: new Date(),
          type: 'text'
        })
      }
    } catch (error) {
      console.error('[ORIGINAL_PIPELINE] Webcam capture failed:', error)
    }
  }, [options.enableMultimodal, options.sessionId, chat])

  // Connect to your original screen share system
  const captureScreen = useCallback(async (imageData: string) => {
    if (!options.enableMultimodal) return

    try {
      const response = await fetch('/api/tools/screen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.sessionId ? { 'x-intelligence-session-id': options.sessionId } : {})
        },
        body: JSON.stringify({
          image: imageData,
          type: 'screen',
          context: { trigger: 'manual', prompt: 'workflow' }
        })
      })

      const result = await response.json()
      if (result.success && result.output?.analysis) {
        // Add analysis to chat
        chat.addMessage({
          role: 'assistant',
          content: `🖥️ **Screen Analysis**\n\n${result.output.analysis}`,
          timestamp: new Date(),
          type: 'text'
        })
      }
    } catch (error) {
      console.error('[ORIGINAL_PIPELINE] Screen capture failed:', error)
    }
  }, [options.enableMultimodal, options.sessionId, chat])

  // Connect to your original admin system
  const getAdminAnalytics = useCallback(async () => {
    if (!options.enableAdmin) return null

    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('[ORIGINAL_PIPELINE] Admin analytics failed:', error)
    }
    return null
  }, [options.enableAdmin])

  // Connect to your original tools
  const calculateROI = useCallback(async (data: {
    initialInvestment: number
    monthlyRevenue: number
    monthlyExpenses: number
    timePeriod: number
  }) => {
    try {
      const response = await fetch('/api/tools/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      if (result.success) {
        // Add ROI result to chat
        chat.addMessage({
          role: 'assistant',
          content: `💰 **ROI Analysis Complete**\n\n${result.output.summary}\n\n**Key Metrics:**\n• ROI: ${result.output.roi}%\n• Payback: ${result.output.paybackPeriod} months\n• Net Profit: $${result.output.netProfit?.toLocaleString()}`,
          timestamp: new Date(),
          type: 'text'
        })
      }
    } catch (error) {
      console.error('[ORIGINAL_PIPELINE] ROI calculation failed:', error)
    }
  }, [chat])

  return {
    // Core chat (AI SDK backend)
    ...chat,
    
    // Intelligence features (your original)
    intelligenceContext,
    contextLoading,
    refreshIntelligence: fetchIntelligenceContext,
    
    // Multimodal features (your original)
    captureWebcam,
    captureScreen,
    
    // Voice features (your original)
    startVoice,
    
    // Admin features (your original)
    getAdminAnalytics,
    
    // Tool features (your original)
    calculateROI,
    
    // Status
    pipelineStatus: {
      intelligence: !!intelligenceContext,
      multimodal: options.enableMultimodal,
      voice: options.enableVoice,
      admin: options.enableAdmin,
      backend: 'AI SDK + Original Pipeline'
    }
  }
}