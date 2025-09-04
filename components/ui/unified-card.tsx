"use client"

import * as React from "react"
import { motion, type Variants } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from '@/lib/utils'
import { motionPresets, transitionPresets } from '@/src/core/motion/unified-variants'

const unifiedCardVariants = cva(
  "relative overflow-hidden rounded-2xl border transition-all duration-300 focus-within:ring-2 focus-within:ring-accent/20 focus-within:ring-offset-2 focus-within:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-card/90 border-border/20 backdrop-blur-sm",
        glass: "bg-card/60 border-border/10 backdrop-blur-xl shadow-2xl before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none",
        elevated: "bg-card border-border/20 shadow-2xl hover:shadow-3xl hover:-translate-y-2 hover:border-accent/30",
        minimal: "bg-card/80 border-border/30 backdrop-blur-sm",
        neu: "bg-card/90 border-border/20 backdrop-blur-sm shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.05)]",
        glow: "bg-card/80 border-accent/20 backdrop-blur-sm shadow-[0_0_20px_rgba(var(--accent),0.15)]"
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10"
      },
      interactive: {
        none: "",
        hover: "hover:scale-[1.02] cursor-pointer",
        press: "hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      },
      animation: {
        none: "",
        fade: "",
        slideUp: "",
        scale: "",
        card: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: "none",
      animation: "none"
    },
  }
)

export interface UnifiedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof unifiedCardVariants> {
  asChild?: boolean
  motionKey?: string
  enableHover?: boolean
  glowColor?: string
}

const UnifiedCard = React.forwardRef<HTMLDivElement, UnifiedCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    interactive, 
    animation,
    asChild = false,
    motionKey,
    enableHover = false,
    glowColor,
    children,
    style,
    ...props 
  }, ref) => {
    // Select animation variant
    const getAnimationVariant = (): Variants => {
      switch (animation) {
        case 'fade': return motionPresets.fade
        case 'slideUp': return motionPresets.slideUp
        case 'scale': return motionPresets.scale
        case 'card': return motionPresets.card
        default: return {}
      }
    }

    // Custom glow effect style
    const glowStyle = glowColor ? {
      boxShadow: `0 0 20px ${glowColor}40, 0 0 40px ${glowColor}20`,
      ...style
    } : style

    const cardClasses = cn(unifiedCardVariants({ variant, size, interactive, className }))

    if (animation !== 'none') {
      return (
        <motion.div
          ref={ref}
          key={motionKey}
          className={cardClasses}
          style={glowStyle}
          variants={getAnimationVariant()}
          initial="initial"
          animate="animate"
          exit="exit"
          whileHover={enableHover ? "hover" : undefined}
          transition={transitionPresets.default}
          {...props}
        >
          {children}
        </motion.div>
      )
    }

    if (asChild) {
      return (
        <div ref={ref} className={cardClasses} style={glowStyle} {...props}>
          {children}
        </div>
      )
    }

    return (
      <div ref={ref} className={cardClasses} style={glowStyle} {...props}>
        {children}
      </div>
    )
  }
)
UnifiedCard.displayName = "UnifiedCard"

// Specialized card components using the unified base
export const GlassCard = React.forwardRef<HTMLDivElement, Omit<UnifiedCardProps, 'variant'>>(
  (props, ref) => <UnifiedCard ref={ref} variant="glass" {...props} />
)
GlassCard.displayName = "GlassCard"

export const ElevatedCard = React.forwardRef<HTMLDivElement, Omit<UnifiedCardProps, 'variant'>>(
  (props, ref) => <UnifiedCard ref={ref} variant="elevated" interactive="hover" {...props} />
)
ElevatedCard.displayName = "ElevatedCard"

export const MotionCard = React.forwardRef<HTMLDivElement, Omit<UnifiedCardProps, 'animation'>>(
  (props, ref) => <UnifiedCard ref={ref} animation="card" enableHover {...props} />
)
MotionCard.displayName = "MotionCard"

export const GlowCard = React.forwardRef<HTMLDivElement, Omit<UnifiedCardProps, 'variant'>>(
  (props, ref) => <UnifiedCard ref={ref} variant="glow" {...props} />
)
GlowCard.displayName = "GlowCard"

// Header, Content, Footer components remain the same for compatibility
export const UnifiedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
UnifiedCardHeader.displayName = "UnifiedCardHeader"

export const UnifiedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
UnifiedCardTitle.displayName = "UnifiedCardTitle"

export const UnifiedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
UnifiedCardDescription.displayName = "UnifiedCardDescription"

export const UnifiedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
UnifiedCardContent.displayName = "UnifiedCardContent"

export const UnifiedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
UnifiedCardFooter.displayName = "UnifiedCardFooter"

export { 
  UnifiedCard, 
  unifiedCardVariants,
  type UnifiedCardProps 
}