// Centralized feature flags with client/server support
export type FlagName = 
  | 'roi_inline_form' 
  | 'canvas_console' 
  | 'coach_v2'
  | 'use_clean_chat_api' // Flag to switch to new API
  | 'use_modern_design' // Flag to switch to new design system

interface FlagConfig {
  defaultValue: boolean
  description: string
}

const FLAG_CONFIGS: Record<FlagName, FlagConfig> = {
  roi_inline_form: { 
    defaultValue: true, 
    description: 'Enable inline ROI calculation forms' 
  },
  canvas_console: { 
    defaultValue: true, 
    description: 'Enable canvas console features' 
  },
  coach_v2: { 
    defaultValue: false, 
    description: 'Enable coaching v2 features' 
  },
  use_clean_chat_api: { 
    defaultValue: true, // Enable by default for testing
    description: 'Use refactored chat API endpoints' 
  },
  use_modern_design: {
    defaultValue: true, // Enable modern design by default
    description: 'Use new modern design system components'
  }
}

const STORAGE_KEY = 'fbc:flags:v1'

// Server-side flag evaluation
export function getFlagValue(name: FlagName, context?: { isAnonymous?: boolean }): boolean {
  // In production, ignore URL overrides for anonymous users
  if (typeof window === 'undefined') {
    return FLAG_CONFIGS[name]?.defaultValue ?? false
  }

  // Client-side evaluation with URL and localStorage overrides
  return isFlagEnabled(name)
}

// Client-side flag evaluation (existing logic)
let cached: Record<string, boolean> | null = null

function readFromStorage(): Record<string, boolean> {
  try {
    if (typeof window === 'undefined') return {}
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeToStorage(flags: Record<string, boolean>) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
    }
  } catch {}
}

function parseUrlOverrides(): Record<string, boolean> {
  try {
    if (typeof window === 'undefined') return {}
    const qp = new URLSearchParams(window.location.search)
    const raw = qp.get('ff')
    if (!raw) return {}
    
    const overrides: Record<string, boolean> = {}
    const items = raw.split(',').map(s => s.trim()).filter(Boolean)
    
    for (const item of items) {
      if (item === 'all') {
        for (const key of Object.keys(FLAG_CONFIGS)) {
          overrides[key] = true
        }
        continue
      }
      if (item.startsWith('-')) {
        overrides[item.slice(1)] = false
      } else {
        overrides[item] = true
      }
    }
    return overrides
  } catch {
    return {}
  }
}

function computeFlags(): Record<string, boolean> {
  const base: Record<string, boolean> = {}
  for (const [name, config] of Object.entries(FLAG_CONFIGS)) {
    base[name] = config.defaultValue
  }
  
  const stored = readFromStorage()
  const url = parseUrlOverrides()
  
  return { ...base, ...stored, ...url }
}

export function isFlagEnabled(name: FlagName): boolean {
  if (!cached) cached = computeFlags()
  return Boolean(cached[name])
}

export function setFlag(name: FlagName, value: boolean) {
  if (!cached) cached = computeFlags()
  cached[name] = value
  writeToStorage(cached)
}

export function getAllFlags(): Record<FlagName, boolean> {
  if (!cached) cached = computeFlags()
  return { ...cached } as Record<FlagName, boolean>
}