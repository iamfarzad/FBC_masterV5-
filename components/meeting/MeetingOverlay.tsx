"use client"

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface MeetingOverlayProps {
  open: boolean
  onClose: () => void
  username?: string
  event?: string
  title?: string
  description?: string
}

export function MeetingOverlay({
  open,
  onClose,
  username = 'farzad-bayat',
  event = '30min',
  title = 'Schedule a Call',
  description = 'Pick a time that works for you. You will receive a calendar invite with meeting details.',
}: MeetingOverlayProps) {
  // Ensure Cal.com embed script is present when opened
  React.useEffect(() => {
    if (!open) return
    const src = 'https://app.cal.com/embed/embed.js'
    const exists = Array.from(document.scripts).some(s => s.src === src)
    if (exists) return
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    document.body.appendChild(script)
    return () => {
      // keep script cached; no removal to avoid flicker on reopen
    }
  }, [open])

  const calUrl = `https://cal.com/${username}/${event}`

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="w-[96vw] max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="bg-background/60 relative mt-2 min-h-[560px] overflow-hidden rounded-xl border p-2 md:p-4">
          <div className="absolute right-3 top-3 z-10">
            <a href={calUrl} target="_blank" rel="noreferrer" className="bg-card/70 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
              Open in new tab
            </a>
          </div>
          {/* Cal.com inline embed */}
          {/* data-ui enables Cal.com default styles if available */}
          {/* @ts-expect-error - custom element */}
          <cal-inline data-ui="true" username={username} event={event} style={{ width: '100%', height: '560px' }} />
          {/* Hard fallback iframe to avoid blanks if custom element fails to hydrate */}
          <iframe
            title="Scheduler"
            src={`https://app.cal.com/${username}/${event}?embed=true`}
            style={{ position: 'absolute', inset: 8, width: 'calc(100% - 16px)', height: 'calc(100% - 16px)', borderRadius: 12, border: '1px solid hsl(var(--border))' }}
            loading="lazy"
          />
          {/* Fallback link in case both inline + iframe fail (very rare) */}
          <noscript>
            <a href={calUrl} target="_blank" rel="noreferrer">Open scheduler</a>
          </noscript>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MeetingOverlay


