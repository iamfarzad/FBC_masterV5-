"use client"

import React from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  Workflow,
  GraduationCap,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Zap,
  Brain,
  Target,
  Calendar
} from 'lucide-react'

export function ServicesSection() {
  const services = [
    {
      id: 'consulting',
      title: 'AI Strategy Consulting',
      description: 'Comprehensive AI implementation roadmap tailored to your business needs and goals.',
      icon: Brain,
      features: [
        'Business process analysis',
        'AI opportunity identification',
        'ROI projections & timelines',
        'Implementation strategy',
        'Risk assessment & mitigation'
      ],
      metrics: {
        timeframe: '2-4 weeks',
        roi: '25-40%',
        complexity: 'High'
      },
      color: 'from-blue-500/20 to-purple-500/20',
      hoverColor: 'group-hover:from-blue-500/30 group-hover:to-purple-500/30'
    },
    {
      id: 'automation',
      title: 'Intelligent Automation',
      description: 'Deploy custom AI solutions including chatbots, copilots, and workflow automation.',
      icon: Bot,
      features: [
        'Custom chatbot development',
        'Workflow automation',
        'Data processing pipelines',
        'Integration with existing systems',
        'Performance monitoring'
      ],
      metrics: {
        timeframe: '4-8 weeks',
        roi: '40-60%',
        complexity: 'Medium'
      },
      color: 'from-green-500/20 to-teal-500/20',
      hoverColor: 'group-hover:from-green-500/30 group-hover:to-teal-500/30'
    },
    {
      id: 'workshops',
      title: 'AI Training Workshops',
      description: 'Hands-on training programs to empower your team with AI implementation skills.',
      icon: GraduationCap,
      features: [
        'AI fundamentals training',
        'Hands-on implementation',
        'Best practices & patterns',
        'Team enablement programs',
        'Ongoing support & resources'
      ],
      metrics: {
        timeframe: '1-2 weeks',
        roi: 'Long-term',
        complexity: 'Low'
      },
      color: 'from-orange-500/20 to-red-500/20',
      hoverColor: 'group-hover:from-orange-500/30 group-hover:to-red-500/30'
    }
  ]

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-500/20 text-green-700 border-green-500/30'
      case 'Medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
      case 'High': return 'bg-red-500/20 text-red-700 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30'
    }
  }

  return (
    <section id="services" className="py-24 bg-muted/30">
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
            <Target className="w-4 h-4 mr-2" />
            Proven AI Solutions
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Transform Your Business with
            <span className="block text-holographic">AI-Powered Solutions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From strategic consulting to hands-on implementation, I deliver comprehensive AI solutions
            that drive measurable business results.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${service.color} ${service.hoverColor}`}>
                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-70 transition-opacity" />

                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className={getComplexityColor(service.metrics.complexity)}>
                      {service.metrics.complexity}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                  {/* Features List */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                        className="flex items-center text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 glass-card rounded-lg">
                    <div className="text-center">
                      <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-sm font-medium">{service.metrics.timeframe}</div>
                      <div className="text-xs text-muted-foreground">Timeline</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-sm font-medium">{service.metrics.roi}</div>
                      <div className="text-xs text-muted-foreground">ROI</div>
                    </div>
                    <div className="text-center">
                      <DollarSign className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-sm font-medium text-green-600">High</div>
                      <div className="text-xs text-muted-foreground">Impact</div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    className="w-full group/btn"
                    variant="outline"
                    asChild
                  >
                    <Link href="#contact">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="glass-card rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <Zap className="w-12 h-12 mx-auto mb-6 text-primary" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Transform Your Business?
            </h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Let's discuss how AI can accelerate your business growth. Book a free consultation
              to explore customized solutions for your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="#contact">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Free Consultation
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/chat">
                  <Bot className="w-5 h-5 mr-2" />
                  Try AI Assistant
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
