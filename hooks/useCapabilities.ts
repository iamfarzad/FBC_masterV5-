/**
 * 🧠 AI Capabilities Hook
 * Provides components with information about available AI capabilities
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  AI_CAPABILITIES, 
  CAPABILITY_CATEGORIES, 
  type AICapability,
  getAvailableCapabilities,
  getCapabilityByKeyword
} from '@/src/core/intelligence/capability-registry'

interface UseCapabilitiesOptions {
  sessionId?: string | null
  userEmail?: string | null
  autoRefresh?: boolean
}

interface CapabilitiesState {
  available: AICapability[]
  categories: typeof CAPABILITY_CATEGORIES
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useCapabilities(options: UseCapabilitiesOptions = {}) {
  const { sessionId, userEmail, autoRefresh = false } = options

  const [state, setState] = useState<CapabilitiesState>({
    available: [],
    categories: CAPABILITY_CATEGORIES,
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  // Get context for capability filtering
  const context = useMemo(() => ({
    hasSessionId: !!sessionId,
    hasUserEmail: !!userEmail,
    supportsMultimodal: true // Always true in this implementation
  }), [sessionId, userEmail])

  // Load capabilities
  const loadCapabilities = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Get available capabilities based on current context
      const available = getAvailableCapabilities(context)
      
      setState({
        available,
        categories: CAPABILITY_CATEGORIES,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      })
    } catch (error) {
      console.error('Failed to load capabilities:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }, [context])

  // Search capabilities by keyword
  const searchCapabilities = useCallback((keyword: string): AICapability[] => {
    if (!keyword.trim()) return state.available
    return getCapabilityByKeyword(keyword).filter(cap => 
      state.available.some(available => available.id === cap.id)
    )
  }, [state.available])

  // Get capability by ID
  const getCapability = useCallback((id: string): AICapability | null => {
    return state.available.find(cap => cap.id === id) || null
  }, [state.available])

  // Get capabilities by category
  const getCapabilitiesByCategory = useCallback((category: keyof typeof CAPABILITY_CATEGORIES): AICapability[] => {
    return state.available.filter(cap => cap.category === category)
  }, [state.available])

  // Check if specific capability is available
  const hasCapability = useCallback((id: string): boolean => {
    return state.available.some(cap => cap.id === id)
  }, [state.available])

  // Get capability suggestions for a user message
  const getSuggestedCapabilities = useCallback((userMessage: string): AICapability[] => {
    const words = userMessage.toLowerCase().split(/\s+/)
    const suggestions = new Set<AICapability>()

    words.forEach(word => {
      const matches = getCapabilityByKeyword(word)
      matches.forEach(match => {
        if (state.available.some(available => available.id === match.id)) {
          suggestions.add(match)
        }
      })
    })

    return Array.from(suggestions)
  }, [state.available])

  // Load capabilities on mount and when context changes
  useEffect(() => {
    loadCapabilities()
  }, [loadCapabilities])

  // Auto-refresh capabilities periodically if enabled
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(loadCapabilities, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [autoRefresh, loadCapabilities])

  // Format capabilities for display
  const formatForDisplay = useCallback((): Record<string, AICapability[]> => {
    return state.available.reduce((acc, cap) => {
      if (!acc[cap.category]) acc[cap.category] = []
      acc[cap.category].push(cap)
      return acc
    }, {} as Record<string, AICapability[]>)
  }, [state.available])

  // Get capability status text for AI responses
  const getCapabilityStatusText = useCallback((): string => {
    const total = state.available.length
    const categories = Object.keys(formatForDisplay()).length
    
    return `I have ${total} capabilities across ${categories} categories: ${
      Object.entries(formatForDisplay())
        .map(([cat, caps]) => `${CAPABILITY_CATEGORIES[cat as keyof typeof CAPABILITY_CATEGORIES].name} (${caps.length})`)
        .join(', ')
    }. Ask me about any of these or say "what can you do" for details.`
  }, [state.available, formatForDisplay])

  return {
    // State
    ...state,
    context,
    
    // Actions
    refresh: loadCapabilities,
    search: searchCapabilities,
    getCapability,
    getCapabilitiesByCategory,
    hasCapability,
    getSuggestedCapabilities,
    
    // Formatting
    formatForDisplay,
    getCapabilityStatusText,
    
    // Constants
    allCapabilities: AI_CAPABILITIES,
    
    // Stats
    stats: {
      total: state.available.length,
      byCategory: Object.entries(formatForDisplay()).map(([cat, caps]) => ({
        category: cat,
        name: CAPABILITY_CATEGORIES[cat as keyof typeof CAPABILITY_CATEGORIES].name,
        count: caps.length
      }))
    }
  }
}

export type UseCapabilitiesReturn = ReturnType<typeof useCapabilities>
