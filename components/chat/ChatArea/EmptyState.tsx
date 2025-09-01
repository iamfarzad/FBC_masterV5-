"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Video, Mic, Calculator, Monitor, Sparkles, Zap } from 'lucide-react'
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function EmptyState() {
  const actions = [
    {
      icon: Video,
      title: 'Video to App',
      desc: 'Convert video content into working applications',
      color: 'from-purple-500 to-pink-500',
      action: () => {
        const workshopUrl = '/workshop/video-to-app'
        window.location.href = workshopUrl
      }
    },
    {
      icon: Mic,
      title: 'Voice Input',
      desc: 'Speak naturally and get AI-powered responses',
      color: 'from-blue-500 to-cyan-500',
      action: () => {
        const textarea = document.querySelector('textarea')
        const prompts = [
          'Hey, I need help with business analysis...',
          'Can you help me create a marketing plan?',
          'I want to analyze my ROI for a new project...'
        ]
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
        if (textarea) {
          textarea.focus()
          textarea.setAttribute('placeholder', randomPrompt)
        }
      }
    },
    {
      icon: Calculator,
      title: 'ROI Calculator',
      desc: 'Calculate return on investment for business decisions',
      color: 'from-green-500 to-emerald-500',
      action: () => {
        const textarea = document.querySelector('textarea')
        const prompts = [
          'Calculate ROI for a $50k investment with 25% monthly revenue increase...',
          'What\'s the payback period for a $100k marketing campaign?',
          'Help me analyze the financial impact of hiring 5 new employees...'
        ]
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
        if (textarea) {
          textarea.focus()
          textarea.setAttribute('placeholder', randomPrompt)
        }
      }
    },
    {
      icon: Monitor,
      title: 'Screen Analysis',
      desc: 'Analyze your screen content for insights and improvements',
      color: 'from-orange-500 to-red-500',
      action: () => {
        const textarea = document.querySelector('textarea')
        const prompts = [
          'Analyze my current screen for business insights...',
          'What improvements can I make to this interface?',
          'Help me understand the user experience on this page...'
        ]
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
        if (textarea) {
          textarea.focus()
          textarea.setAttribute('placeholder', randomPrompt)
        }
      }
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 min-h-[60vh] grid place-items-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-center max-w-2xl mx-auto px-4"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-xl"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-3xl sm:text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
        >
          Welcome to F.B/c AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-lg text-muted-foreground mb-8 leading-relaxed"
        >
          Your intelligent business consulting platform. Choose an action below to get started, or simply ask me anything.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto"
        >
          {actions.map((action, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={action.action}
                      className="h-auto min-h-[120px] sm:min-h-[140px] p-4 sm:p-6 w-full flex flex-col items-center gap-3 sm:gap-4 hover:bg-accent/5 transition-all duration-300 border-border/30 rounded-xl group bg-card/50 backdrop-blur-sm hover:shadow-lg"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center space-y-1 flex-1 flex flex-col justify-center">
                        <div className="font-semibold text-foreground">{action.title}</div>
                        <div className="text-sm text-muted-foreground leading-relaxed">{action.desc}</div>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.desc}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
