'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/src/core/utils'

// Shell layout variants
const shellVariants = cva(
  'min-h-screen bg-background text-foreground',
  {
    variants: {
      layout: {
        default: 'flex flex-col',
        grid: 'grid grid-rows-[auto_1fr_auto] min-h-screen',
        sidebar: 'grid grid-cols-[280px_1fr] grid-rows-[auto_1fr] min-h-screen',
        chat: 'grid grid-cols-[280px_1fr_320px] grid-rows-[64px_1fr_120px] min-h-screen max-w-[1440px] mx-auto'
      }
    },
    defaultVariants: {
      layout: 'default'
    }
  }
)

// Shell component parts
const shellHeaderVariants = cva(
  [
    'sticky top-0 z-50 w-full border-b border-border/20',
    'bg-background/95 backdrop-blur-xl',
    'flex items-center justify-between px-6 py-4'
  ]
)

const shellSidebarVariants = cva(
  [
    'border-r border-border/20 bg-card/50 backdrop-blur-sm',
    'overflow-y-auto p-6'
  ]
)

const shellMainVariants = cva(
  'flex-1 overflow-hidden',
  {
    variants: {
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
      }
    },
    defaultVariants: {
      padding: 'md'
    }
  }
)

const shellFooterVariants = cva(
  [
    'border-t border-border/20 bg-card/50 backdrop-blur-sm',
    'px-6 py-4'
  ]
)

// Main Shell Component
export interface ShellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shellVariants> {}

const Shell = React.forwardRef<HTMLDivElement, ShellProps>(
  ({ className, layout, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(shellVariants({ layout }), className)}
      {...props}
    >
      {children}
    </div>
  )
)
Shell.displayName = 'Shell'

// Shell Header
export type ShellHeaderProps = React.HTMLAttributes<HTMLElement>

const ShellHeader = React.forwardRef<HTMLElement, ShellHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(shellHeaderVariants(), className)}
      {...props}
    >
      {children}
    </header>
  )
)
ShellHeader.displayName = 'ShellHeader'

// Shell Sidebar
export type ShellSidebarProps = React.HTMLAttributes<HTMLElement>

const ShellSidebar = React.forwardRef<HTMLElement, ShellSidebarProps>(
  ({ className, children, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(shellSidebarVariants(), className)}
      {...props}
    >
      {children}
    </aside>
  )
)
ShellSidebar.displayName = 'ShellSidebar'

// Shell Main
export interface ShellMainProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof shellMainVariants> {}

const ShellMain = React.forwardRef<HTMLElement, ShellMainProps>(
  ({ className, padding, children, ...props }, ref) => (
    <main
      ref={ref}
      className={cn(shellMainVariants({ padding }), className)}
      {...props}
    >
      {children}
    </main>
  )
)
ShellMain.displayName = 'ShellMain'

// Shell Footer
export type ShellFooterProps = React.HTMLAttributes<HTMLElement>

const ShellFooter = React.forwardRef<HTMLElement, ShellFooterProps>(
  ({ className, children, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn(shellFooterVariants(), className)}
      {...props}
    >
      {children}
    </footer>
  )
)
ShellFooter.displayName = 'ShellFooter'

export {
  Shell,
  ShellHeader,
  ShellSidebar,
  ShellMain,
  ShellFooter,
  shellVariants
}