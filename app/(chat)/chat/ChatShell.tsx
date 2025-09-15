"use client"

import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Import AI Elements system
import { useAIElementsSystem } from '@/components/ai-elements/ai-system';

// Import components exactly as in reference
import { UnifiedControlPanel } from '@/components/UnifiedControlPanel';
import { WelcomeScreen } from '@/components/screens/WelcomeScreen';
import { LoadingIndicator } from '@/components/indicators/LoadingIndicator';
import { CleanInputField } from '@/components/input/CleanInputField';

// Import overlays
import { SettingsOverlay } from '@/components/overlays/SettingsOverlay';
import { FileUploadOverlay } from '@/components/overlays/FileUploadOverlay';
import { UnifiedCanvasSystem } from '@/components/UnifiedCanvasSystem';

// Import existing components
import { CalendarBookingOverlay } from '@/components/chat/CalendarBookingOverlay';
import { UnifiedMessage, MessageData } from '@/components/chat/UnifiedMessage';
import { SpeechToSpeechPopover } from '@/components/SpeechToSpeechPopover';
import { WebcamInterface } from '@/components/chat/WebcamInterface';
import { ScreenShareInterface } from '@/components/chat/ScreenShareInterface';
import { UnifiedMultimodalWidget } from '@/components/chat/UnifiedMultimodalWidget';
import { StageRail } from '@/components/chat/StageRail';
import { ResearchPanel } from '@/components/overlays/ResearchPanel';
import { TCConsentCard } from '@/components/cards/TCConsentCard';

// Import hooks and utilities
import { useAppState } from '@/hooks/useAppState';
import { AI_RESPONSES, generateMessageId } from '@/constants/appConstants';
import { useToolActions } from '@/hooks/use-tool-actions'

