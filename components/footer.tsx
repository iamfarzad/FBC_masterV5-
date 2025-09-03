"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function Footer() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Hide footer on mobile for chat routes to keep UI minimal per spec
  if (isMobile && pathname.startsWith('/chat')) return null
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-border/20 bg-background/50 mt-auto border-t backdrop-blur-sm">
      <div className="mx-auto w-full max-w-7xl px-2 py-6 sm:px-4 md:px-6 md:py-4">
        <div className="flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>&copy; {currentYear} F.B Consulting</span>
            <span className="hidden sm:inline">•</span>
            <Link href="/about" className="rounded px-1 transition-colors hover:text-foreground focus:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              About
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/contact" className="rounded px-1 transition-colors hover:text-foreground focus:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              Contact
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/legal" className="rounded px-1 transition-colors hover:text-foreground focus:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              Legal
            </Link>
          </div>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <a
              href="https://linkedin.com/in/farzadbayat"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded px-1 transition-colors hover:text-foreground focus:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              LinkedIn
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="mailto:hello@farzadbayat.com"
              className="rounded px-1 transition-colors hover:text-foreground focus:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              hello@farzadbayat.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
