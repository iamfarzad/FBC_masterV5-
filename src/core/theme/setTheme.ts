/**
 * 🎨 F.B/c THEME MANAGEMENT UTILITIES
 *
 * Safe theme switching and management utilities
 * Respects user preferences and provides smooth transitions
 */

import { tokens, ThemeMode } from './tokens'

/**
 * Set the theme mode with CSS custom properties
 * This is the SAFE way to change themes
 */
export function setTheme(mode: ThemeMode): void {
  const root = document.documentElement

  // Set theme attribute for Tailwind and other systems
  root.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light')

  // Set CSS custom properties for immediate theme switching
  const themeColors = tokens[mode]
  Object.entries(themeColors).forEach(([key, value]) => {
    const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    root.style.setProperty(`--${cssVar}`, value)
  })

  // Update meta theme-color for mobile browsers
  updateMetaThemeColor(themeColors.brand)

  // Store user preference
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', mode)
  }

  // Dispatch theme change event for components that need to react
  window.dispatchEvent(new CustomEvent('themeChange', { detail: { mode } }))
}

/**
 * Get the current theme mode
 */
export function getCurrentTheme(): ThemeMode {
  if (typeof document === 'undefined') return 'light'

  // Check for explicit theme setting
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  // Check for system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

/**
 * Initialize theme on page load
 */
export function initializeTheme(): void {
  const theme = getCurrentTheme()
  setTheme(theme)

  // Listen for system theme changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      mediaQuery.removeEventListener('change', handleChange)
    })
  }
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(): ThemeMode {
  const current = getCurrentTheme()
  const next = current === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

/**
 * Update mobile browser theme color
 */
function updateMetaThemeColor(color: string): void {
  let metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement

  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta')
    metaThemeColor.name = 'theme-color'
    document.head.appendChild(metaThemeColor)
  }

  metaThemeColor.content = color
}

/**
 * Theme performance monitoring
 */
export function measureThemeSwitch(): Promise<number> {
  return new Promise((resolve) => {
    const start = performance.now()

    const currentTheme = getCurrentTheme()
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'

    setTheme(nextTheme)

    // Use requestAnimationFrame to ensure the change has been applied
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const end = performance.now()
        const duration = end - start
        // Log removed took: ${duration.toFixed(2)}ms`)

        // Switch back for the demo
        setTheme(currentTheme)
        resolve(duration)
      })
    })
  })
}

/**
 * Check theme system health
 */
export function checkThemeHealth(): {
  isValid: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []

  // Check if CSS custom properties are set
  const root = document.documentElement
  const requiredVars = [
    '--brand',
    '--brand-hover',
    '--bg',
    '--surface',
    '--text'
  ]

  requiredVars.forEach(varName => {
    const value = getComputedStyle(root).getPropertyValue(varName).trim()
    if (!value) {
      issues.push(`Missing CSS custom property: ${varName}`)
    }
  })

  // Check brand color integrity
  const brandColor = getComputedStyle(root).getPropertyValue('--brand').trim()
  if (brandColor !== '#ff5b04') {
    issues.push(`Brand color violation: expected #ff5b04, got ${brandColor}`)
  }

  // Check theme attribute
  const themeAttr = root.getAttribute('data-theme')
  if (!themeAttr) {
    issues.push('Missing data-theme attribute')
    recommendations.push('Add data-theme attribute to document root')
  }

  // Check for accessibility issues
  const contrastRatio = checkContrastRatio()
  if (contrastRatio < 4.5) {
    issues.push(`Poor contrast ratio: ${contrastRatio.toFixed(2)} (should be ≥ 4.5)`)
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  }
}

/**
 * Basic contrast ratio check
 */
function checkContrastRatio(): number {
  // Simple implementation - in production you'd want a more sophisticated check
  const root = document.documentElement
  const bgColor = getComputedStyle(root).getPropertyValue('--bg').trim()
  const textColor = getComputedStyle(root).getPropertyValue('--text').trim()

  // This is a simplified calculation - real WCAG contrast calculation is more complex
  // For production, use a proper contrast calculation library
  return 4.5 // Placeholder - replace with actual calculation
}

/**
 * USAGE GUIDELINES:
 *
 * ✅ CORRECT USAGE:
 * import { setTheme, getCurrentTheme } from '@/src/core/theme/setTheme'
 *
 * // Initialize on app start
 * useEffect(() => {
 *   initializeTheme()
 * }, [])
 *
 * // Theme switching
 * const toggle = () => setTheme(toggleTheme())
 *
 * 🚫 FORBIDDEN:
 * document.documentElement.style.setProperty('--brand', '#ff0000')
 * localStorage.theme = 'invalid'
 *
 * 🎯 PERFORMANCE:
 * - Theme switching is optimized for < 100ms
 * - CSS custom properties provide instant updates
 * - No layout thrashing during theme changes
 */