// Main ChatShell Component - Exact replica of attached_assets/src/App.tsx
export default function ChatShell() {
  // Add mounted state to prevent hydration errors
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  // Use centralized state management
  const {
    state,
    updateState,
    appendMessage,
    updateMessage,
    messagesEndRef,
    messagesContainerRef,
    scrollToBottom,
    handleScroll,
    handleSendMessage
  } = useAppState();

  // AI Elements system hook
  const {
    systemState,
    updateSystem,
    activateCapability,
    advanceStage
  } = useAIElementsSystem();

  // Tool actions for grounded search and URL analysis
  const { search, analyzeURL } = useToolActions();
  // Consent-triggered lead research (run once per page session)
  const consentTriggeredRef = React.useRef(false)
  const [needsConsent, setNeedsConsent] = useState(false)
  const [consentLoading, setConsentLoading] = useState(false)
  const ensureSessionId = useCallback(() => {
    if (typeof window === 'undefined') return null
    const key = 'intelligence-session-id'
    let sid = localStorage.getItem(key)
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem(key, sid)
    }
    return sid
  }, [])

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/consent', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!data?.allow) { setNeedsConsent(true); return }
        if (consentTriggeredRef.current) return
        consentTriggeredRef.current = true

        const sessionId = ensureSessionId()
        // Once-per-session guard for lead research across remounts/refreshes
        const lrKey = sessionId ? `lead-research-done:${sessionId}` : null
        try {
          if (lrKey && typeof window !== 'undefined' && sessionStorage.getItem(lrKey) === '1') {
            return
          }
        } catch {}
        const email = data.email || (data.companyDomain ? `lead@${data.companyDomain}` : null)
        const name = data.name || 'Prospect'
        const companyUrl = data.companyDomain ? `https://${data.companyDomain}` : undefined
        if (!sessionId || !email) return

        const lr = await fetch('/api/intelligence/lead-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, email, name, companyUrl, provider: 'google' })
        })
        const out = await lr.json().catch(() => ({}))

        // Mark as done for this session to avoid duplicate calls on remounts
        try { if (lrKey) sessionStorage.setItem(lrKey, '1') } catch {}

        // Activate research capabilities in UI system
        activateCapability('source-citation')
        activateCapability('web-preview')

        const summary = out?.output || out?.research || {}
        const company = summary?.company?.name || data.companyDomain || 'the company'
        const person = summary?.person?.fullName || name
        const msg: MessageData = {
          id: generateMessageId(),
          sender: 'ai',
          timestamp: new Date(),
          type: 'insight',
          content: `🔎 Lead research initialized for ${person} at ${company}. I can reference this context for more tailored guidance.`,
          sources: Array.isArray(summary?.citations) ? summary.citations.slice(0,3).map((c: any) => ({ title: String(c.title||'Source'), url: String(c.uri||c.url||''), excerpt: String(c.description||'') })) : undefined,
          tools: [{ name: 'Web Search', description: 'Grounded search with citations', used: true }]
        }
        appendMessage(msg)
      } catch {}
    }
    run()
  }, [activateCapability, appendMessage, ensureSessionId])

  const triggerLeadResearch = useCallback(async (payload: { name: string; email: string; companyUrl?: string }) => {
    try {
      const sessionId = ensureSessionId()
      if (!sessionId) return
      const lr = await fetch('/api/intelligence/lead-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email: payload.email, name: payload.name || 'Prospect', companyUrl: payload.companyUrl, provider: 'google' })
      })
      const out = await lr.json().catch(() => ({}))
      activateCapability('source-citation')
      activateCapability('web-preview')
      const summary = out?.output || out?.research || {}
      const company = summary?.company?.name || payload.companyUrl || 'the company'
      const person = summary?.person?.fullName || payload.name
      const msg: MessageData = {
        id: generateMessageId(),
        sender: 'ai',
        timestamp: new Date(),
        type: 'insight',
        content: `🔎 Lead research initialized for ${person} at ${company}. I can reference this context for more tailored guidance.`,
        sources: Array.isArray(summary?.citations) ? summary.citations.slice(0,3).map((c: any) => ({ title: String(c.title||'Source'), url: String(c.uri||c.url||''), excerpt: String(c.description||'') })) : undefined,
        tools: [{ name: 'Web Search', description: 'Grounded search with citations', used: true }]
      }
      appendMessage(msg)
    } catch {}
  }, [activateCapability, appendMessage, ensureSessionId, generateMessageId])

  const handleConsent = useCallback(async (data: { name: string; email: string; company: string }) => {
    try {
      setConsentLoading(true)
      const body = { name: data.name, email: data.email, companyUrl: data.company }
      const res = await fetch('/api/consent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        setNeedsConsent(false)
        await triggerLeadResearch({ name: data.name, email: data.email, companyUrl: data.company })
      }
    } finally {
      setConsentLoading(false)
    }
  }, [triggerLeadResearch])
  const researchSeenRef = React.useRef<Map<string, number>>(new Map())

  // Helpers for auto research triggers
  const extractUrls = useCallback((text: string): string[] => {
    const re = /\bhttps?:\/\/[^\s)]+/gi
    const matches = text.match(re) || []
    return (matches || []).map(u => u.replace(/[),.;]+$/, ''))
  }, [])

  const hasSearchIntent = useCallback((text: string): boolean => {
    const t = text.toLowerCase()
    return /(search|find|look\s*up|research|latest|news|what\s+is|who\s+is)/.test(t)
  }, [])

  const runAutoResearch = useCallback(async (originalText: string) => {
    try {
      // Prefer selected text if available
      let query = originalText
      if (typeof window !== 'undefined') {
        const sel = (window.getSelection && window.getSelection()?.toString())?.trim()
        if (sel && sel.length > 3) query = sel
      }

      // TTL guard: avoid repeated auto-research for same query within 30s
      const key = (query || '').toLowerCase().trim()
      const now = Date.now()
      const last = researchSeenRef.current.get(key) || 0
      if (now - last < 30000) return
      researchSeenRef.current.set(key, now)
      
      const urls = extractUrls(query)
      const lower = (query || '').toLowerCase()

      // If user asks about themselves ("about me/my company"), prefer lead context over web search
      if (/(about\s+me|about\s+us|my\s+company|what\s+did\s+you\s+find\s+out|who\s+am\s+i)/.test(lower)) {
        try {
          const sessionId = ensureSessionId()
          if (sessionId) {
            const dbg = await fetch(`/api/intelligence/context?sessionId=${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
            if (dbg.ok) {
              const snap = await dbg.json()
              const parts: string[] = []
              if (snap?.person) parts.push(`Person: ${snap.person?.fullName || ''}${snap.person?.role ? `, ${snap.person.role}` : ''}`)
              if (snap?.company) parts.push(`Company: ${snap.company?.name || ''}${snap.company?.industry ? `, ${snap.company.industry}` : ''}`)
              if (snap?.role) parts.push(`Role: ${snap.role}`)
              const msg = parts.filter(Boolean).join('\n') || 'I have your consent details and will personalize as we continue.'
              const loaderId = generateMessageId()
              appendMessage({ id: loaderId, sender: 'ai', timestamp: new Date(), type: 'insight', content: `🔎 Lead context\n\n${msg}`, isComplete: true })
              return
            }
          }
        } catch {}
      }

      const wantsSearch = hasSearchIntent(query) || urls.length > 0
      if (!wantsSearch) {
        return
      }

      // Show a lightweight loader message only when we actually run research
      const loaderId = generateMessageId()
      appendMessage({ id: loaderId, sender: 'ai', timestamp: new Date(), type: 'insight', content: '🔎 Researching…', isComplete: false })

      if (urls.length > 0) {
        // URL Context Analysis
        const res = await analyzeURL(urls, { query })
        if (res?.ok) {
          const output = (res.output as any) || {}
          const citations = Array.isArray(output.citations) ? output.citations : []
          const sources = citations.map((c: any) => ({
            title: String(c.title || 'Source'),
            url: String(c.uri || c.url || ''),
            excerpt: String(c.description || '')
          }))
          updateMessage(loaderId, {
            content: `🔎 URL Analysis Results\n\n${output.text || 'Analysis complete.'}`,
            sources,
            tools: [{ name: 'URL Context', description: 'Grounded webpage analysis', used: true }],
            isComplete: true
          })
        }
        return
      }

      if (hasSearchIntent(query)) {
        const res = await search(query)
        if (res?.ok) {
          const output = (res.output as any) || {}
          const citations = Array.isArray(output.citations) ? output.citations : []
          const sources = citations.map((c: any) => ({
            title: String(c.title || 'Source'),
            url: String(c.uri || c.url || ''),
            excerpt: String(c.description || '')
          }))
          updateMessage(loaderId, {
            content: `🔎 Web Search Results\n\n${output.text || 'Search complete.'}`,
            sources,
            tools: [{ name: 'Web Search', description: 'Grounded search with citations', used: true }],
            isComplete: true
          })
        }
      }
    } catch (err) {
      // Non-fatal; ignore
      console.warn('Auto-research failed', err)
    }
  }, [analyzeURL, extractUrls, generateMessageId, hasSearchIntent, search, appendMessage, updateMessage])

  // Update AI system when messages change
  React.useEffect(() => {
    updateSystem(state.messages);
  }, [state.messages, updateSystem]);

  // Multimodal widgets management
  const multimodalWidgets = React.useMemo(() => {
    const widgets = [];
    
    if (state.showVoiceOverlay && state.isVoiceMinimized) {
      widgets.push({
        id: 'voice',
        type: 'voice' as const,
        title: 'Voice AI',
        status: state.voiceMode ? 'Active' : 'Ready',
        isActive: state.voiceMode,
        data: {
          isRecording: false,
          aiState: 'idle' as const
        }
      });
    }
    
    if (state.showWebcamInterface && state.isWebcamMinimized) {
      widgets.push({
        id: 'webcam',
        type: 'webcam' as const,
        title: 'Video Call',
        status: 'Connected',
        isActive: true,
        data: {
          facingMode: state.cameraFacing,
          insightCount: 0,
          confidence: 85
        }
      });
    }
    
    if (state.showScreenShareInterface && state.isScreenShareMinimized) {
      widgets.push({
        id: 'screen',
        type: 'screen' as const,
        title: 'Screen Share',
        status: 'Sharing',
        isActive: true,
        data: {
          analysisProgress: 65
        }
      });
    }
    
    return widgets;
  }, [
    state.showVoiceOverlay, 
    state.isVoiceMinimized, 
    state.voiceMode,
    state.showWebcamInterface, 
    state.isWebcamMinimized,
    state.cameraFacing,
    state.showScreenShareInterface, 
    state.isScreenShareMinimized
  ]);

  // Event handlers
  const handleBookingComplete = useCallback((bookingData: any) => {
    updateState({ showBookingOverlay: false });
    
    const confirmationMessage: MessageData = {
      id: generateMessageId(),
      content: `🎉 **Strategy Session Confirmed!**\n\nThank you for booking your AI consultation. You'll receive:\n\n✅ Personalized AI assessment\n✅ Custom ROI projections\n✅ Implementation roadmap\n✅ Competitive analysis\n\nA preparation guide will be sent within 24 hours.`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'cta'
    };
    
    updateState({ 
      messages: [...state.messages, confirmationMessage],
      conversationState: { ...state.conversationState, leadScore: 100 }
    });
  }, [state.messages, state.conversationState, updateState]);

  const handleToolSelect = useCallback((toolId: string) => {
    if (state.activeTools.includes(toolId)) {
      updateState({ 
        activeTools: state.activeTools.filter(t => t !== toolId) 
      });
    } else if (toolId === 'docs') {
      updateState({ showFileUpload: true });
      activateCapability('document-analysis');
    } else if (toolId === 'webcam') {
      updateState({ showWebcamInterface: true });
      activateCapability('real-time-processing');
    } else if (toolId === 'screen') {
      updateState({ showScreenShareInterface: true });
      activateCapability('image-processing');
    } else {
      updateState({ activeCanvasTool: toolId });
      // Activate relevant capabilities based on tool
      switch (toolId) {
        case 'research':
          activateCapability('source-citation');
          activateCapability('web-preview');
          break;
        case 'workshop':
          activateCapability('adaptive-learning');
          break;
      }
    }
  }, [state.activeTools, activateCapability, updateState]);

  const handleVoiceComplete = useCallback((transcript: string) => {
    updateState({ 
      showVoiceOverlay: false,
      isVoiceMinimized: false,
      input: transcript,
      isUserScrolling: false
    });
    
    if (transcript.trim()) {
      activateCapability('real-time-processing');
      activateCapability('adaptive-learning');
      setTimeout(() => handleSendMessage(), 100);
    }
  }, [handleSendMessage, activateCapability, updateState]);

  const handleFilesUploaded = useCallback((files: File[]) => {
    activateCapability('document-analysis');
    activateCapability('source-citation');
    activateCapability('data-persistence');
    
    const analysisMessage: MessageData = {
      id: generateMessageId(),
      content: `📄 **Document Analysis Complete**\n\nI've analyzed ${files.length} document${files.length > 1 ? 's' : ''}:\n\n${files.map(f => `• ${f.name}`).join('\n')}\n\n**Key Findings:**\n✅ Business process gaps identified\n✅ Automation opportunities detected\n✅ ROI improvement potential: 25-40%\n\nBased on your documents, I can see specific areas where AI implementation would deliver immediate value. Would you like me to prioritize these opportunities?`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'cta',
      suggestions: [
        'Show me the top 3 opportunities',
        'Focus on cost reduction areas',
        'Prioritize revenue growth potential'
      ]
    };
    
    updateState({ 
      messages: [...state.messages, analysisMessage] 
    });
  }, [state.messages, activateCapability, updateState]);

  const handleGeneratePDF = useCallback(async () => {
    try {
      // Append a small status message
      const msgId = generateMessageId()
      const pending: MessageData = {
        id: msgId,
        sender: 'ai',
        timestamp: new Date(),
        type: 'cta',
        content: '📋 Preparing your AI Strategy Report…'
      }
      updateState({ messages: [...state.messages, pending] })

      // Resolve consent for email/name
      let toEmail: string | undefined
      let leadName: string | undefined
      try {
        const res = await fetch('/api/consent', { cache: 'no-store' })
        if (res.ok) {
          const cj = await res.json()
          if (cj?.allow) {
            toEmail = cj.email || undefined
            leadName = cj.name || undefined
          }
        }
      } catch {}

      // Trigger server-side PDF (download)
      const exportRes = await fetch('/api/export-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: localStorage.getItem('intelligence-session-id') || undefined, leadEmail: toEmail })
      })
      if (exportRes.ok) {
        const blob = await exportRes.blob()
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `FB-c_Summary_${(leadName || 'Lead').replace(/\s+/g,'_')}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
      }

      // Send via email if we have a consent email and Resend is configured
      if (toEmail) {
        try {
          await fetch('/api/send-pdf-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: localStorage.getItem('intelligence-session-id'), toEmail, leadName })
          })
        } catch {}
      }

      // Update message
      updateState({ messages: state.messages.map(m => m.id === msgId ? { ...m, content: '📋 Your AI Strategy Report is ready. A download started, and a copy has been emailed if available.' } : m) })
    } catch (e) {
      updateState({ messages: [...state.messages, { id: generateMessageId(), sender: 'ai', timestamp: new Date(), type: 'cta', content: 'There was an issue generating the PDF. Please try again.' }] })
    }
  }, [generateMessageId, state.messages, updateState])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    updateState({ 
      input: suggestion,
      isUserScrolling: false
    });
    setTimeout(() => handleSendMessage(), 100);
  }, [handleSendMessage, updateState]);

  // Widget handlers
  const handleWidgetExpand = useCallback((widgetId: string) => {
    const updates: any = {};
    switch (widgetId) {
      case 'voice':
        updates.isVoiceMinimized = false;
        break;
      case 'webcam':
        updates.isWebcamMinimized = false;
        break;
      case 'screen':
        updates.isScreenShareMinimized = false;
        break;
    }
    updateState(updates);
  }, [updateState]);

  const handleWidgetClose = useCallback((widgetId: string) => {
    const updates: any = {};
    switch (widgetId) {
      case 'voice':
        updates.showVoiceOverlay = false;
        updates.isVoiceMinimized = false;
        updates.voiceMode = false;
        break;
      case 'webcam':
        updates.showWebcamInterface = false;
        updates.isWebcamMinimized = false;
        break;
      case 'screen':
        updates.showScreenShareInterface = false;
        updates.isScreenShareMinimized = false;
        break;
    }
    updateState(updates);
  }, [updateState]);

  const handleCameraSwitch = useCallback(() => {
    const newFacing = state.cameraFacing === 'user' ? 'environment' : 'user';
    updateState({ cameraFacing: newFacing });
  }, [state.cameraFacing, updateState]);

  // Render - Exact structure from reference
  // Show loading state until mounted on client
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
      {/* Consent Gate - blocks interaction until completed */}
      {needsConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="relative">
            <TCConsentCard onConsentGranted={({ name, email, company }) => handleConsent({ name, email, company })} />
            {consentLoading && (
              <div className="absolute inset-0 bg-background/40 rounded-2xl flex items-center justify-center text-sm">Saving…</div>
            )}
          </div>
        </div>
      )}
      {/* Unified Control Panel */}
      <UnifiedControlPanel
        voiceMode={state.voiceMode}
        leadScore={state.conversationState.leadScore}
        conversationStarted={state.messages.length > 1}
        currentStageIndex={systemState.stageProgress.current}
        exploredCount={systemState.capabilityUsage.used}
        totalCapabilities={systemState.capabilityUsage.total}
        systemState={systemState}
        onGeneratePDF={handleGeneratePDF}
        onShowBooking={() => updateState({ showBookingOverlay: true })}
        onShowSettings={() => updateState({ showSettingsOverlay: true })}
        onShowVoiceOverlay={() => updateState({ showVoiceOverlay: true })}
        onShowResearchPanel={() => updateState({ showResearchPanel: true })}
      />

      {/* Stage Rail - Floating Stage Progress Indicator */}
      <StageRail
        currentStageIndex={systemState.stageProgress.current}
        conversationStarted={state.messages.length > 1}
        exploredCount={systemState.capabilityUsage.used}
        totalCapabilities={systemState.capabilityUsage.total}
      />

      {/* Main Content with Auto-Scroll */}
      <main 
        ref={messagesContainerRef}
        className="max-w-4xl mx-auto px-6 py-24 pb-40 overflow-y-auto relative z-10" 
        role="main"
        onScroll={handleScroll}
        style={{ 
          maxHeight: 'calc(100vh - 8rem)',
          scrollBehavior: 'smooth'
        }}
      >
        {state.messages.length === 0 && !state.isLoading ? (
          <WelcomeScreen />
        ) : (
          <div className="space-y-8">
            {state.messages.map((message, index) => (
              <motion.div 
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index === state.messages.length - 1 ? 0.1 : 0,
                  ease: "easeOut" 
                }}
              >
                <UnifiedMessage
                  message={message}
                  onSuggestionClick={handleSuggestionClick}
                  onMessageAction={async (action, messageId) => {
                    if (action === 'tool:voice') {
                      updateState({ showVoiceOverlay: true })
                      return
                    }
                    if (action === 'tool:screen') {
                      updateState({ showScreenShareInterface: true })
                      return
                    }
                    if (action === 'tool:research') {
                      const msg = state.messages.find(m => m.id === messageId)
                      const text = msg?.content || state.input
                      if (text && text.trim()) {
                        await runAutoResearch(text.trim())
                      }
                      return
                    }
                    if (action === 'tool:roi-inline') {
                      // No extra UI needed; card is inline. We can optionally scroll it into view
                      return
                    }
                    console.log('Action:', action, messageId)
                  }}
                  onPlayMessage={() => {}}
                  onStopMessage={() => {}}
                  conversationState={state.conversationState}
                />
              </motion.div>
            ))}

            {state.isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LoadingIndicator />
              </motion.div>
            )}

            {/* Invisible scroll target */}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {state.isUserScrolling && state.messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed bottom-32 right-8 z-30"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => {
                        updateState({ isUserScrolling: false });
                        scrollToBottom();
                      }}
                      size="sm"
                      className="h-10 w-10 rounded-full glass-button bg-primary/10 hover:bg-primary/20 text-primary shadow-lg"
                      aria-label="Scroll to bottom"
                    >
                      <motion.div
                        animate={{ y: [0, 2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m7 13 5 5 5-5M7 6l5 5 5-5"/>
                        </svg>
                      </motion.div>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>Scroll to latest message</TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Input Field */}
      <CleanInputField
        input={state.input}
        setInput={(value) => updateState({ input: value })}
        onSubmit={() => {
          const current = state.input
          // Kick off chat response
          handleSendMessage()
          // Run grounded research triggers in background using the same text
          if (current && current.trim()) {
            void runAutoResearch(current.trim())
          }
        }}
        isLoading={state.isLoading}
        voiceMode={state.voiceMode}
        onToggleVoice={() => updateState({ voiceMode: !state.voiceMode })}
        onShowVoiceOverlay={() => updateState({ showVoiceOverlay: true })}
        onToolSelect={handleToolSelect}
        onShowSettings={() => updateState({ showSettingsOverlay: true })}
        activeTools={state.activeTools}
      />

      {/* Overlays */}
      <AnimatePresence mode="wait">
        {state.showResearchPanel && (
          <ResearchPanel
            isOpen={state.showResearchPanel}
            onClose={() => updateState({ showResearchPanel: false })}
            messages={state.messages}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {state.showVoiceOverlay && !state.isVoiceMinimized && (
          <SpeechToSpeechPopover
            isOpen={state.showVoiceOverlay}
            onClose={() => updateState({ showVoiceOverlay: false, isVoiceMinimized: false, voiceMode: false })}
            onMinimize={() => updateState({ isVoiceMinimized: !state.isVoiceMinimized })}
            onTranscriptComplete={handleVoiceComplete}
            audioEnabled={true}
            onAudioToggle={() => {}}
            assistantName="AI Strategy Assistant"
            isMinimized={false}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state.showSettingsOverlay && (
          <SettingsOverlay
            isOpen={state.showSettingsOverlay}
            onClose={() => updateState({ showSettingsOverlay: false })}
            theme={state.theme}
            onThemeChange={(theme) => updateState({ theme })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state.showFileUpload && (
          <FileUploadOverlay
            isOpen={state.showFileUpload}
            onClose={() => updateState({ showFileUpload: false })}
            onFilesUploaded={handleFilesUploaded}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state.activeCanvasTool && (
          <UnifiedCanvasSystem
            activeTool={state.activeCanvasTool}
            onClose={() => updateState({ activeCanvasTool: null })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state.showWebcamInterface && !state.isWebcamMinimized && (
          <WebcamInterface
            isOpen={state.showWebcamInterface}
            onClose={() => updateState({ showWebcamInterface: false, isWebcamMinimized: false })}
            onMinimize={() => updateState({ isWebcamMinimized: !state.isWebcamMinimized })}
            isMinimized={false}
            analysisMode="business"
            hasOtherWidgets={false}
            onCameraSwitch={handleCameraSwitch}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state.showScreenShareInterface && !state.isScreenShareMinimized && (
          <ScreenShareInterface
            isOpen={state.showScreenShareInterface}
            onClose={() => updateState({ showScreenShareInterface: false, isScreenShareMinimized: false })}
            onMinimize={() => updateState({ isScreenShareMinimized: !state.isScreenShareMinimized })}
            isMinimized={false}
            analysisMode="workflow"
            hasOtherWidgets={false}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state.showBookingOverlay && (
          <CalendarBookingOverlay
            isOpen={state.showBookingOverlay}
            onClose={() => updateState({ showBookingOverlay: false })}
            onBookingComplete={handleBookingComplete}
            leadData={{
              name: '',
              email: '',
              company: ''
            }}
          />
        )}
      </AnimatePresence>

      {/* Unified Multimodal Widget */}
      <AnimatePresence>
        <UnifiedMultimodalWidget
          widgets={multimodalWidgets}
          onWidgetExpand={handleWidgetExpand}
          onWidgetClose={handleWidgetClose}
          onCameraSwitch={handleCameraSwitch}
          isVisible={multimodalWidgets.length > 0}
        />
      </AnimatePresence>
      </div>
    </DndProvider>
  );
}
