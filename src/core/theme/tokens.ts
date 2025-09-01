/**
 * 🎨 F.B/c THEME TOKENS - IMMUTABLE BRAND COLORS
 *
 * 🚫 NEVER MODIFY BRAND COLORS WITHOUT APPROVAL 🚫
 * These tokens represent the F.B/c brand identity
 *
 * @version 2.0.0 - Consolidated with design tokens
 * @last-updated 2025-01-27
 */

export const tokens = {
  light: {
    // 🎨 IMMUTABLE BRAND COLORS - NEVER CHANGE
    brand: '#ff5b04',          // F.B/c Orange - THE BRAND
    brandHover: '#e65200',     // Orange hover state

    // 🌟 LIGHT THEME COLORS
    bg: '#f5f5f5',             // Light Silver background
    surface: '#ffffff',        // White surface
    surfaceElevated: '#e5e5e5', // Elevated surface

    text: '#111111',           // Primary text
    textMuted: '#666666',      // Muted text

    border: '#e5e5e5',        // Default border

    // 🎨 SEMANTIC COLORS (SAFE TO EXTEND)
    success: '#10b981',        // Green for success states
    warning: '#f59e0b',        // Amber for warning states
    error: '#ef4444',          // Red for error states
    info: '#3b82f6',           // Blue for info states
  },
  dark: {
    // 🎨 IMMUTABLE BRAND COLORS - NEVER CHANGE
    brand: '#ff5b04',          // F.B/c Orange - THE BRAND
    brandHover: '#e65200',     // Orange hover state

    // 🌙 DARK THEME COLORS
    bg: '#0b1620',             // Dark navy background
    surface: '#1d2a35',        // Dark surface
    surfaceElevated: '#1f2f3a', // Elevated dark surface

    text: '#e5e9ec',          // Light text
    textMuted: '#a0a5aa',      // Muted light text

    border: '#2a3a46',        // Dark border

    // 🎨 SEMANTIC COLORS (SAFE TO EXTEND)
    success: '#10b981',        // Green (same for dark)
    warning: '#f59e0b',        // Amber (same for dark)
    error: '#ef4444',          // Red (same for dark)
    info: '#60a5fa',           // Light blue for dark
  },
} as const

// 🎨 SEMANTIC COLOR TOKENS (HSL values for Tailwind hsl() function)
export const semanticColors = {
  light: {
    background: '0 0% 96%', // #f5f5f5
    foreground: '0 0% 10%', // #1a1a1a
    card: '0 0% 96%',
    'card-foreground': '0 0% 10%',
    popover: '0 0% 96%',
    'popover-foreground': '0 0% 10%',
    primary: '20 100% 51%', // #ff5b04
    'primary-foreground': '0 0% 100%',
    secondary: '0 0% 88%', // #e0e0e0
    'secondary-foreground': '0 0% 10%',
    muted: '0 0% 88%',
    'muted-foreground': '0 0% 40%', // #666666
    accent: '20 100% 51%',
    'accent-foreground': '0 0% 100%',
    destructive: '0 84% 60%',
    'destructive-foreground': '0 0% 98%',
    border: '0 0% 88%',
    input: '0 0% 96%',
    ring: '20 100% 51%',
  },
  dark: {
    background: '0 0% 10%', // #1a1a1a
    foreground: '0 0% 96%', // #f5f5f5
    card: '0 0% 16%', // #2a2a2a
    'card-foreground': '0 0% 96%',
    popover: '0 0% 16%',
    'popover-foreground': '0 0% 96%',
    primary: '20 100% 51%', // #ff5b04
    'primary-foreground': '0 0% 100%',
    secondary: '0 0% 16%',
    'secondary-foreground': '0 0% 96%',
    muted: '0 0% 16%',
    'muted-foreground': '0 0% 60%', // #999999
    accent: '20 100% 51%',
    'accent-foreground': '0 0% 100%',
    destructive: '0 84% 60%',
    'destructive-foreground': '0 0% 10%',
    border: '0 0% 16%',
    input: '0 0% 16%',
    ring: '20 100% 51%',
  },
} as const

// 📝 TYPOGRAPHY SCALE
export const typography = {
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    display: '"Inter", sans-serif',
    mono: 'system-ui, "SF Mono", Monaco, "Cascadia Code", monospace',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem' }], // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }], // 48px
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const

// 📏 SPACING SCALE (8px base)
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
  40: '10rem', // 160px
  48: '12rem', // 192px
  56: '14rem', // 224px
  64: '16rem', // 256px
} as const

// 🔲 BORDER RADIUS SCALE
export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const

// 🌑 SHADOW SCALE
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
} as const

// ✨ ANIMATION & TRANSITION TOKENS
export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const

