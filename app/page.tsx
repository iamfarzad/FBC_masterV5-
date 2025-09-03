'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, MessageSquare, Wrench, BookOpen, Zap, Globe, Brain } from 'lucide-react'
const anime = require('animejs')

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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

    return () => {
      window.removeEventListener('scroll', handleScroll)
      scrollObserver.disconnect()
    }
  }, [])

  return (
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
                  Powered by advanced language models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Natural conversations with context awareness and multi-turn dialogue support.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card opacity-0">
              <CardHeader>
                <MessageSquare className="mb-2 h-8 w-8" />
                <CardTitle>Real-time Chat</CardTitle>
                <CardDescription>
                  Instant responses with streaming
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Experience seamless conversations with real-time message streaming.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card opacity-0">
              <CardHeader>
                <Wrench className="mb-2 h-8 w-8" />
                <CardTitle>Business Tools</CardTitle>
                <CardDescription>
                  ROI calculator and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Professional tools for business analysis and decision making.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card opacity-0">
              <CardHeader>
                <BookOpen className="mb-2 h-8 w-8" />
                <CardTitle>Workshop Modules</CardTitle>
                <CardDescription>
                  Interactive learning experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive educational modules for AI understanding.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card opacity-0">
              <CardHeader>
                <Globe className="mb-2 h-8 w-8" />
                <CardTitle>Multimodal Input</CardTitle>
                <CardDescription>
                  Text, voice, and image support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Process various input types for comprehensive analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card opacity-0">
              <CardHeader>
                <Zap className="mb-2 h-8 w-8" />
                <CardTitle>WebSocket Live</CardTitle>
                <CardDescription>
                  Real-time collaboration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Live updates and synchronized experiences across sessions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="animate-cta px-4 py-20 opacity-0">
        <div className="mx-auto max-w-4xl text-center">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg">
                Experience the power of advanced AI today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chat">
                <Button size="lg" className="gap-2">
                  Launch Platform
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}