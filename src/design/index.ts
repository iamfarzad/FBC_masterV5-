/**
 * Design System Index
 * Main entry point for the design system
 */

// Export all design tokens from theme system
export * from '../core/theme/tokens'

// Export component classes and patterns
export * from './components'
export * from './layouts'

// Avoid top-level name collisions with components (e.g., animationPresets)
export { animationSystem } from './animations'

// Note: ComponentClasses, LayoutClasses, and AnimationSystem types are already exported via wildcard

