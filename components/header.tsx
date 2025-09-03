"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, Languages, Check } from "@/src/core/icon-mapping"
import { FbcIcon } from "@/components/ui/fbc-icon"
import { LanguageSelector } from "@/components/ui/language-selector"
import { useI18n } from "@/contexts/i18n-context"

const FbcLogo = ({ className }: { className?: string }) => (
  <span className={cn("font-bold text-brand drop-shadow-sm", className)}>
    F.B/c
  </span>
)
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from '@/lib/utils'
import { useState } from "react"

const navLinks = [
  { href: "/", key: "nav.home" },
  { href: "/consulting", key: "nav.consulting" },
  { href: "/about", key: "nav.about" },
  { href: "/workshop/video-to-app", key: "nav.workshop" },
  { href: "/contact", key: "nav.contact" },
]

export default function Header() {
  const pathname = usePathname()
  const { t, currentLanguage } = useI18n()

  const NavLinks = ({ className }: { className?: string }) => (
    <nav className={cn("flex items-center gap-3 md:gap-4 text-sm", className)}>
      {navLinks.map(({ href, key }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "transition-colors hover:text-foreground focus:text-foreground rounded inline-flex items-center px-3 py-2 min-h-[44px]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            pathname === href ? "text-foreground" : "text-foreground/90",
          )}
        >
          {t(key)}
        </Link>
      ))}
    </nav>
  )

  return (
    <header className="border-border/40 glass-header sticky top-0 z-50 w-full border-b">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-2 sm:px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="F.B/c Home">
          <FbcIcon variant="default" size={24} />
          <FbcLogo className="text-lg" />
        </Link>
        <div className="ml-10 hidden md:flex">
          <NavLinks />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <LanguageSelector variant="minimal" className="min-h-11 min-w-11" />
          <div className="inline-flex min-h-11 min-w-11 items-center justify-center">
            <ThemeToggle />
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="min-h-11 min-w-11">
                  <Menu className="size-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <div className="mt-6 p-4">
                  <NavLinks className="flex-col items-start gap-3" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
