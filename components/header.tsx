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
  { href: "/", label: "Home", key: "nav.home" },
  { href: "/chat", label: "AI Chat", key: "nav.chat" },
  { href: "/workshop", label: "Workshop", key: "nav.workshop" },
  { href: "/consulting", label: "Consulting", key: "nav.consulting" },
  { href: "/admin", label: "Admin", key: "nav.admin" },
  { href: "/contact", label: "Contact", key: "nav.contact" },
]

export default function Header() {
  const pathname = usePathname()
  const { t, currentLanguage } = useI18n()

  const NavLinks = ({ className }: { className?: string }) => (
    <nav className={cn("flex items-center gap-2 md:gap-3 text-sm", className)}>
      {navLinks.map(({ href, label, key }) => {
        const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative transition-all duration-300 hover:text-foreground focus:text-foreground rounded-lg inline-flex items-center px-3 py-2 min-h-[44px] group",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
              isActive 
                ? "text-foreground font-semibold" 
                : "text-foreground/60 hover:text-foreground/90",
            )}
          >
            <span className="relative z-10">
              {label}
            </span>
            {isActive && (
              <span className="absolute inset-0 bg-accent/10 rounded-lg animate-smooth-fade-in" />
            )}
            <span className={cn(
              "absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-accent to-primary transition-all duration-300",
              isActive ? "w-full" : "w-0 group-hover:w-full"
            )} />
          </Link>
        );
      })}
    </nav>
  )

  return (
    <header className="nav-enhanced sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 md:px-8">
        <Link href="/" className="flex items-center gap-3 group hover-lift-premium" aria-label="F.B/c Home">
          <FbcIcon variant="default" size={24} className="transition-transform group-hover:rotate-12" />
          <FbcLogo className="text-lg text-gradient-premium" />
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
