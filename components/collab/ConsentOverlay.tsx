"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ConsentOverlayProps {
  open: boolean
  email: string
  company: string
  onEmailChange: (v: string) => void
  onCompanyChange: (v: string) => void
  onAllow: () => void
  onDeny: () => void
  className?: string
}

export function ConsentOverlay({
  open,
  email,
  company,
  onEmailChange,
  onCompanyChange,
  onAllow,
  onDeny,
  className
}: ConsentOverlayProps) {
  if (!open) return null

  return (
    <div className={cn("fixed inset-0 z-[60] grid place-items-center bg-background/80 backdrop-blur p-4", className)}>
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Personalize this chat using your public company info?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We'll fetch from your company site and LinkedIn to ground results with citations.
            See our <a href="/privacy" className="underline hover:text-primary">Privacy & Terms</a>.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="work-email" className="text-sm font-medium">
              Work email
            </Label>
            <Input
              id="work-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-site" className="text-sm font-medium">
              Company website (optional)
            </Label>
            <Input
              id="company-site"
              type="url"
              placeholder="https://company.com"
              value={company}
              onChange={(e) => onCompanyChange(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onDeny}
            className="text-sm"
          >
            No thanks
          </Button>
          <Button
            onClick={onAllow}
            disabled={!email.trim()}
            className="text-sm"
          >
            Allow & Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
