"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { usePathname } from "next/navigation"
import type React from "react"

export function GlobalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // On /collab and /chat, suppress global chrome but still render children
  if (pathname?.startsWith("/collab") || pathname?.startsWith("/chat")) return <div>{children}</div>
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  )
}


