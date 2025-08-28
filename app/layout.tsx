import type React from "react"
import { Inter, Rajdhani, Space_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MeetingProvider } from "@/components/providers/meeting-provider"
import { DemoSessionProvider } from "@/components/demo-session-manager"
import { GlobalChrome } from "@/components/GlobalChrome"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PermissionManager } from "@/components/permissions/PermissionManager"
import { cn } from "@/src/core/utils"
import { StructuredData } from "./structured-data"
import { CanvasProvider } from "@/components/providers/canvas-provider"
import { ModuleProgressProvider } from "@/hooks/workshop/use-module-progress"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontDisplay = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
})

const fontMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // We can't use usePathname in server components, but we can detect chat route
  // The chat route will be handled by the GlobalChrome component logic

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
      <body className={cn("font-sans antialiased", fontSans.variable, fontDisplay.variable, fontMono.variable)}>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <DemoSessionProvider>
              <MeetingProvider>
                <CanvasProvider>
                  <ModuleProgressProvider>
                    <GlobalChrome>
                      <div className="min-h-screen relative">
                        {children}
                      </div>
                      <Toaster />
                      <PermissionManager />
                    </GlobalChrome>
                  </ModuleProgressProvider>
                </CanvasProvider>
              </MeetingProvider>
            </DemoSessionProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
  title: {
    default: "Farzad Bayat - AI Consulting & Automation Expert | Practical AI Solutions",
    template: "%s | Farzad Bayat AI Consulting"
  },
  description: "AI consultant Farzad Bayat delivers practical AI automation, chatbots, and workflow solutions. 10,000+ hours of real-world AI implementation experience.",
  keywords: [
    "AI consulting",
    "AI automation", 
    "AI consultant",
    "business AI",
    "AI implementation",
    "chatbot development",
    "AI workshops",
    "workflow automation",
    "AI copilot",
    "Farzad Bayat"
  ],
  authors: [{ name: "Farzad Bayat" }],
  creator: "Farzad Bayat",
  publisher: "Farzad Bayat",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://farzadbayat.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://farzadbayat.com',
    title: 'Farzad Bayat - AI Consulting & Automation Expert',
    description: 'AI consultant Farzad Bayat delivers practical AI automation, chatbots, and workflow solutions. 10,000+ hours of real-world AI implementation experience.',
    siteName: 'Farzad Bayat AI Consulting',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Farzad Bayat - AI Consulting Expert',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Farzad Bayat - AI Consulting & Automation Expert',
    description: 'AI consultant Farzad Bayat delivers practical AI automation, chatbots, and workflow solutions.',
    images: ['/og-image.jpg'],
    creator: '@farzadbayat',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  generator: 'Next.js'
};
