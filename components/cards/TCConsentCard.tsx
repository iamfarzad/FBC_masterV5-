"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
// Simplified inline consent card without external overlay

interface TCConsentCardProps {
  className?: string
  onConsentGranted?: (data: {
    name: string
    email: string
    company: string
    acceptedTerms: boolean
  }) => void
}

export function TCConsentCard({ className, onConsentGranted }: TCConsentCardProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !acceptedTerms) {
      return
    }

    if (onConsentGranted) {
      onConsentGranted({
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        acceptedTerms
      })
    }

    setSubmitted(true)
  }

  return (
    <>
      <Card className={cn("w-full max-w-md mx-auto", className)}>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Get Started</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Share a bit about yourself to personalize your AI experience
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Website (Optional)</Label>
              <Input
                id="company"
                type="url"
                placeholder="https://company.com"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                className="mt-1"
              />
              <div className="text-sm">
                <Label htmlFor="terms" className="cursor-pointer">
                  I agree to the{' '}
                  <a href="/terms" className="text-primary hover:underline">
                    Terms & Conditions
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!name.trim() || !email.trim() || !acceptedTerms}
            >
              Continue with AI Chat
            </Button>
          </form>
        </CardContent>
      </Card>

      {submitted && (
        <div className="text-center text-xs text-muted-foreground mt-3">
          Thanks! Preparing personalized insights…
        </div>
      )}
    </>
  )
}
