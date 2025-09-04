'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogContent, DialogTitle } from '@/components/ui/dialog'
interface ConsentOverlayProps {
  isVisible: boolean
  onSubmit: (data: { name: string; email: string; companyUrl: string }) => void
  isLoading?: boolean
}

export function ConsentOverlay({ isVisible, onSubmit, isLoading = false }: ConsentOverlayProps) {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [companyUrl, setCompanyUrl] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim() && name.trim()) {
      onSubmit({
        name: name.trim(),
        email: email.trim(),
        companyUrl: companyUrl.trim() || undefined
      })
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" data-testid="consent-overlay">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Help us personalize your experience</CardTitle>
          <CardDescription>
            Share your contact details to get a personalized AI consultation experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Website (Optional)</Label>
              <Input
                id="company"
                type="url"
                placeholder="https://yourcompany.com"
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                data-testid="company-input"
              />
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading || !email.trim() || !name.trim()}
                className="w-full"
                data-testid="consent-allow"
              >
                {isLoading ? 'Processing...' : 'Continue'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}