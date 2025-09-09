import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Business Intelligence - Lead Generation Platform',
  description: 'AI-powered lead generation and business intelligence platform with holographic design',
  keywords: ['AI', 'business intelligence', 'lead generation', 'automation', 'analytics'],
  authors: [{ name: 'F.B/c AI Assistant' }],
  creator: 'F.B/c AI Assistant',
  publisher: 'AI Business Intelligence',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'AI Business Intelligence Platform',
    description: 'Advanced AI-powered lead generation and business intelligence platform',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Business Intelligence Platform',
    description: 'Advanced AI-powered lead generation and business intelligence platform',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  )
}