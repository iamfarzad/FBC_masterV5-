import type React from "react"
import { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "F.B/c - AI-Powered Business Consulting | Transform Your Business with AI",
  description: "AI-powered business consulting platform. Transform your operations with intelligent automation and AI-driven insights. 10,000+ hours of proven results with Google Gemini AI.",
  keywords: [
    "AI consulting",
    "artificial intelligence",
    "business automation",
    "AI implementation",
    "machine learning",
    "chatbot development",
    "Farzad Bayat",
    "business intelligence",
    "AI strategy",
    "automation solutions"
  ],
  authors: [{ name: "Farzad Bayat" }],
  creator: "Farzad Bayat",
  publisher: "F.B/c AI Consulting",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fbconsulting.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "F.B/c - AI-Powered Business Consulting",
    description: "Transform your business with AI-powered automation and intelligent insights. 10,000+ hours of proven AI implementation experience.",
    url: "https://fbconsulting.com",
    siteName: "F.B/c AI Consulting",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "F.B/c AI Consulting Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "F.B/c - AI-Powered Business Consulting",
    description: "Transform your business with AI-powered automation and intelligent insights.",
    images: ["/og-image.jpg"],
    creator: "@farzadbayat",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    bing: "your-bing-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff5b04" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}