"use client"

import React from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Github,
  ExternalLink,
  Heart,
  ArrowUp
} from 'lucide-react'

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const services = [
    { name: 'AI Strategy Consulting', href: '#services' },
    { name: 'Intelligent Automation', href: '#services' },
    { name: 'AI Training Workshops', href: '#services' },
    { name: 'Custom AI Development', href: '#services' }
  ]

  const resources = [
    { name: 'AI Chat Assistant', href: '/chat' },
    { name: 'Workshop Preview', href: '/workshop' },
    { name: 'Case Studies', href: '#testimonials' },
    { name: 'ROI Calculator', href: '/consulting' }
  ]

  const company = [
    { name: 'About Farzad', href: '/about' },
    { name: 'Consulting Services', href: '/consulting' },
    { name: 'Contact', href: '#contact' },
    { name: 'Privacy Policy', href: '/legal' }
  ]

  const developer = [
    { name: 'API Documentation', href: '/api' },
    { name: 'Developer Tools', href: '/admin/test' },
    { name: 'GitHub Repository', href: '#' },
    { name: 'Contributing', href: '#' }
  ]

  const socialLinks = [
    { name: 'LinkedIn', href: 'https://linkedin.com/in/farzadbayat', icon: Linkedin },
    { name: 'Twitter', href: 'https://twitter.com/farzadbayat', icon: Twitter },
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'Email', href: 'mailto:farzad@fbconsulting.com', icon: Mail }
  ]

  return (
    <footer className="bg-background border-t border-border">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 glass-button rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <span className="font-bold text-holographic text-xl">F.B/c</span>
              </Link>

              <p className="text-muted-foreground mb-6 max-w-md">
                AI-powered business consulting platform. Transform your operations with
                intelligent automation and AI-driven insights. 10,000+ hours of proven results.
              </p>

              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 glass-button rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Services */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="font-semibold mb-4"
            >
              Services
            </motion.h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <motion.li
                  key={service.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={service.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {service.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="font-semibold mb-4"
            >
              Resources
            </motion.h3>
            <ul className="space-y-3">
              {resources.map((resource, index) => (
                <motion.li
                  key={resource.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={resource.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {resource.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="font-semibold mb-4"
            >
              Company
            </motion.h3>
            <ul className="space-y-3">
              {company.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Developer */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="font-semibold mb-4"
            >
              Developer
            </motion.h3>
            <ul className="space-y-3">
              {developer.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1"
                  >
                    {item.name}
                    {item.href.includes('http') && <ExternalLink className="w-3 h-3" />}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-border"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium">Email</div>
                <a href="mailto:farzad@fbconsulting.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  farzad@fbconsulting.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium">Phone</div>
                <a href="tel:+15551234567" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  +1 (555) 123-4567
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium">Location</div>
                <span className="text-muted-foreground text-sm">Global - Remote First</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 F.B/c AI Consulting. All rights reserved.
              </p>
              <Badge variant="outline" className="text-xs">
                v5.0.0
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/admin/test" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Developer Tools
              </Link>
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="text-xs"
              >
                <ArrowUp className="w-3 h-3 mr-1" />
                Back to Top
              </Button>
            </div>
          </div>

          {/* Credits */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-current" />
              <span>by</span>
              <Link href="/about" className="hover:text-primary transition-colors">
                Farzad Bayat
              </Link>
              <span>• 10,000+ AI Implementation Hours</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
