'use client'

import { useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export type CanvasWorkspaceProps = {
  open: boolean
  title?: string
  onClose: () => void
  left?: React.ReactNode
  consoleArea?: React.ReactNode
  children: React.ReactNode
  compact?: boolean
}

export function CanvasWorkspace({ open, title = 'Canvas', onClose, left, consoleArea, children, compact }: CanvasWorkspaceProps) {
  const isMobile = useIsMobile()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="bg-background fixed inset-0 z-[70] backdrop-blur-sm">
      {/* Toolbar */}
      <div className={compact ? "flex h-10 items-center justify-between border-b px-2" : "flex h-12 items-center justify-between border-b px-3"}>
        <div className="flex items-center gap-2">
          <div className={compact ? "size-1.5 rounded-full bg-accent" : "size-2 rounded-full bg-accent"} />
          <span className={compact ? "text-xs font-medium" : "text-sm font-medium"}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isMobile && left ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size={compact ? "sm" : "sm"}>Details</Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88vw] max-w-[420px]">
                <div className="h-full overflow-auto p-2 text-sm">{left}</div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button variant="ghost" size="icon" aria-label="Open in new window" title="Open in new window">
              <ExternalLink className="size-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" aria-label="Close canvas" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </div>
      {/* Body with resizable panels */}
      <div className={compact ? "h-[calc(100%-2.5rem)] w-full overflow-hidden p-2" : "h-[calc(100%-3rem)] w-full overflow-hidden p-3"}>
        {isMobile ? (
          <div className="flex h-full flex-col gap-3">
            <div className="flex-1 overflow-hidden rounded-md border bg-background">
              {children}
            </div>
            {consoleArea ? (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full">Console</Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 max-h-[30vh] overflow-auto rounded-md border bg-card p-2 text-xs">
                  {consoleArea}
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </div>
        ) : (
          <PanelGroup direction="vertical" className="size-full rounded-lg border bg-card">
            <Panel defaultSize={80} minSize={60}>
              <PanelGroup direction="horizontal" className="size-full">
                {left ? (
                  <Panel defaultSize={26} minSize={18} maxSize={36} className="max-md:min-w-[220px] max-md:max-w-[280px]">
                    <div className="size-full overflow-auto border-r p-3 text-sm md:text-xs">
                      {left}
                    </div>
                  </Panel>
                ) : null}
                {left ? <PanelResizeHandle className="bg-border/60 w-1 hover:bg-border" /> : null}
                <Panel minSize={50}>
                  <div className="size-full overflow-hidden p-1 md:p-3">
                    <div className="size-full min-h-[60vh] rounded-md border bg-background md:min-h-0">
                      {children}
                    </div>
                  </div>
                </Panel>
              </PanelGroup>
            </Panel>
            {consoleArea ? <PanelResizeHandle className="bg-border/60 h-1 hover:bg-border" /> : null}
            {consoleArea ? (
              <Panel defaultSize={20} minSize={12}>
                <div className="size-full overflow-auto border-t p-2 text-xs md:p-3">
                  {consoleArea}
                </div>
              </Panel>
            ) : null}
          </PanelGroup>
        )}
      </div>
    </div>
  )
}


