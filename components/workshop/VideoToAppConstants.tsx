import React from 'react'
import {
  Youtube, Wand2, Code, Sparkles, CheckCircle,
  AlertCircle, Loader2
} from 'lucide-react'

export interface VideoToAppProps {
  mode?: 'workshop' | 'fullscreen' | 'card'
  videoUrl?: string
  onVideoUrlChange?: (url: string) => void
  onAppGenerated?: (appUrl: string, videoUrl: string) => void
  className?: string
}

export interface ProgressStep {
  id: string
  label: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'error'
  icon: React.ReactNode
}

export interface VideoInfo {
  videoId: string
  title: string
}

// Default progress steps configuration
export const DEFAULT_PROGRESS_STEPS: ProgressStep[] = [
  {
    id: 'analyze',
    label: 'Analyzing Video',
    description: 'Extracting content and structure',
    status: 'pending',
    icon: <Youtube className="w-4 h-4" />
  },
  {
    id: 'spec',
    label: 'Generating Spec',
    description: 'Creating learning objectives',
    status: 'pending',
    icon: <Wand2 className="w-4 h-4" />
  },
  {
    id: 'code',
    label: 'Building App',
    description: 'Creating interactive experience',
    status: 'pending',
    icon: <Code className="w-4 h-4" />
  },
  {
    id: 'ready',
    label: 'App Ready',
    description: 'Your learning app is complete',
    status: 'pending',
    icon: <Sparkles className="w-4 h-4" />
  }
]

// Status icons mapping
export const STATUS_ICONS = {
  completed: <CheckCircle className="w-4 h-4" />,
  active: <Loader2 className="w-4 h-4 animate-spin" />,
  error: <AlertCircle className="w-4 h-4" />
}

// YouTube URL validation regex
export const YOUTUBE_URL_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/

// Video ID extraction regex
export const VIDEO_ID_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/

// Utility functions
export const validateYouTubeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return YOUTUBE_URL_REGEX.test(url)
  } catch {
    return false
  }
}

export const extractVideoInfo = (url: string): VideoInfo => {
  const videoIdMatch = url.match(VIDEO_ID_REGEX)
  return {
    videoId: videoIdMatch?.[1] || '',
    title: `Video ${videoIdMatch?.[1]?.substring(0, 8) || 'Content'}`
  }
}
