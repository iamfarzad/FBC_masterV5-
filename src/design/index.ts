/**
 * Design System Index
 * Main entry point for the design system
 */

// Export all design tokens from theme system
export * from '../core/theme/tokens'

// Export component classes and patterns
export * from './components'
export * from './layouts'
export * from './animations'

// Re-export commonly used items for convenience
export { tokens } from '../core/theme/tokens'
export { componentClasses } from './components'
export { layoutClasses } from './layouts'
export { animationSystem } from './animations'

// Type exports
export type { DesignTokens } from './tokens'
export type { ComponentClasses } from './components'
export type { LayoutClasses } from './layouts'
export type { AnimationSystem } from './animations'

