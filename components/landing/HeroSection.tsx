"use client"

import React from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, TrendingUp, Target, Zap, ArrowRight, Play } from 'lucide-react'

export function HeroSection() {
  // Prevent hydration issues with server-side rendering
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
        <div className="animate-pulse text-center">
          <div className="w-32 h-32 mx-auto bg-muted rounded-full mb-8"></div>
          <div className="h-12 bg-muted rounded-lg mb-4"></div>
          <div className="h-6 bg-muted rounded mb-8"></div>
          <div className="flex gap-4 justify-center">
            <div className="w-32 h-12 bg-muted rounded"></div>
            <div className="w-32 h-12 bg-muted rounded"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 effect-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      {/* Floating Elements */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/30 rounded-full"
          style={{
            left: `${15 + i * 10}%`,
            top: `${20 + (i % 4) * 15}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Badge
            variant="outline"
            className="px-4 py-2 glass-button text-sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            10,000+ Hours of AI Implementation Experience
          </Badge>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-6 mb-12"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Transform Your Business with
            <span className="block text-holographic mt-2">
              AI-Powered Intelligence
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
          >
            Stop wasting time on manual processes. Deploy intelligent automation solutions
            that scale with your business and deliver measurable ROI within weeks.
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Button
            size="lg"
            className="px-8 py-4 text-lg h-auto group"
            asChild
          >
            <Link href="/chat">
              <Brain className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Experience AI Chat
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="px-8 py-4 text-lg h-auto glass-button group"
            asChild
          >
            <Link href="#services">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Link>
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { number: "500+", label: "Businesses Automated", icon: "TrendingUp" },
            { number: "85%", label: "Average ROI Increase", icon: "Target" },
            { number: "24/7", label: "AI Support Available", icon: "Brain" },
            { number: "10K+", label: "AI Implementation Hours", icon: "Zap" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="glass-card rounded-xl p-6 text-center group hover:scale-105 transition-transform"
            >
              {stat.icon === "TrendingUp" && <TrendingUp className="w-8 h-8 mx-auto mb-3 text-primary group-hover:rotate-12 transition-transform" />}
              {stat.icon === "Target" && <Target className="w-8 h-8 mx-auto mb-3 text-primary group-hover:rotate-12 transition-transform" />}
              {stat.icon === "Brain" && <Brain className="w-8 h-8 mx-auto mb-3 text-primary group-hover:rotate-12 transition-transform" />}
              {stat.icon === "Zap" && <Zap className="w-8 h-8 mx-auto mb-3 text-primary group-hover:rotate-12 transition-transform" />}
              <div className="text-2xl md:text-3xl font-bold text-holographic mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent pointer-events-none" />
    </section>
  )
}
