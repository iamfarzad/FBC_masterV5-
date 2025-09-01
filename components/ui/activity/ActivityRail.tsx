'use client'
import React, { useMemo } from 'react'
import { ICONS, STATUS_STYLES, ActivityStatus, ActivityType } from './constants'
import { cn } from '@/src/core/utils'

export type ActivityItem = {
  id: string
  type: ActivityType
  title: string
  description?: string
  status: ActivityStatus
  timestamp: number
}

type Props = {
  items: ActivityItem[]
  onItemClick: (item: ActivityItem) => void
  orientation?: 'vertical' | 'horizontal'
  className?: string
  tooltip?: (item: ActivityItem) => React.ReactNode // allow custom tooltip later
}

export function ActivityRail({
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
                  onClick={()=> onItemClick?.(a)}
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

/* Fixed placement wrapper */
export function FloatingActivityRail({
  items, onItemClick
}: { items: ActivityItem[]; onItemClick?: (i:ActivityItem)=>void }){
  const handleItemClick = onItemClick || (() => {})
  return (
    <>
      {/* desktop right-center */}
      <div className="hidden md:block fixed right-4 top-1/2 -translate-y-1/2 z-50">
        <ActivityRail items={items} onItemClick={handleItemClick} orientation="vertical" />
      </div>
      {/* mobile bottom-center */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <ActivityRail items={items} onItemClick={handleItemClick} orientation="horizontal" />
      </div>
    </>
  )
}
