"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, MicOff } from "lucide-react"

export interface QuickAction {
  id: string
  label: string
  onClick: () => void
}

interface BottomDockProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  disabled?: boolean
  quick?: QuickAction[]
  className?: string
  rightArea?: React.ReactNode
  status?: 'submitted' | 'streaming' | 'error'
  errorMessage?: string
}

export function BottomDock({
  value,
  onChange,
  onSend,
  disabled,
  quick = [],
  className,
  rightArea,
  status,
  errorMessage
}: BottomDockProps) {
  return (
    <div className={cn("border-t bg-background/80 backdrop-blur", className)}>
      <div className="p-4">
        {/* Quick Actions */}
        {quick.length > 0 && (
          <div className="flex gap-2 mb-3">
            {quick.slice(0, 4).map(q => (
              <Button
                key={q.id}
                variant="ghost"
                size="sm"
                onClick={q.onClick}
                className="text-xs"
              >
                {q.label}
              </Button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              placeholder="Type your message..."
              value={value}
              onChange={e => onChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (!disabled) onSend()
                }
              }}
              disabled={disabled || status === 'submitted'}
              className={cn(
                "min-h-[44px] max-h-32 resize-none",
                status === 'error' && "border-destructive"
              )}
              rows={1}
            />
            {errorMessage && (
              <p className="text-sm text-destructive mt-1">{errorMessage}</p>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-end gap-2">
            {rightArea}
            <Button
              onClick={onSend}
              disabled={disabled || !value.trim() || status === 'submitted'}
              size="sm"
              className="h-11 w-11 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status */}
        {status === 'streaming' && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            AI is thinking...
          </div>
        )}
      </div>
    </div>
  )
}
