
// Unified CSS animation generator
export const UnifiedAnimations = {
  // Generate pulse animation
  pulse: (name: string, scale = 1.05, opacity = 0.7) => `
@keyframes ${name} {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: ${opacity};
    transform: scale(${scale});
  }
}
`,

  // Generate shimmer animation
  shimmer: (name: string) => `
@keyframes ${name} {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}
`,

  // Generate float animation
  float: (name: string, distance = 10, rotation = 1) => `
@keyframes ${name} {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  33% { 
    transform: translateY(-${distance}px) rotate(${rotation}deg); 
  }
  66% { 
    transform: translateY(${distance/2}px) rotate(-${rotation}deg); 
  }
}
`,

  // Generate glow animation
  glow: (name: string, opacity = 0.5) => `
@keyframes ${name} {
  0%, 100% { 
    opacity: 1; 
  }
  50% { 
    opacity: ${opacity}; 
  }
}
`,

  // Generate utility classes
  utilities: () => `
.animate-modern-pulse {
  animation: modernPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-modern-shimmer {
  animation: modernShimmer 2s linear infinite;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}
`
}

// Export all animations as CSS string
export function generateUnifiedAnimationsCSS(): string {
  return `
/* ===========================================
   UNIFIED ANIMATION SYSTEM
   =========================================== */
   
${UnifiedAnimations.pulse('modernPulse')}
${UnifiedAnimations.shimmer('modernShimmer')}
${UnifiedAnimations.float('float')}
${UnifiedAnimations.glow('glow')}
${UnifiedAnimations.utilities()}
`
}
