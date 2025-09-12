"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bot,
  MessageSquare,
  Calculator,
  FileText,
  Camera,
  Monitor,
  Zap,
  ArrowRight,
  Play,
  Code,
  BarChart3,
  Globe,
  Mic
} from 'lucide-react'

export function FeaturesShowcase() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  const features = [
    {
      id: 'chat',
      title: 'AI Chat Assistant',
      description: 'Natural language conversations with business intelligence',
      icon: MessageSquare,
      demo: 'chat',
      capabilities: [
        'Business strategy consulting',
        'Market analysis & insights',
        'ROI calculations & projections',
        'Competitive intelligence',
        'Decision support & recommendations'
      ],
      metrics: { accuracy: '95%', speed: '<2s', languages: '50+' }
    },
    {
      id: 'automation',
      title: 'Workflow Automation',
      description: 'Intelligent process automation and optimization',
      icon: Bot,
      demo: 'automation',
      capabilities: [
        'Document processing & analysis',
        'Data extraction & insights',
        'Report generation',
        'Email automation',
        'Task prioritization'
      ],
      metrics: { efficiency: '70%', time: '-60%', cost: '-40%' }
    },
    {
      id: 'multimodal',
      title: 'Multimodal Intelligence',
      description: 'Process text, voice, images, and video simultaneously',
      icon: Camera,
      demo: 'multimodal',
      capabilities: [
        'Real-time video analysis',
        'Voice-to-text processing',
        'Screen capture & analysis',
        'Document scanning',
        'Visual data extraction'
      ],
      metrics: { modalities: '5', accuracy: '92%', speed: '<1s' }
    },
    {
      id: 'analytics',
      title: 'Business Analytics',
      description: 'Advanced data analysis and predictive insights',
      icon: BarChart3,
      demo: 'analytics',
      capabilities: [
        'Financial modeling & forecasting',
        'Trend analysis & predictions',
        'Performance optimization',
        'Risk assessment',
        'Scenario planning'
      ],
      metrics: { insights: '1000+', accuracy: '88%', predictions: '90%' }
    }
  ]

  const demoContent = {
    chat: {
      title: "AI Business Consultant",
      messages: [
        { role: 'user', content: 'How can I optimize my customer acquisition cost?' },
        { role: 'ai', content: "Based on industry benchmarks, your CAC of $150 is 40% above optimal. Here's how to optimize:\n\n1. **Content Marketing**: Shift 30% of budget to SEO-focused content\n2. **Referral Program**: Implement automated referral incentives\n3. **Landing Page Optimization**: A/B test conversion rates\n4. **Email Automation**: Nurture leads with personalized sequences\n\nProjected ROI: 35% CAC reduction within 6 months." },
        { role: 'user', content: 'Show me the ROI calculation' },
        { role: 'ai', content: "Here's the detailed ROI breakdown:\n\n**Current Metrics:**\n- Monthly CAC: $150\n- Customer Lifetime Value: $2,400\n- Conversion Rate: 2.1%\n\n**Optimization Impact:**\n- CAC Reduction: 35% → $97.50\n- Conversion Increase: 25% → 2.625%\n- Monthly Savings: $3,975\n\n**6-Month Projection:**\n- Total Savings: $23,850\n- ROI: 247%\n- Payback Period: 2.8 months" }
      ]
    },
    automation: {
      title: "Intelligent Document Processing",
      steps: [
        '📄 Scanning business documents...',
        '🔍 Extracting key financial data...',
        '📊 Analyzing trends and patterns...',
        '📈 Generating insights report...',
        '✅ Automation recommendations complete'
      ]
    },
    multimodal: {
      title: "Real-time Video Analysis",
      status: 'Active',
      insights: [
        '🎯 Body language confidence: 85%',
        '💬 Speech clarity: 92%',
        '⚡ Engagement level: High',
        '📊 Presentation effectiveness: 88%'
      ]
    },
    analytics: {
      title: "Predictive Business Intelligence",
      metrics: [
        { label: 'Revenue Growth', value: '+24%', trend: 'up' },
        { label: 'Customer Retention', value: '87%', trend: 'up' },
        { label: 'Cost Efficiency', value: '-18%', trend: 'up' },
        { label: 'Market Share', value: '+12%', trend: 'up' }
      ]
    }
  }

  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Advanced AI Capabilities
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Experience the Power of
            <span className="block text-holographic">AI-Driven Intelligence</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how our AI systems process complex business data, generate insights,
            and drive actionable recommendations in real-time.
          </p>
        </motion.div>

        {/* Interactive Demo */}
        <div className="mb-16">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              {features.map((feature) => (
                <TabsTrigger
                  key={feature.id}
                  value={feature.id}
                  className="flex flex-col items-center gap-2 py-4"
                >
                  <feature.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{feature.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {features.map((feature) => (
              <TabsContent key={feature.id} value={feature.id}>
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Feature Info */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card className="h-full">
                      <CardContent className="p-8">
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
                            <feature.icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>

                        <div className="space-y-4 mb-6">
                          <h4 className="font-semibold text-lg">Key Capabilities:</h4>
                          <ul className="space-y-2">
                            {feature.capabilities.map((capability, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center"
                              >
                                <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                                {capability}
                              </motion.li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-3 gap-4 p-4 glass-card rounded-lg">
                          {Object.entries(feature.metrics).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <div className="text-2xl font-bold text-primary">{value}</div>
                              <div className="text-sm text-muted-foreground capitalize">{key}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Interactive Demo */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Card className="h-full">
                      <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xl font-bold">
                            {demoContent[feature.demo as keyof typeof demoContent]?.title || 'Live Demo'}
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveDemo(feature.demo)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Run Demo
                          </Button>
                        </div>

                        <div className="glass-card rounded-lg p-6 min-h-[300px] flex items-center justify-center">
                          {feature.demo === 'chat' && (
                            <div className="space-y-4 w-full">
                              {demoContent.chat.messages.map((message, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.2 }}
                                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className={`max-w-[80%] p-3 rounded-lg ${
                                    message.role === 'user'
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted'
                                  }`}>
                                    <pre className="text-sm whitespace-pre-wrap font-sans">
                                      {message.content}
                                    </pre>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}

                          {feature.demo === 'automation' && (
                            <div className="space-y-4 w-full">
                              {demoContent.automation.steps.map((step, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.3 }}
                                  className="flex items-center p-3 glass-button rounded-lg"
                                >
                                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                                  </div>
                                  {step}
                                </motion.div>
                              ))}
                            </div>
                          )}

                          {feature.demo === 'multimodal' && (
                            <div className="text-center space-y-6">
                              <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                                <Camera className="w-8 h-8 text-primary" />
                              </div>
                              <div className="space-y-3">
                                {demoContent.multimodal.insights.map((insight, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-card p-3 rounded-lg"
                                  >
                                    {insight}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                          {feature.demo === 'analytics' && (
                            <div className="space-y-4 w-full">
                              {demoContent.analytics.metrics.map((metric, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center justify-between p-4 glass-card rounded-lg"
                                >
                                  <span className="font-medium">{metric.label}</span>
                                  <div className="flex items-center">
                                    <span className={`text-lg font-bold ${
                                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {metric.value}
                                    </span>
                                    <TrendingUp className={`w-4 h-4 ml-2 ${
                                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                    }`} />
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="glass-card border-0 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <Code className="w-12 h-12 mx-auto mb-6 text-primary" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Deploy These Capabilities?
              </h3>
              <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
                Experience the full power of AI-driven business intelligence.
                Start with a free consultation and see how these capabilities can transform your operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="#contact">
                    <Zap className="w-5 h-5 mr-2" />
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/chat">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Try AI Chat
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
