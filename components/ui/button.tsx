import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from '@/src/core/utils'

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Enhanced default with glass effect
        default: "gradient-brand text-surface hover:scale-[1.02] hover:shadow-glow hover:shadow-lg active:scale-[0.98]",

        // Glass morphism variants
        glass: "glass text-text shadow-lg hover:bg-white/20 hover:shadow-xl dark:hover:bg-white/10",
        "glass-dark": "glass-dark text-text hover:bg-white/10 dark:hover:bg-white/5",

        // Premium variants
        luxe: "gradient-brand shadow-luxe hover:shadow-luxe-dark text-surface hover:scale-[1.02] active:scale-[0.98]",
        glow: "border-brand/30 border bg-brand text-surface shadow-glow hover:shadow-lg",

        // Enhanced destructive
        destructive: "hover:bg-error/90 bg-error text-surface shadow-md hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",

        // Glass outline
        outline: "border-brand/30 hover:bg-brand/10 hover:border-brand/50 border-2 bg-transparent text-brand backdrop-blur-sm",

        // Enhanced secondary
        secondary: "border-border/50 border bg-surface-elevated text-text shadow-sm hover:bg-surface hover:shadow-md",

        // Ghost with enhanced interactions
        ghost: "text-text-muted hover:bg-surface-elevated hover:text-text hover:shadow-sm",

        // Link with better styling
        link: "text-brand underline-offset-4 hover:text-brand-hover hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1.5 text-xs",
        lg: "h-12 px-6 py-3 text-base",
        xl: "h-14 px-8 py-4 text-lg",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
      animation: {
        none: "",
        shimmer: "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        pulse: "animate-pulse",
        glow: "animate-glow-pulse",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, loadingText, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="-ml-1 mr-2 size-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
