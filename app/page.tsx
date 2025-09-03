'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Brain, 
  Zap, 
  Video, 
  MessageSquare, 
  Layers,
  ArrowRight,
  ChevronRight,
  Star,
  Users,
  Trophy,
  Rocket,
  Shield,
  Globe,
  BarChart3,
  Camera,
  Mic,
  FileText,
  Calculator
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Brain,
      title: 'Advanced AI Intelligence',
      description: 'Powered by cutting-edge neural networks and deep learning models',
      gradient: 'from-purple-500 to-pink-500',
      capabilities: ['Natural Language Processing', 'Computer Vision', 'Predictive Analytics']
    },
    {
      icon: Video,
      title: 'Multimodal Processing',
      description: 'Process text, images, video, and audio in a single platform',
      gradient: 'from-blue-500 to-cyan-500',
      capabilities: ['Video Analysis', 'Image Recognition', 'Speech Processing']
    },
    {
      icon: Zap,
      title: 'Real-time Performance',
      description: 'Lightning-fast responses with streaming capabilities',
      gradient: 'from-orange-500 to-red-500',
      capabilities: ['Stream Processing', 'Live Analysis', 'Instant Feedback']
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and privacy-first architecture',
      gradient: 'from-green-500 to-emerald-500',
      capabilities: ['End-to-End Encryption', 'GDPR Compliant', 'SOC 2 Certified']
    }
  ]

  const stats = [
    { value: '99.9%', label: 'Uptime', icon: Trophy },
    { value: '< 100ms', label: 'Response Time', icon: Zap },
    { value: '50M+', label: 'API Calls', icon: Globe },
    { value: '4.9/5', label: 'User Rating', icon: Star }
  ]

  const tools = [
    { icon: Camera, label: 'Webcam AI', color: 'bg-blue-500' },
    { icon: MessageSquare, label: 'Smart Chat', color: 'bg-purple-500' },
    { icon: Calculator, label: 'ROI Analysis', color: 'bg-green-500' },
    { icon: Mic, label: 'Voice AI', color: 'bg-red-500' },
    { icon: FileText, label: 'Document AI', color: 'bg-yellow-500' },
    { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-500' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [features.length])

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="container max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Next Generation AI Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-space-grotesk">
              <span className="text-gradient-animated">AI Studio Pro</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
              Experience the future of artificial intelligence with our advanced multimodal platform.
              Process, analyze, and generate content across text, images, video, and audio.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8">
                <Link href="/chat" className="flex items-center">
                  Start Creating
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 border-gray-600 hover:bg-gray-800">
                <Link href="/workshop" className="flex items-center">
                  Explore Workshop
                  <Layers className="ml-2" />
                </Link>
              </Button>
            </div>

            {/* Animated Tools Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-3xl mx-auto">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group cursor-pointer"
                >
                  <div className="glass rounded-2xl p-4 hover:scale-110 transition-all duration-300">
                    <div className={`${tool.color} rounded-xl p-3 mb-2 mx-auto w-fit`}>
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs text-gray-400">{tool.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full opacity-10 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full opacity-10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-space-grotesk">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to build the future with AI
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className={`group h-full hover-lift glass-dark border-gray-800 ${activeFeature === index ? 'ring-2 ring-purple-500' : ''}`}>
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5 mb-4`}>
                      <feature.icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.capabilities.map((cap) => (
                        <li key={cap} className="text-xs text-gray-500 flex items-center">
                          <ChevronRight className="w-3 h-3 mr-1 text-purple-500" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="glass-dark rounded-2xl p-6">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-dark rounded-3xl p-12"
          >
            <h2 className="text-4xl font-bold mb-4 font-space-grotesk">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of professionals using AI Studio Pro to accelerate their work
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Link href="/chat" className="flex items-center">
                  Get Started Free
                  <Rocket className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-gray-600 hover:bg-gray-800">
                <Link href="/workshop" className="flex items-center">
                  View Demo
                  <Users className="ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}