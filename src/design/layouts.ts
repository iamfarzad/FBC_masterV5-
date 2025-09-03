/**
 * Layout Patterns
 * Consistent layout structures and patterns for the application
 */

import { componentClasses } from './components'

// Layout container patterns
export const layoutPatterns = {
  // Main app shell
  appShell: `
    min-h-screen bg-background
    flex flex-col
  `,

  // Page container
  pageContainer: `
    flex-1 container mx-auto
    px-4 sm:px-6 lg:px-8
    py-6 lg:py-8
  `,

  // Content wrapper
  contentWrapper: `
    max-w-7xl mx-auto
    space-y-8
  `,

  // Section wrapper
  section: `
    py-12 lg:py-16
    space-y-8
  `,

  // Grid layouts
  grid: {
    responsive: `
      grid gap-6
      grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
    `,
    twoColumn: `
      grid gap-8 lg:gap-12
      grid-cols-1 lg:grid-cols-2
      items-start
    `,
    threeColumn: `
      grid gap-6 lg:gap-8
      grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    `,
    sidebar: `
      grid gap-8 lg:gap-12
      grid-cols-1 lg:grid-cols-[240px_1fr]
      lg:grid-cols-[280px_1fr]
    `,
  },

  // Flex layouts
  flex: {
    center: `
      flex items-center justify-center
      min-h-[200px]
    `,
    between: `
      flex items-center justify-between
    `,
    column: `
      flex flex-col
      space-y-4
    `,
    row: `
      flex items-center
      space-y-0 space-x-4
    `,
  },

  // Chat specific layouts
  chat: {
    container: `
      flex flex-col h-full
      max-h-screen
    `,
    messages: `
      flex-1 overflow-hidden
      space-y-4 p-4
    `,
    input: `
      flex-shrink-0
      border-t bg-background/95 backdrop-blur
      p-4
    `,
    sidebar: `
      w-full lg:w-80 xl:w-96
      border-l bg-muted/30
      flex flex-col
    `,
  },

  // Form layouts
  form: {
    container: `
      space-y-6
      max-w-md mx-auto
    `,
    group: `
      space-y-2
    `,
    actions: `
      flex items-center justify-end
      space-x-4 pt-6
    `,
  },

  // Navigation layouts
  nav: {
    header: `
      sticky top-0 z-50
      border-b bg-background/95 backdrop-blur
      supports-[backdrop-filter]:bg-background/60
    `,
    mobileMenu: `
      fixed inset-0 z-50
      bg-background lg:hidden
    `,
    breadcrumb: `
      flex items-center space-x-2
      text-sm text-muted-foreground
    `,
  },

  // Modal and overlay layouts
  modal: {
    overlay: `
      fixed inset-0 z-50
      bg-background/80 backdrop-blur-sm
      flex items-center justify-center
      p-4
    `,
    content: `
      relative max-w-lg w-full
      bg-background rounded-lg shadow-lg
      border p-6
    `,
    header: `
      flex flex-col space-y-2
      pb-4
    `,
    footer: `
      flex items-center justify-end
      space-x-4 pt-6
    `,
  },

  // Dashboard layouts
  dashboard: {
    grid: `
      grid gap-6
      grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
    `,
    card: `
      rounded-xl border bg-card p-6
      transition-all hover:shadow-lg
    `,
    metric: `
      flex flex-col space-y-2
      p-6 rounded-xl border bg-card
    `,
  },

  // Error and empty state layouts
  states: {
    empty: `
      flex flex-col items-center justify-center
      text-center py-12
      space-y-4
    `,
    error: `
      flex flex-col items-center justify-center
      text-center py-12
      space-y-4
    `,
    loading: `
      flex items-center justify-center
      py-12
    `,
  },
} as const

// Layout composition helpers
export const layoutComposition = {
  // Page layout with header
  pageWithHeader: `
    ${layoutPatterns.appShell}
  `,

  // Page layout with sidebar
  pageWithSidebar: `
    ${layoutPatterns.appShell}
    lg:grid lg:grid-cols-[240px_1fr] lg:gap-8
  `,

  // Centered content layout
  centeredContent: `
    ${layoutPatterns.pageContainer}
    flex flex-col items-center justify-center
    min-h-[50vh]
  `,

  // Full width layout
  fullWidth: `
    w-full
    max-w-none
  `,

  // Constrained width layout
  constrainedWidth: `
    max-w-4xl mx-auto
  `,
} as const

// Responsive layout helpers
export const responsiveLayouts = {
  // Mobile-first stacked layout
  stackOnMobile: `
    flex flex-col
    lg:flex-row lg:items-start lg:justify-between
  `,

  // Desktop grid, mobile stack
  gridOnDesktop: `
    flex flex-col
    lg:grid lg:grid-cols-2 lg:gap-12
  `,

  // Hide on mobile, show on desktop
  desktopOnly: `
    hidden lg:block
  `,

  // Show on mobile, hide on desktop
  mobileOnly: `
    block lg:hidden
  `,

  // Responsive padding
  responsivePadding: `
    px-4 py-6
    sm:px-6 sm:py-8
    lg:px-8 lg:py-12
  `,
} as const

// Layout utility functions for programmatic usage
export const createLayoutClass = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}

export const createResponsiveLayout = (
  base: string,
  mobile?: string,
  tablet?: string,
  desktop?: string
) => {
  return [
    base,
    mobile && `sm:${mobile}`,
    tablet && `md:${tablet}`,
    desktop && `lg:${desktop}`,
  ].filter(Boolean).join(' ')
}

// Export all layout patterns
export const layoutClasses = {
  patterns: layoutPatterns,
  composition: layoutComposition,
  responsive: responsiveLayouts,
} as const

export type LayoutClasses = typeof layoutClasses

