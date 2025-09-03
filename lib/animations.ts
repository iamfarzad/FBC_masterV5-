/**
 * Anime.js Animation Library
 * Smooth, performant animations for the F.B/c platform
 */

import anime from 'animejs'

// Page transition animations
export const pageTransition = {
  fadeIn: (targets: string | HTMLElement) => {
    return anime({
      targets,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      easing: 'easeOutQuart'
    })
  },

  slideIn: (targets: string | HTMLElement, direction: 'left' | 'right' | 'up' | 'down' = 'up') => {
    const translateMap = {
      left: ['100%', '0%'],
      right: ['-100%', '0%'],
      up: ['30px', '0px'],
      down: ['-30px', '0px']
    }
    
    const axis = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY'
    
    return anime({
      targets,
      [axis]: translateMap[direction],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutQuart'
    })
  },

  stagger: (targets: string | HTMLElement) => {
    return anime({
      targets,
      opacity: [0, 1],
      translateY: [30, 0],
      delay: anime.stagger(100, { start: 200 }),
      duration: 600,
      easing: 'easeOutQuart'
    })
  }
}

// Button and interactive element animations
export const interactiveAnimations = {
  pulse: (targets: string | HTMLElement) => {
    return anime({
      targets,
      scale: [1, 1.05, 1],
      duration: 400,
      easing: 'easeInOutQuad'
    })
  },

  ripple: (targets: string | HTMLElement) => {
    return anime({
      targets,
      scale: [0, 2],
      opacity: [1, 0],
      duration: 600,
      easing: 'easeOutQuart'
    })
  },

  buttonHover: (targets: string | HTMLElement) => {
    return anime({
      targets,
      scale: 1.05,
      duration: 200,
      easing: 'easeOutQuart'
    })
  },

  buttonClick: (targets: string | HTMLElement) => {
    return anime({
      targets,
      scale: [1, 0.95, 1.02, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    })
  }
}

// Text animations
export const textAnimations = {
  typewriter: (targets: string | HTMLElement, text: string) => {
    const element = typeof targets === 'string' ? document.querySelector(targets) : targets
    if (!element) return
    
    element.textContent = ''
    const letters = text.split('')
    
    letters.forEach((letter, index) => {
      setTimeout(() => {
        element.textContent += letter
      }, 50 * index)
    })
  },

  letterReveal: (targets: string | HTMLElement) => {
    return anime.timeline()
      .add({
        targets: `${targets} .letter`,
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(30),
        duration: 400,
        easing: 'easeOutQuart'
      })
  },

  gradient: (targets: string | HTMLElement) => {
    return anime({
      targets,
      backgroundPosition: ['0% 50%', '100% 50%'],
      duration: 3000,
      easing: 'linear',
      loop: true
    })
  }
}

// Loading and progress animations
export const loadingAnimations = {
  spinner: (targets: string | HTMLElement) => {
    return anime({
      targets,
      rotate: '360deg',
      duration: 1000,
      easing: 'linear',
      loop: true
    })
  },

  progressBar: (targets: string | HTMLElement, progress: number) => {
    return anime({
      targets,
      width: `${progress}%`,
      duration: 600,
      easing: 'easeInOutQuart'
    })
  },

  skeleton: (targets: string | HTMLElement) => {
    return anime({
      targets,
      opacity: [0.5, 1, 0.5],
      duration: 1500,
      easing: 'linear',
      loop: true
    })
  }
}

// Card and container animations
export const containerAnimations = {
  expandCard: (targets: string | HTMLElement) => {
    return anime({
      targets,
      scale: [0.95, 1],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutQuart'
    })
  },

  collapseCard: (targets: string | HTMLElement) => {
    return anime({
      targets,
      scale: [1, 0.95],
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInQuart'
    })
  },

  flip: (targets: string | HTMLElement) => {
    return anime({
      targets,
      rotateY: '180deg',
      duration: 600,
      easing: 'easeInOutQuart'
    })
  },

  shake: (targets: string | HTMLElement) => {
    return anime({
      targets,
      translateX: [0, -10, 10, -10, 10, 0],
      duration: 500,
      easing: 'easeInOutQuad'
    })
  }
}

// Special effects
export const specialEffects = {
  glow: (targets: string | HTMLElement, color: string = '#ff5b04') => {
    return anime({
      targets,
      boxShadow: [
        `0 0 0 0 ${color}00`,
        `0 0 20px 5px ${color}40`,
        `0 0 0 0 ${color}00`
      ],
      duration: 1500,
      easing: 'easeInOutQuad',
      loop: true
    })
  },

  float: (targets: string | HTMLElement) => {
    return anime({
      targets,
      translateY: [-5, 5],
      duration: 2000,
      easing: 'easeInOutSine',
      loop: true,
      direction: 'alternate'
    })
  },

  parallax: (targets: string | HTMLElement, scrollY: number) => {
    return anime({
      targets,
      translateY: scrollY * 0.5,
      duration: 0,
      easing: 'linear'
    })
  }
}

// Notification and alert animations
export const notificationAnimations = {
  slideInNotification: (targets: string | HTMLElement) => {
    return anime({
      targets,
      translateX: ['100%', '0%'],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutQuart'
    })
  },

  slideOutNotification: (targets: string | HTMLElement) => {
    return anime({
      targets,
      translateX: ['0%', '100%'],
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInQuart'
    })
  },

  bounce: (targets: string | HTMLElement) => {
    return anime({
      targets,
      translateY: [0, -20, 0],
      duration: 500,
      easing: 'easeOutBounce'
    })
  }
}

// Chart and data visualization animations
export const dataAnimations = {
  countUp: (targets: string | HTMLElement, start: number, end: number) => {
    const obj = { value: start }
    return anime({
      targets: obj,
      value: end,
      duration: 1500,
      easing: 'easeOutQuart',
      round: 1,
      update: () => {
        const element = typeof targets === 'string' ? document.querySelector(targets) : targets
        if (element) element.textContent = String(obj.value)
      }
    })
  },

  chartBar: (targets: string | HTMLElement) => {
    return anime({
      targets,
      scaleY: [0, 1],
      duration: 800,
      delay: anime.stagger(100),
      easing: 'easeOutQuart'
    })
  },

  chartLine: (targets: string | HTMLElement) => {
    return anime({
      targets,
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 2000,
      easing: 'easeInOutQuart'
    })
  }
}

// Morphing animations
export const morphAnimations = {
  morph: (targets: string | HTMLElement, path: string) => {
    return anime({
      targets,
      d: path,
      duration: 600,
      easing: 'easeInOutQuart'
    })
  },

  colorMorph: (targets: string | HTMLElement, colors: string[]) => {
    return anime({
      targets,
      backgroundColor: colors,
      duration: 2000,
      easing: 'linear',
      loop: true,
      direction: 'alternate'
    })
  }
}

// Utility function to apply animations on element visibility
export const animateOnScroll = (selector: string, animation: Function) => {
  if (typeof window === 'undefined') return
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animation(entry.target)
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })
  
  const elements = document.querySelectorAll(selector)
  elements.forEach(el => observer.observe(el))
}

// Initialize all animations
export const initializeAnimations = () => {
  if (typeof window === 'undefined') return
  
  // Animate page transitions
  animateOnScroll('.animate-fade-in', pageTransition.fadeIn)
  animateOnScroll('.animate-slide-in', pageTransition.slideIn)
  animateOnScroll('.animate-stagger', pageTransition.stagger)
  
  // Animate cards
  animateOnScroll('.animate-card', containerAnimations.expandCard)
  
  // Animate floating elements
  document.querySelectorAll('.animate-float').forEach(el => {
    specialEffects.float(el as HTMLElement)
  })
  
  // Animate glowing elements
  document.querySelectorAll('.animate-glow').forEach(el => {
    specialEffects.glow(el as HTMLElement)
  })
}