'use client'
import React, { useMemo } from 'react'
import {
  Brain, Activity, Settings, BarChart3, User, Search, FileText,
  Database, Check, Zap, MessageSquare, Image, Mic, Monitor,
  Mail, AlertTriangle, Globe, Link, Eye, Star, Loader, Wrench,
  Bot, Upload, ImageIcon, CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/src/core/utils'

// ============================================================================
// UNIFIED ACTIVITY SYSTEM (No Separate Files)
// ============================================================================

export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export type ActivityType =
  | 'user_action' | 'user_message' | 'ai_thinking' | 'ai_stream' | 'ai_request'
  | 'search' | 'doc_analysis' | 'file_upload' | 'image_upload'
  | 'voice_input' | 'voice_response' | 'screen_share' | 'email_sent'
  | 'error' | 'web_scrape' | 'link' | 'vision_analysis' | 'database'
  | 'complete' | 'analyze' | 'generate' | 'processing' | 'tool_used'

export type ActivityItem = {
  id: string
  type: ActivityType
  title: string
  description?: string
  status: ActivityStatus
  timestamp: number
}

const ICONS: Record<ActivityType, any> = {
  user_action: User,
  user_message: MessageSquare,
  ai_thinking: Brain,
  ai_stream: Bot,
  ai_request: Zap,
  search: Search,
  doc_analysis: FileText,
  file_upload: Upload,
  image_upload: ImageIcon,
  voice_input: Mic,
  voice_response: Mic,
  screen_share: Monitor,
  email_sent: MessageSquare,
  error: AlertTriangle,
  web_scrape: Globe,
  link: Link,
  vision_analysis: Eye,
  database: Database,
  complete: CheckCircle,
  analyze: BarChart3,
  generate: Brain,
  processing: Loader,
  tool_used: Zap,
}

const STATUS_STYLES: Record<ActivityStatus, {
  dot: string; ring?: string; icon?: string; line?: string;
}> = {
  pending: {
    dot: 'w-2.5 h-2.5 bg-muted/40 border border-border/60',
    icon: 'text-muted',
    line: 'bg-muted/30'
  },
  in_progress: {
    dot: 'w-5 h-5 bg-foreground/10 border-2 border-border/70 shadow-sm',
    ring: 'ring-4 ring-accent/20',
    icon: 'text-accent',
    line: 'bg-accent/50'
  },
  completed: {
    dot: 'w-3.5 h-3.5 bg-accent border border-accent/70',
    icon: 'text-accent-foreground',
    line: 'bg-accent/30'
  },
  failed: {
    dot: 'w-3.5 h-3.5 bg-destructive/80 border border-destructive/70',
    icon: 'text-destructive-foreground',
    line: 'bg-destructive/50'
  }
}

// ============================================================================
// ACTIVITY RAIL COMPONENTS (Consolidated - No Separate Files)
// ============================================================================

type Props = {
  items: ActivityItem[]
  onItemClick: (item: ActivityItem) => void
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

function ActivityRail({
  items, onItemClick, orientation='vertical', className
}: Props){
  const chain = useMemo(()=> items.slice(-8), [items])
  const isEmpty = chain.length === 0

  return (
    <div className={cn(
      'pointer-events-auto p-3 gap-2',
      'rounded-xl glass shadow-md',
      orientation==='vertical' ? 'flex flex-col' : 'flex flex-row',
      className
    )}>
      {isEmpty ? (
        <div className={cn(
          'flex items-center justify-center text-xs text-muted',
          orientation==='vertical' ? 'flex-col w-20 h-20' : 'flex-row px-4'
        )}>
          <div className="w-8 h-8 rounded-full bg-surface/50" />
          <span className="text-xs">No activity</span>
        </div>
      ) : (
        <div className={cn(
          'flex',
          orientation==='vertical' ? 'flex-col items-center' : 'flex-row items-center'
        )}>
          {chain.map((a,i)=>{
            const Icon = ICONS[a.type] ?? ICONS.ai_thinking
            const isLast = i === chain.length - 1
            const s = STATUS_STYLES[a.status]
            return (
              <div key={a.id} className={cn(
                'relative flex items-center group',
                orientation==='vertical' ? 'flex-col' : 'flex-row'
              )}>
                <button
                  type="button"
                  onClick={()=> onItemClick(a)}
                  className={cn(
                    'relative grid place-items-center rounded-full border transition-all duration-base ease-smooth',
                    s.dot,
                    s.ring ? s.ring : '',
                    'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent/40'
                  )}
                  aria-label={a.title}
                  title={a.title}
                >
                  <Icon className={cn('w-3.5 h-3.5', s.icon)} />
                </button>

                {!isLast && (
                  <div className={cn(
                    'relative',
                    orientation==='vertical'
                      ? 'w-px h-3 my-2'
                      : 'h-px w-3 mx-2'
                  )}>
                    <div className={cn('absolute inset-0 transition-all duration-base ease-smooth', s.line)} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function FixedRightVerticalProcessChain({
  activities, onActivityClick
}: { activities: ActivityItem[]; onActivityClick?: (i:ActivityItem)=>void }){
  const handleItemClick = onActivityClick || (() => {})
  return (
    <>
      {/* desktop right-center */}
      <div className="hidden md:block fixed right-4 top-1/2 -translate-y-1/2 z-50">
        <ActivityRail items={activities} onItemClick={handleItemClick} orientation="vertical" />
      </div>
      {/* mobile bottom-center */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <ActivityRail items={activities} onItemClick={handleItemClick} orientation="horizontal" />
      </div>
    </>
  )
}

// ============================================================================
// TYPES
// ============================================================================

type Stage = { id:string; label:string; done?:boolean; current?:boolean }

export function ChatSidebar({
  context,
  activityLog = [],
  stages = [],
  stageProgress,
  className
}:{
  context?: Record<string,unknown>
  activityLog?: ActivityItem[]
  stages?: Stage[]
  stageProgress?: number
  className?: string
}){
  return (
    <aside className={cn('h-full p-4 space-y-4 overflow-y-auto', className)}>
      {context && Object.keys(context).length>0 && (
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {Object.entries(context).slice(0,4).map(([k,v])=>(
              <div key={k} className="flex items-center justify-between text-xs">
                <span className="text-muted capitalize">{k.replace(/_/g,' ')}</span>
                <span className="text-foreground font-medium truncate ml-2 max-w-24">
                  {typeof v==='string' ? v : JSON.stringify(v).slice(0,24)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            AI Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(activityLog.slice(-5)).map(a=>(
            <div key={a.id} className="flex items-center gap-2 text-xs">
              <div className={cn(
                'w-2 h-2 rounded-full',
                a.status==='completed' && 'bg-success',
                a.status==='failed' && 'bg-error',
                a.status==='in_progress' && 'bg-accent animate-pulse',
                a.status==='pending' && 'bg-muted/40'
              )}/>
              <span className="text-muted truncate">{a.title}</span>
            </div>
          ))}
          {activityLog.length===0 && (
            <div className="text-xs text-muted text-center py-2">No recent activity</div>
          )}
        </CardContent>
      </Card>

      {stages.length>0 && (
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              Stages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stages.map(s=>(
                <div key={s.id}
                  className={cn(
                    'flex items-center gap-2 text-xs p-2 rounded-md border transition-all duration-base ease-smooth',
                    s.current ? 'bg-accent/10 border-accent/30' :
                    s.done ? 'bg-success/5 border-success/20' :
                    'border-border/50 hover:bg-surface/5'
                  )}
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    s.done ? 'bg-success' :
                    s.current ? 'bg-accent' : 'bg-muted/40'
                  )}/>
                  <span className={cn(
                    'truncate',
                    s.current ? 'text-accent font-medium' :
                    s.done ? 'text-green-400' : 'text-muted'
                  )}>{s.label}</span>
                  {s.current && <Badge variant="secondary" className="ml-auto">Current</Badge>}
                </div>
              ))}
            </div>

            {typeof stageProgress==='number' && (
              <div className="mt-3 pt-2 border-t border-border/40">
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>Progress</span>
                  <span>{Math.round(stageProgress)}%</span>
                </div>
                <div className="w-full bg-surface/5 rounded-full h-1.5">
                  <div className="bg-accent h-1.5 rounded-full transition-all duration-base ease-smooth"
                       style={{ width: `${stageProgress}%` }}/>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </aside>
  )
}

