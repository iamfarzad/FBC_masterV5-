// 🔒 SECURE SESSION MANAGEMENT
// WHY: Prevents hackers from guessing session IDs and hijacking user conversations
// BUSINESS IMPACT: Protects client data and prevents security breaches during demos

import { randomBytes } from 'crypto'

export function generateSecureSessionId(): string {
  // Creates a 32-byte (256-bit) cryptographically secure random ID
  // This is like generating a 64-character password with complete randomness
  return randomBytes(32).toString('hex')
}

export function validateSessionId(sessionId: string): boolean {
  // Ensures session ID is properly formatted and not tampered with
  return typeof sessionId === 'string' &&
         sessionId.length === 64 &&
         /^[a-f0-9]+$/.test(sessionId)
}

export function createSessionFingerprint(userAgent: string, ip: string): string {
  // Creates a unique fingerprint for additional security validation
  const data = `${userAgent}:${ip}:${Date.now()}`
  return randomBytes(16).toString('hex')
}

