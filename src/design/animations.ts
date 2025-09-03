/**
 * Animation & Motion System
 * Consistent animation patterns and motion design tokens
 */

import { tokens } from '../core/theme/tokens'

// Animation duration tokens
export const animationDurations = {
  instant: '0ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '700ms',
} as const

// Animation easing functions
export const animationEasings = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const

// Animation keyframes for complex animations
export const animationKeyframes = {
  // Fade animations
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  fadeOut: {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },

  // Slide animations
  slideInFromBottom: {
    from: { transform: 'translateY(100%)', opacity: '0' },
    to: { transform: 'translateY(0)', opacity: '1' },
  },
  slideInFromTop: {
    from: { transform: 'translateY(-100%)', opacity: '0' },
    to: { transform: 'translateY(0)', opacity: '1' },
  },
  slideInFromLeft: {
    from: { transform: 'translateX(-100%)', opacity: '0' },
    to: { transform: 'translateX(0)', opacity: '1' },
  },
  slideInFromRight: {
    from: { transform: 'translateX(100%)', opacity: '0' },
    to: { transform: 'translateX(0)', opacity: '1' },
  },

  // Scale animations
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: '0' },
    to: { transform: 'scale(1)', opacity: '1' },
  },
  scaleOut: {
    from: { transform: 'scale(1)', opacity: '1' },
    to: { transform: 'scale(0.95)', opacity: '0' },
  },

  // Float animation
  float: {
    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
    '33%': { transform: 'translateY(-10px) rotate(1deg)' },
    '66%': { transform: 'translateY(5px) rotate(-1deg)' },
  },

  // Shimmer effect
  shimmer: {
    '0%': { backgroundPosition: '-200px 0' },
    '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
  },

  // Pulse glow
  pulseGlow: {
    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
    '50%': { opacity: '0.8', transform: 'scale(1.05)' },
  },

  // Bounce
  bounce: {
    '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
    '40%, 43%': { transform: 'translate3d(0,-30px,0)' },
    '70%': { transform: 'translate3d(0,-15px,0)' },
    '90%': { transform: 'translate3d(0,-4px,0)' },
  },
} as const

// Animation preset classes
export const animationPresets = {
  // Entry animations
  fadeIn: `animate-in fade-in duration-300`,
  fadeInFast: `animate-in fade-in duration-150`,
  fadeInSlow: `animate-in fade-in duration-500`,

  slideInUp: `animate-in slide-in-from-bottom-4 duration-300`,
  slideInDown: `animate-in slide-in-from-top-4 duration-300`,
  slideInLeft: `animate-in slide-in-from-left-4 duration-300`,
  slideInRight: `animate-in slide-in-from-right-4 duration-300`,

  scaleIn: `animate-in zoom-in-95 duration-200`,
  scaleInSlow: `animate-in zoom-in-95 duration-400`,

  // Exit animations
  fadeOut: `animate-out fade-out duration-300`,
  slideOutUp: `animate-out slide-out-to-top-4 duration-300`,
  slideOutDown: `animate-out slide-out-to-bottom-4 duration-300`,
  scaleOut: `animate-out zoom-out-95 duration-200`,

  // Continuous animations
  float: `animate-float`,
  pulse: `animate-pulse`,
  pulseSlow: `animate-pulse-slow`,
  bounce: `animate-bounce`,
  bounceSlow: `animate-bounce-slow`,
  spin: `animate-spin`,
  shimmer: `animate-shimmer`,

  // Hover animations
  hoverLift: `transition-transform duration-200 hover:scale-105`,
  hoverGlow: `transition-all duration-300 hover:shadow-lg hover:shadow-accent/20`,
  hoverRotate: `transition-transform duration-200 hover:rotate-3`,
} as const

// Motion variants for Framer Motion
export const motionVariants = {
  // Container variants
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },

  // Item variants
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  },

  // Card variants
  card: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 17,
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 17,
      },
    },
  },

  // Button variants
  button: {
    initial: { scale: 1 },
    hover: {
      scale: 1.02,
      transition: { type: 'spring', stiffness: 400, damping: 17 },
    },
    tap: {
      scale: 0.98,
      transition: { type: 'spring', stiffness: 400, damping: 17 },
    },
  },

  // Modal variants
  modal: {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    content: {
      initial: { opacity: 0, scale: 0.95, y: 20 },
      animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 24,
        },
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: { duration: 0.2 },
      },
    },
  },

  // Navigation variants
  nav: {
    initial: { y: -100, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  },

  // List item variants
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  },
} as const

// Transition presets
export const transitionPresets = {
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 24,
  },
  springFast: {
    type: 'spring',
    stiffness: 400,
    damping: 17,
  },
  springSlow: {
    type: 'spring',
    stiffness: 200,
    damping: 30,
  },
  tween: {
    type: 'tween',
    duration: 0.3,
    ease: animationEasings.smooth,
  },
  tweenFast: {
    type: 'tween',
    duration: 0.15,
    ease: animationEasings.inOut,
  },
} as const

// Utility functions for creating animations
export const createAnimationClass = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}

export const createKeyframes = (name: string, keyframes: Record<string, Record<string, string>>) => {
  return `@keyframes ${name} {
    ${Object.entries(keyframes)
      .map(([key, styles]) => `${key} { ${Object.entries(styles).map(([prop, value]) => `${prop}: ${value}`).join('; ')} }`)
      .join('\n    ')}
  }`
}

// Export all animation system components
export const animationSystem = {
  durations: animationDurations,
  easings: animationEasings,
  keyframes: animationKeyframes,
  presets: animationPresets,
  motionVariants,
  transitions: transitionPresets,
} as const

export type AnimationSystem = typeof animationSystem