// 🧩 COMPONENT SIZE TOKENS
export const componentSizes = {
  button: {
    height: {
      sm: '2.25rem', // 36px
      default: '2.5rem', // 40px
      lg: '2.75rem', // 44px
    },
    padding: {
      sm: '0.75rem 1rem', // 12px 16px
      default: '0.75rem 1.5rem', // 12px 24px
      lg: '0.875rem 2rem', // 14px 32px
    },
  },
  input: {
    height: {
      sm: '2.25rem', // 36px
      default: '2.5rem', // 40px
      lg: '3rem', // 48px
    },
  },
  card: {
    padding: {
      sm: '1rem', // 16px
      default: '1.5rem', // 24px
      lg: '2rem', // 32px
    },
  },
} as const

// 📐 Z-INDEX SCALE
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  banner: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
  toast: '1070',
} as const

// 📱 BREAKPOINTS (Tailwind defaults)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/**
 * Theme mode type
 */
export type ThemeMode = keyof typeof tokens

/**
 * Color token type
 */
export type ColorToken = keyof typeof tokens.light

/**
 * Get a specific color token for a theme
 */
export function getColor(mode: ThemeMode, token: ColorToken): string {
  return tokens[mode][token]
}

/**
 * Get all colors for a specific theme
 */
export function getThemeColors(mode: ThemeMode) {
  return tokens[mode]
}

/**
 * Get semantic colors for a theme (HSL values for Tailwind)
 */
export function getSemanticColors(mode: ThemeMode) {
  return semanticColors[mode]
}

/**
 * Export all design tokens as a single object for programmatic access
 */
export const designTokens = {
  colors: tokens,
  semanticColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  componentSizes,
  zIndex,
  breakpoints,
} as const

export type DesignTokens = typeof designTokens

/**
 * IMMUTABLE BRAND COLORS - These define the F.B/c identity
 * 🚫 NEVER CHANGE THESE VALUES 🚫
 */
export const BRAND_COLORS = {
  primary: '#ff5b04',      // F.B/c Orange - THE BRAND
  hover: '#e65200',        // Orange hover state
} as const

/**
 * Validate brand colors haven't been changed
 * This function can be used in tests or CI/CD to ensure brand integrity
 */
export function validateBrandColors(): boolean {
  const currentBrand = tokens.light.brand as string
  const currentHover = tokens.light.brandHover as string

  const expectedBrand = BRAND_COLORS.primary
  const expectedHover = BRAND_COLORS.hover

  if (currentBrand !== expectedBrand) {
    // eslint-disable-next-line no-console
    console.error(`🚨 BRAND COLOR VIOLATION: Expected ${expectedBrand}, got ${currentBrand}`)
    return false
  }

  if (currentHover !== expectedHover) {
    // eslint-disable-next-line no-console
    console.error(`🚨 BRAND HOVER COLOR VIOLATION: Expected ${expectedHover}, got ${currentHover}`)
    return false
  }

  return true
}

/**
 * Theme system metadata
 */
export const THEME_METADATA = {
  version: '1.0.0',
  lastUpdated: '2025-01-27',
  brandName: 'F.B/c',
  description: 'Professional AI consulting brand colors',
} as const

/**
 * USAGE GUIDELINES:
 *
 * ✅ CORRECT USAGE:
 * import { getColor, getSemanticColors, designTokens } from '@/src/core/theme/tokens'
 * const brandColor = getColor('light', 'brand')
 * const semanticColors = getSemanticColors('light')
 *
 * ✅ IN COMPONENTS:
 * <div style={{ backgroundColor: tokens.light.brand }}>
 *
 * ✅ WITH TAILWIND:
 * <div className="bg-brand hover:bg-brand-hover">
 *
 * ✅ DESIGN TOKENS:
 * import { typography, spacing, borderRadius } from '@/src/core/theme/tokens'
 * const fontSize = typography.fontSize.base
 * const padding = spacing[4]
 *
 * 🚫 FORBIDDEN:
 * const colors = { brand: '#ff0000' }  // Never redefine
 * tokens.light.brand = '#different'   // Never modify
 *
 * 🎯 BRAND PROTECTION:
 * - tokens.light.brand (#ff5b04) = F.B/c Orange - NEVER CHANGE
 * - tokens.light.brandHover (#e65200) = Orange hover - NEVER CHANGE
 * - All other colors can be extended safely
 *
 * 🎨 DESIGN SYSTEM FEATURES:
 * - Comprehensive typography scale with Inter font family
 * - Consistent spacing scale (8px base)
 * - Border radius and shadow scales
 * - Animation durations and easing functions
 * - Component size tokens for buttons, inputs, cards
 * - Z-index scale for layering
 * - Responsive breakpoints
 */
