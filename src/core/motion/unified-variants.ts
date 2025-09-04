
import { Variants } from 'framer-motion'

// Base timing and easing constants
export const TIMINGS = {
  fast: 0.15,
  default: 0.2,
  smooth: 0.3,
  slow: 0.5
} as const

export const EASINGS = {
  linear: [0, 0, 1, 1],
  out: [0, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  inOut: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  smooth: [0.25, 0.46, 0.45, 0.94]
} as const

// Common animation variants
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const slideDownVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
}

export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
}

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 }
}

// Voice-specific animations
export const voiceOrbVariants: Variants = {
  idle: {
    scale: 1,
    opacity: 0.7
  },
  listening: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: EASINGS.inOut
    }
  },
  speaking: {
    scale: [1, 1.2, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: EASINGS.bounce
    }
  }
}

// Card animations
export const cardVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: TIMINGS.smooth,
      ease: EASINGS.out
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.95,
    transition: {
      duration: TIMINGS.fast,
      ease: EASINGS.in
    }
  },
  hover: {
    y: -2,
    scale: 1.02,
    transition: {
      duration: TIMINGS.fast,
      ease: EASINGS.out
    }
  }
}

// Button animations
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: TIMINGS.fast, ease: EASINGS.out }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1, ease: EASINGS.out }
  }
}

// Loading animations
export const loadingVariants: Variants = {
  pulse: {
    animate: {
      opacity: [1, 0.5, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: EASINGS.inOut
      }
    }
  },
  spin: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: EASINGS.linear
      }
    }
  },
  bounce: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: EASINGS.bounce
      }
    }
  }
}

// Stagger animations
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

// Chat bubble animations
export const chatBubbleVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: TIMINGS.smooth,
      ease: EASINGS.out
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: -20,
    transition: {
      duration: TIMINGS.fast,
      ease: EASINGS.in
    }
  }
}

// Overlay animations
export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: TIMINGS.default, ease: EASINGS.out }
  },
  exit: { 
    opacity: 0,
    transition: { duration: TIMINGS.fast, ease: EASINGS.in }
  }
}

// Page transitions
export const pageVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: TIMINGS.smooth,
      ease: EASINGS.out
    }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: {
      duration: TIMINGS.fast,
      ease: EASINGS.in
    }
  }
}

// Unified motion presets
export const motionPresets = {
  fade: fadeVariants,
  slideUp: slideUpVariants,
  slideDown: slideDownVariants,
  scale: scaleVariants,
  modal: modalVariants,
  card: cardVariants,
  button: buttonVariants,
  voiceOrb: voiceOrbVariants,
  chatBubble: chatBubbleVariants,
  overlay: overlayVariants,
  page: pageVariants,
  loading: loadingVariants,
  stagger: { container: staggerContainer, item: staggerItem }
} as const

export type MotionPreset = keyof typeof motionPresets

// Transition presets
export const transitionPresets = {
  fast: { duration: TIMINGS.fast, ease: EASINGS.out },
  default: { duration: TIMINGS.default, ease: EASINGS.out },
  smooth: { duration: TIMINGS.smooth, ease: EASINGS.smooth },
  bounce: { duration: TIMINGS.smooth, ease: EASINGS.bounce },
  slow: { duration: TIMINGS.slow, ease: EASINGS.inOut }
} as const

export type TransitionPreset = keyof typeof transitionPresets
