"use client"

import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink, Quote } from 'lucide-react'
import Link from 'next/link'

export function CitationsDemo() {
  const citations = [
    {
      title: "AI Implementation Best Practices",
      source: "Google AI Research",
      url: "#",
      excerpt: "Research shows that companies with structured AI implementation frameworks achieve 3x higher success rates."
    },
    {
      title: "Automation ROI Study",
      source: "McKinsey Global Institute",
      url: "#",
      excerpt: "Businesses that automate routine tasks see an average 40% reduction in operational costs."
    },
    {
      title: "AI Ethics Framework",
      source: "OpenAI Research",
      url: "#",
      excerpt: "Responsible AI implementation requires transparency, accountability, and human oversight."
    }
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <Badge variant="outline" className="mb-4 px-4 py-2">
          <FileText className="w-4 h-4 mr-2" />
          Research-Backed Approach
        </Badge>
        <h2 className="text-3xl font-bold mb-6">
          Evidence-Based AI Consulting
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Every recommendation is backed by research, data, and proven results
          from real-world AI implementations.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {citations.map((citation, index) => (
          <motion.div
            key={citation.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card border-0 shadow-lg h-full hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Quote className="w-5 h-5 text-primary" />
                  <Badge variant="outline" className="text-xs">
                    {citation.source}
                  </Badge>
                </div>

                <h3 className="font-semibold mb-3">{citation.title}</h3>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {citation.excerpt}
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-primary hover:text-primary/80"
                  asChild
                >
                  <Link href={citation.url}>
                    View Source
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <p className="text-muted-foreground mb-4">
          All recommendations backed by industry research and proven methodologies
        </p>
        <Button variant="outline" asChild>
          <Link href="#contact">
            Get Research-Backed AI Strategy
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
