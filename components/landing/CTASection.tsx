"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Calendar,
  MessageSquare,
  Zap,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export function CTASection() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    urgency: 'standard'
  })
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: "Consultation Request Submitted!",
        description: "We'll get back to you within 24 hours to schedule your AI consultation.",
      })

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        message: '',
        urgency: 'standard'
      })
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const benefits = [
    "Free initial AI assessment (worth $1,500)",
    "Custom ROI projections for your business",
    "Implementation roadmap & timeline",
    "Access to AI workshop previews",
    "Direct consultation with AI expert"
  ]

  const urgencyOptions = [
    { value: 'urgent', label: 'Urgent (24h response)', icon: Zap },
    { value: 'standard', label: 'Standard (48h response)', icon: Clock },
    { value: 'casual', label: 'Just exploring', icon: MessageSquare }
  ]

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
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
            <Sparkles className="w-4 h-4 mr-2" />
            Free AI Consultation
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Business?
            <span className="block text-holographic">Let's Talk AI Strategy</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Book a free consultation to discuss how AI can accelerate your business growth.
            Get personalized insights and a custom implementation roadmap.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Benefits & Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card border-0 shadow-xl h-fit">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Free AI Consultation</h3>
                    <p className="text-muted-foreground">45-minute strategic session</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-lg">What You'll Get:</h4>
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-lg">Why Choose F.B/c?</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 glass-card rounded-lg">
                      <div className="text-2xl font-bold text-primary">10K+</div>
                      <div className="text-sm text-muted-foreground">AI Hours</div>
                    </div>
                    <div className="text-center p-4 glass-card rounded-lg">
                      <div className="text-2xl font-bold text-primary">500+</div>
                      <div className="text-sm text-muted-foreground">Projects</div>
                    </div>
                    <div className="text-center p-4 glass-card rounded-lg">
                      <div className="text-2xl font-bold text-primary">95%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                    <div className="text-center p-4 glass-card rounded-lg">
                      <div className="text-2xl font-bold text-primary">40%</div>
                      <div className="text-sm text-muted-foreground">Avg ROI</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Quick Actions:</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/chat">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Try AI Chat Assistant
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/workshop">
                        <Calendar className="w-4 h-4 mr-2" />
                        Join Free AI Workshop
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      Call: +1 (555) 123-4567
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card border-0 shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">Request Your Free Consultation</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Your company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="urgency">How urgent is this?</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {urgencyOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.urgency === option.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="urgency"
                            value={option.value}
                            checked={formData.urgency === option.value}
                            onChange={(e) => handleInputChange('urgency', e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex flex-col items-center text-center">
                            <option.icon className="w-4 h-4 mb-1" />
                            <span className="text-xs">{option.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Tell us about your goals</Label>
                    <Textarea
                      id="message"
                      placeholder="What AI challenges are you facing? What are your goals?"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="mt-1 min-h-[100px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5 mr-2" />
                        Book Free Consultation
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No commitment required. Cancel anytime.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Alternative Contact Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-2">Other Ways to Connect</h3>
            <p className="text-muted-foreground">Choose the method that works best for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="glass-card hover:scale-105 transition-transform cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h4 className="font-semibold mb-2">Live AI Chat</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Experience our AI capabilities firsthand
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/chat">Start Chat</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card hover:scale-105 transition-transform cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h4 className="font-semibold mb-2">Schedule Call</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Book a direct consultation call
                </p>
                <Button variant="outline" size="sm">
                  Book Call
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card hover:scale-105 transition-transform cursor-pointer">
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h4 className="font-semibold mb-2">Email Us</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Send us details about your project
                </p>
                <Button variant="outline" size="sm">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
