'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, MessageSquare, Wrench, BookOpen, Zap, Globe, Brain } from 'lucide-react'

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [animationLoaded, setAnimationLoaded] = useState(false)

  useEffect(() => {
    // Try to load anime.js dynamically with fallback
    const initAnimations = async () => {
      try {
        const animeModule = await import('animejs')
        const anime = animeModule.default || animeModule
        
        if (!anime || typeof anime.timeline !== 'function') {
          console.warn('Anime.js not loaded properly, using fallback animations')
          // Fallback to CSS animations
          document.querySelectorAll('.hero-title, .hero-subtitle, .hero-buttons, .feature-card').forEach(el => {
            el.classList.add('fade-in-animation')
          })
          return
        }

        setAnimationLoaded(true)
        
        // Initial animations on page load
        const timeline = anime.timeline({
          easing: 'easeOutExpo',
          duration: 1000
        })

        timeline
          .add({
            targets: '.hero-title',
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 800
          })
          .add({
            targets: '.hero-subtitle',
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 600
          }, '-=400')
          .add({
            targets: '.hero-buttons',
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 600
          }, '-=200')
          .add({
            targets: '.feature-card',
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 800
          }, '-=400')

        // Scroll-triggered animations
        const observerOptions = {
          threshold: 0.1,
          rootMargin: '0px'
        }

        const scrollObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              if (entry.target.classList.contains('animate-features')) {
                anime({
                  targets: entry.target.querySelectorAll('.feature-card'),
                  scale: [0.9, 1],
                  opacity: [0, 1],
                  translateY: [20, 0],
                  delay: anime.stagger(100),
                  duration: 800,
                  easing: 'easeOutExpo'
                })
              }
              
              if (entry.target.classList.contains('animate-cta')) {
                anime({
                  targets: entry.target,
                  scale: [0.95, 1],
                  opacity: [0, 1],
                  duration: 1000,
                  easing: 'easeOutElastic(1, .5)'
                })
              }
            }
          })
        }, observerOptions)

        if (featuresRef.current) {
          scrollObserver.observe(featuresRef.current)
        }
        if (ctaRef.current) {
          scrollObserver.observe(ctaRef.current)
        }

        // Parallax scroll effect
        const handleScroll = () => {
          const scrollY = window.scrollY
          
          if (heroRef.current) {
            anime({
              targets: heroRef.current,
              translateY: scrollY * 0.5,
              duration: 0,
              easing: 'linear'
            })
          }
        }

        window.addEventListener('scroll', handleScroll)

        // Cleanup
        return () => {
          window.removeEventListener('scroll', handleScroll)
          scrollObserver.disconnect()
        }
      } catch (error) {
        console.error('Failed to load animations:', error)
        // Fallback to CSS animations
        document.querySelectorAll('.hero-title, .hero-subtitle, .hero-buttons, .feature-card').forEach(el => {
          el.classList.add('fade-in-animation')
        })
      }
    }
    
    // Only run on client side
    if (typeof window !== 'undefined') {
      initAnimations()
    }
  }, [])

  return (
    <>
      <style jsx global>{`
        .fade-in-animation {
          animation: fadeIn 1s ease-out forwards;
          opacity: 1 !important;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section ref={heroRef} className="relative flex min-h-screen items-center justify-center px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="hero-title mb-6 text-6xl font-bold tracking-tight opacity-0">
              F.B/c
            </h1>
            <p className="hero-subtitle mb-8 text-xl text-muted-foreground opacity-0">
              Advanced AI Platform for Business Intelligence
            </p>
            <div className="hero-buttons flex justify-center gap-4 opacity-0">
              <Link href="/chat">
                <Button size="lg" className="gap-2">
                  Start Chat
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/workshop">
                <Button size="lg" variant="outline">
                  Explore Workshop
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="animate-features px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Platform Capabilities
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="feature-card opacity-0">
                <CardHeader>
                  <Brain className="mb-2 h-8 w-8" />
                  <CardTitle>AI Intelligence</CardTitle>
                  <CardDescription>
                    Powered by Google Gemini for advanced conversational AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Real-time responses with context awareness and multimodal capabilities
                  </p>
                </CardContent>
              </Card>

              <Card className="feature-card opacity-0">
                <CardHeader>
                  <MessageSquare className="mb-2 h-8 w-8" />
                  <CardTitle>Smart Chat</CardTitle>
                  <CardDescription>
                    Interactive conversations with persistent memory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Engage in natural dialogue with advanced language understanding
                  </p>
                </CardContent>
              </Card>

              <Card className="feature-card opacity-0">
                <CardHeader>
                  <Wrench className="mb-2 h-8 w-8" />
                  <CardTitle>Power Tools</CardTitle>
                  <CardDescription>
                    Suite of productivity tools at your fingertips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    From PDF generation to real-time translation and more
                  </p>
                </CardContent>
              </Card>

              <Card className="feature-card opacity-0">
                <CardHeader>
                  <BookOpen className="mb-2 h-8 w-8" />
                  <CardTitle>Workshop</CardTitle>
                  <CardDescription>
                    Interactive learning modules and tutorials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Master AI capabilities through hands-on exercises
                  </p>
                </CardContent>
              </Card>

              <Card className="feature-card opacity-0">
                <CardHeader>
                  <Globe className="mb-2 h-8 w-8" />
                  <CardTitle>Multi-language</CardTitle>
                  <CardDescription>
                    Communicate in any language seamlessly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Real-time translation and localization support
                  </p>
                </CardContent>
              </Card>

              <Card className="feature-card opacity-0">
                <CardHeader>
                  <Zap className="mb-2 h-8 w-8" />
                  <CardTitle>Lightning Fast</CardTitle>
                  <CardDescription>
                    Optimized for speed and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Instant responses with efficient processing
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="animate-cta bg-muted/30 px-4 py-20 opacity-0">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Experience the power of AI-driven intelligence today
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/chat">
                <Button size="lg" className="gap-2">
                  Launch Chat
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="lg" variant="outline">
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}