"use client"

import React from "react"
import { Camera, Monitor, Video, Mic, MicOff, Circle, Square, X, Zap, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MediaControlsProps {
  isVideoOn: boolean
  isAudioOn: boolean
  isRecording?: boolean
  isAnalyzing?: boolean
  onToggleVideo: () => void
  onToggleAudio: () => void
  onStartRecording?: () => void
  onStopRecording?: () => void
  onCapture?: () => void
  onClose?: () => void
}

export function EnhancedMediaControls({
  isVideoOn,
  isAudioOn,
  isRecording,
  isAnalyzing,
  onToggleVideo,
  onToggleAudio,
  onStartRecording,
  onStopRecording,
  onCapture,
  onClose
}: MediaControlsProps) {
  return (
    <div className="media-controls">
      <button
        onClick={onToggleVideo}
        className={cn("media-btn", isVideoOn && "active")}
        aria-label={isVideoOn ? "Turn off camera" : "Turn on camera"}
      >
        {isVideoOn ? <Camera className="w-5 h-5" /> : <Camera className="w-5 h-5 opacity-50" />}
      </button>
      
      <button
        onClick={onToggleAudio}
        className={cn("media-btn", isAudioOn && "active")}
        aria-label={isAudioOn ? "Mute microphone" : "Unmute microphone"}
      >
        {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </button>

      {onCapture && (
        <button
          onClick={onCapture}
          className="capture-btn"
          aria-label="Capture screenshot"
        />
      )}

      {onStartRecording && onStopRecording && (
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          className={cn("media-btn", isRecording && "recording")}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? <Square className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>
      )}

      {isAnalyzing && (
        <button className="media-btn active">
          <Zap className="w-5 h-5 animate-pulse" />
        </button>
      )}

      {onClose && (
        <button
          onClick={onClose}
          className="media-btn"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

interface MediaStatusBadgeProps {
  isLive?: boolean
  isRecording?: boolean
  isAnalyzing?: boolean
  recordingTime?: number
  connectionQuality?: 'excellent' | 'good' | 'poor'
}

export function MediaStatusBadge({
  isLive,
  isRecording,
  isAnalyzing,
  recordingTime,
  connectionQuality
}: MediaStatusBadgeProps) {
  const getStatusText = () => {
    if (isRecording) return `Recording ${recordingTime ? formatTime(recordingTime) : ''}`
    if (isAnalyzing) return 'Analyzing...'
    if (isLive) return 'Live'
    return 'Ready'
  }

  const getStatusClass = () => {
    if (isRecording) return 'recording'
    if (isAnalyzing) return 'analyzing'
    if (isLive) return 'live'
    return ''
  }

  return (
    <div className="status-badge">
      <div className={`status-dot ${getStatusClass()}`} />
      <span>{getStatusText()}</span>
      {connectionQuality && (
        <div className={`quality-indicator ${connectionQuality}`}>
          <div className="quality-bar" />
          <div className="quality-bar" />
          <div className="quality-bar" />
        </div>
      )}
    </div>
  )
}

interface MediaContainerProps {
  children: React.ReactNode
  title: string
  icon: React.ReactNode
  className?: string
}

export function MediaContainer({ children, title, icon, className }: MediaContainerProps) {
  return (
    <Card variant="glass" className={cn("overflow-hidden border-accent/10", className)}>
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-accent/10 to-primary/10 backdrop-blur-md">
        <h3 className="text-lg font-semibold flex items-center gap-3">
          <div className="preview-icon">
            {icon}
          </div>
          <span className="text-gradient-premium">{title}</span>
        </h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </Card>
  )
}

interface AnalysisPanelProps {
  content: string
  isAnalyzing?: boolean
}

export function AnalysisPanel({ content, isAnalyzing }: AnalysisPanelProps) {
  return (
    <div className="analysis-panel">
      <div className="analysis-header">
        <div className="analysis-icon">
          <Eye className="w-4 h-4" />
        </div>
        <h4 className="text-white font-semibold">
          {isAnalyzing ? "Analyzing..." : "AI Analysis"}
        </h4>
      </div>
      <div className="analysis-content">
        {content || "Ready for analysis..."}
      </div>
    </div>
  )
}

interface PermissionCardProps {
  onRequestPermission: () => void
  title: string
  description: string
  icon: React.ReactNode
}

export function PermissionCard({ 
  onRequestPermission, 
  title, 
  description, 
  icon 
}: PermissionCardProps) {
  return (
    <div className="permission-card">
      <div className="permission-icon">
        {icon}
      </div>
      <h3 className="permission-title">{title}</h3>
      <p className="permission-description">{description}</p>
      <Button 
        onClick={onRequestPermission}
        className="btn-premium"
      >
        Grant Permission
      </Button>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function WorkshopModuleCard({
  title,
  description,
  icon,
  onClick,
  isActive
}: {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  isActive?: boolean
}) {
  return (
    <div 
      className={cn("module-card", isActive && "border-accent/50")}
      onClick={onClick}
    >
      <div className="module-icon">
        {icon}
      </div>
      <h3 className="module-title">{title}</h3>
      <p className="module-description">{description}</p>
    </div>
  )
}

export function WorkshopLayout({ 
  title, 
  subtitle, 
  children 
}: { 
  title: string
  subtitle?: string
  children: React.ReactNode 
}) {
  return (
    <div className="workshop-container">
      <div className="workshop-header">
        <h1 className="workshop-title">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        )}
      </div>
      <div className="workshop-modules">
        {children}
      </div>
    </div>
  )
}