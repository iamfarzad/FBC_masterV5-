import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Navigation } from '@/components/navigation'
import { Toaster } from 'sonner'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

export const metadata: Metadata = {
  title: 'AI Studio Pro - Advanced Multimodal AI Platform',
  description: 'Experience next-generation AI with multimodal capabilities, intelligent automation, and powerful business tools',
  keywords: 'AI, machine learning, automation, multimodal, chat, video analysis, business intelligence',
  openGraph: {
    title: 'AI Studio Pro',
    description: 'Advanced Multimodal AI Platform',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            {/* Gradient Background */}
            <div className="fixed inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
              <div className="absolute inset-0 gradient-mesh" />
            </div>
            
            {/* Navigation */}
            <Navigation />
            
            {/* Main Content */}
            <main className="relative z-10">
              {children}
            </main>
          </div>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}