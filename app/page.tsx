"use client"

import { HeroSection } from '@/components/landing/HeroSection'
import { ServicesSection } from '@/components/landing/ServicesSection'
import { FeaturesShowcase } from '@/components/landing/FeaturesShowcase'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'
import { Navigation } from '@/components/landing/Navigation'
import { StructuredData } from './structured-data'

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <div className="min-h-screen bg-background">
        <Navigation />
        <main>
          <HeroSection />
          <ServicesSection />
          {/* <FeaturesShowcase /> */}
          <TestimonialsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  )
}