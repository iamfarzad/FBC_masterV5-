"use client"

import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Star,
  Quote,
  TrendingUp,
  Users,
  Award,
  Target
} from 'lucide-react'

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO, TechFlow Solutions",
      company: "TechFlow Solutions",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      content: "Farzad transformed our entire customer service operation. We went from 24/7 human support to intelligent AI chatbots that handle 85% of inquiries automatically. ROI was achieved in just 6 weeks.",
      metrics: {
        efficiency: "+85%",
        cost: "-60%",
        satisfaction: "4.8/5"
      },
      industry: "SaaS"
    },
    {
      name: "Marcus Rodriguez",
      role: "Operations Director, Global Logistics Corp",
      company: "Global Logistics Corp",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      content: "The AI automation implementation was game-changing. We automated our entire document processing workflow, reducing processing time from 3 days to 15 minutes. The team's focus shifted to strategic initiatives.",
      metrics: {
        time: "-95%",
        accuracy: "+40%",
        productivity: "+70%"
      },
      industry: "Logistics"
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of Research, BioTech Innovations",
      company: "BioTech Innovations",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      content: "Farzad's AI consulting helped us analyze complex biological data patterns we couldn't see before. The predictive models are now guiding our drug discovery process with unprecedented accuracy.",
      metrics: {
        discovery: "+300%",
        accuracy: "+92%",
        time: "-70%"
      },
      industry: "Biotech"
    },
    {
      name: "James Park",
      role: "CEO, RetailMax",
      company: "RetailMax",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      content: "From initial consultation to full deployment, the entire process was seamless. Our sales forecasting accuracy improved by 45%, and inventory optimization saved us $2M in the first year alone.",
      metrics: {
        accuracy: "+45%",
        savings: "$2M",
        revenue: "+25%"
      },
      industry: "Retail"
    }
  ]

  const stats = [
    { number: "500+", label: "Successful Implementations", icon: Target },
    { number: "95%", label: "Client Satisfaction", icon: Award },
    { number: "10K+", label: "AI Implementation Hours", icon: Users },
    { number: "40%", label: "Average Cost Reduction", icon: TrendingUp }
  ]

  const getIndustryColor = (industry: string) => {
    switch (industry) {
      case 'SaaS': return 'bg-blue-500/20 text-blue-700'
      case 'Logistics': return 'bg-green-500/20 text-green-700'
      case 'Biotech': return 'bg-purple-500/20 text-purple-700'
      case 'Retail': return 'bg-orange-500/20 text-orange-700'
      default: return 'bg-gray-500/20 text-gray-700'
    }
  }

  return (
    <section id="testimonials" className="py-24 bg-muted/30">
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
            <Award className="w-4 h-4 mr-2" />
            Proven Results
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Trusted by Industry Leaders
            <span className="block text-holographic">Real Results, Real Impact</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how businesses across industries have transformed operations and achieved
            measurable results with AI-powered solutions.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="glass-card p-6 rounded-xl hover:scale-105 transition-transform">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold text-holographic mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full glass-card border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-8">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-primary/40 mb-4" />

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className="text-lg mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                    </div>
                  </div>

                  {/* Industry Badge */}
                  <Badge variant="outline" className={`mb-6 ${getIndustryColor(testimonial.industry)}`}>
                    {testimonial.industry}
                  </Badge>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
                    {Object.entries(testimonial.metrics).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-lg font-bold text-primary">{value}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {key === 'time' ? 'Time Saved' :
                           key === 'cost' ? 'Cost Reduction' :
                           key === 'accuracy' ? 'Accuracy' :
                           key === 'efficiency' ? 'Efficiency' :
                           key === 'satisfaction' ? 'Satisfaction' :
                           key === 'discovery' ? 'Discovery Rate' :
                           key === 'productivity' ? 'Productivity' :
                           key === 'savings' ? 'Savings' :
                           key === 'revenue' ? 'Revenue Growth' :
                           key}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
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
          className="text-center mt-16"
        >
          <div className="glass-card rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <Award className="w-12 h-12 mx-auto mb-6 text-primary" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Join Industry Leaders
            </h3>
            <p className="text-muted-foreground mb-8 text-lg">
              See why 500+ businesses trust F.B/c with their AI transformation.
              Let's discuss how we can deliver similar results for your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Start Your AI Journey
              </a>
              <a
                href="/chat"
                className="inline-flex items-center px-6 py-3 border border-border bg-background text-foreground rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Experience AI Demo
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
