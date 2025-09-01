/**
 * Component Base Classes
 * Consistent base styles for UI components using design tokens
 */

import { tokens } from '../core/theme/tokens'

// Base component classes for consistent styling
export const componentBase = {
  // Interactive elements
  button: `
    inline-flex items-center justify-center gap-2
    whitespace-nowrap rounded-md text-sm font-medium
    ring-offset-background transition-colors
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-50
    [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
  `,

  // Form elements
  input: `
    flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
    ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium
    placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
  `,

  // Layout containers
  card: `
    rounded-lg border bg-card text-card-foreground shadow-sm
    transition-all duration-200 focus-within:ring-2 focus-within:ring-accent/20 focus-within:ring-offset-2
  `,

  // Navigation
  nav: `
    flex items-center space-x-4 lg:space-x-6
    text-sm font-medium transition-colors hover:text-accent
  `,

  // Text elements
  heading: `
    font-semibold tracking-tight
    text-foreground
  `,

  // Interactive states
  interactive: `
    transition-all duration-200 ease-out
    hover:scale-[1.02] active:scale-[0.98]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-2
  `,
} as const

// Glass morphism variants
export const glassVariants = {
  subtle: `
    bg-background/60 backdrop-blur-md
    border border-border/20
    shadow-lg
  `,
  medium: `
    bg-background/70 backdrop-blur-lg
    border border-border/30
    shadow-xl
  `,
  strong: `
    bg-background/80 backdrop-blur-xl
    border border-border/40
    shadow-2xl
  `,
} as const

// Elevation variants
export const elevationVariants = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  default: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
} as const

// Spacing presets
export const spacingVariants = {
  none: '',
  xs: 'p-2',
  sm: 'p-4',
  default: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
} as const

// Text size variants
export const textVariants = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
} as const

// Color variants for semantic colors
export const colorVariants = {
  primary: 'text-primary bg-primary/10 border-primary/20',
  secondary: 'text-secondary bg-secondary/10 border-secondary/20',
  success: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
  error: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
  info: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
} as const

// Animation presets
export const animationPresets = {
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',
  slideIn: 'animate-in slide-in-from-bottom-2 duration-300',
  slideOut: 'animate-out slide-out-to-bottom-2 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-200',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
} as const

// Utility classes for common patterns
export const utilityClasses = {
  // Focus management
  focusRing: `
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-2
  `,

  // Screen reader only
  srOnly: `
    absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap
    border-0 [clip:rect(0,0,0,0)]
  `,

  // Scrollbar hiding
  hideScrollbar: `
    scrollbar-hide
    [-ms-overflow-style:none]
    [scrollbar-width:none]
  `,

  // Text truncation
  truncate: `
    truncate
    overflow-hidden whitespace-nowrap
  `,

  // Flex utilities
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-center justify-start',
  flexEnd: 'flex items-center justify-end',
} as const

// Responsive utilities
export const responsiveUtils = {
  // Mobile-first responsive text
  responsiveText: `
    text-sm sm:text-base lg:text-lg
  `,

  // Responsive padding
  responsivePadding: `
    p-4 sm:p-6 lg:p-8
  `,

  // Responsive grid
  responsiveGrid: `
    grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4
  `,
} as const

// Export all component classes
export const componentClasses = {
  base: componentBase,
  glass: glassVariants,
  elevation: elevationVariants,
  spacing: spacingVariants,
  text: textVariants,
  color: colorVariants,
  animation: animationPresets,
  utility: utilityClasses,
  responsive: responsiveUtils,
} as const

export type ComponentClasses = typeof componentClasses
