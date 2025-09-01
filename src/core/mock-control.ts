// Minimal mock control replacement
export function isMockEnabled(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.ENABLE_MOCKS === 'true'
}

export const mockControl = {
  isEnabled: isMockEnabled,
  forceReal: () => false,
  forceMock: () => false
}
