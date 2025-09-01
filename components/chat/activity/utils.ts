/**
 * Format duration helper for activity timestamps
 */
export function formatDuration(timestamp?: Date | string): string {
  if (!timestamp) return ''

  try {
    const dateObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    if (isNaN(dateObj.getTime())) return ''

    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const seconds = Math.floor(diff / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  } catch (error) {
    console.warn('Invalid timestamp format:', timestamp)
    return ''
  }
}
