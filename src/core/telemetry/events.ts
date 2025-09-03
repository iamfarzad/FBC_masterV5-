export type TelemetryEvent = {
  type: string
  sessionId?: string
  metadata?: Record<string, unknown>
}

export function fireAndForget(_event: TelemetryEvent) {
  // Minimal no-op stub; wire to real sink later
  if (process.env.NODE_ENV !== 'test') {
    // Debug log removed
  }
}


