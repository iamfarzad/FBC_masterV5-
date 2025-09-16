'use client'

import React, { useState } from 'react'
import { ConsentOverlay } from '@/components/ui/consent-overlay'

interface ConsentGateProps {
  children: React.ReactNode
}

export default function ConsentGate({ children }: ConsentGateProps) {
  const [hasConsent, setHasConsent] = useState(true) // Default to true for now
  const [showConsent, setShowConsent] = useState(false)

  const handleConsentSubmit = async (data: { name: string; email: string; companyUrl: string }) => {
    console.log('Consent submitted:', data)
    setHasConsent(true)
    setShowConsent(false)
  }

  if (!hasConsent) {
    return (
      <ConsentOverlay
        isVisible={true}
        onSubmit={handleConsentSubmit}
      />
    )
  }

  return <>{children}</>
}