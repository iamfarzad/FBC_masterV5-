import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import "@/styles/polish.css"
import "@/styles/media-tools.css"
import "@/styles/ultra-polish.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DemoSessionProvider } from "@/components/demo-session-manager"
import { GlobalChrome } from "@/components/GlobalChrome"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { I18nProvider } from "@/contexts/i18n-context"
import { cn } from "@/lib/utils"
import { StructuredData } from "./structured-data"
import { MeetingProvider } from "@/components/providers/meeting-provider"
import { CanvasProvider } from "@/components/providers/canvas-provider"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

// Client component for dynamic language handling
function RootLayoutClient({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <I18nProvider>
      <TooltipProvider>
        <MeetingProvider>
          <CanvasProvider>
            <DemoSessionProvider>
              <GlobalChrome>
                <main className="min-h-screen page-transition">
                  {children}
                </main>
                <Toaster />
              </GlobalChrome>
            </DemoSessionProvider>
          </CanvasProvider>
        </MeetingProvider>
      </TooltipProvider>
    </I18nProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // SSR flash fix: set theme before CSS loads
  const themeInit = `
    try {
      const pref = localStorage.getItem('fbc-theme');
      const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const mode = pref || sys;
      document.documentElement.setAttribute('data-theme', mode);
    } catch {}
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={cn("font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
  title: {
    default: "F.B/c AI Consulting - Farzad Bayat",
    template: "%s | F.B/c AI Consulting"
  },
  description: "AI consulting and automation expert Farzad Bayat delivers practical AI solutions, chatbots, and workflow automation.",
  keywords: ["AI consulting", "automation", "chatbots", "AI expert", "Farzad Bayat"],
  authors: [{ name: "Farzad Bayat" }],
  metadataBase: new URL('https://farzadbayat.com'),
  openGraph: {
    type: 'website',
    title: 'F.B/c AI Consulting - Farzad Bayat',
    description: 'AI consulting and automation expert delivering practical AI solutions.',
    siteName: 'F.B/c AI Consulting',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'F.B/c AI Consulting - Farzad Bayat',
    description: 'AI consulting and automation expert delivering practical AI solutions.',
  },
  robots: {
    index: true,
    follow: true,
  }
}
