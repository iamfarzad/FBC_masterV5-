"use client"

import React from 'react'
import {
  Activity,
  TrendingUp,
  HardDrive,
  Database,
  Users,
  MessageSquare,
  DollarSign,
  Mail,
  Calendar,
  Eye,
  FileText,
  Download
} from 'lucide-react'

export interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<any>
  prompt: string
  category: 'system' | 'business'
}

export const QUICK_ACTIONS: QuickAction[] = [
  // 🔧 System Health Actions
  {
    title: "System Status",
    description: "Check overall system health",
    icon: Activity,
    prompt: "How is the system doing?",
    category: "system"
  },
  {
    title: "Performance Check",
    description: "Review system performance",
    icon: TrendingUp,
    prompt: "How is system performance?",
    category: "system"
  },
  {
    title: "Memory Usage",
    description: "Check memory consumption",
    icon: HardDrive,
    prompt: "What is the memory usage?",
    category: "system"
  },
  {
    title: "Cache Status",
    description: "Review cache performance",
    icon: Database,
    prompt: "How is the cache performing?",
    category: "system"
  },

  // 📊 Business Actions
  {
    title: "Lead Analysis",
    description: "Analyze lead performance",
    icon: Users,
    prompt: "Analyze our recent leads and provide insights on conversion rates and scoring",
    category: "business"
  },
  {
    title: "Conversation Insights",
    description: "Get conversation analysis",
    icon: MessageSquare,
    prompt: "Analyze recent conversations and provide insights on lead quality and engagement patterns",
    category: "business"
  },
  {
    title: "Cost Analysis",
    description: "Review AI usage costs",
    icon: DollarSign,
    prompt: "Analyze our AI usage costs and suggest optimization strategies",
    category: "business"
  },
  {
    title: "Email Campaign",
    description: "Draft email content",
    icon: Mail,
    prompt: "Draft a professional email campaign for our engaged leads",
    category: "business"
  },
  {
    title: "Meeting Strategy",
    description: "Optimize scheduling",
    icon: Calendar,
    prompt: "Analyze our meeting schedule and suggest optimization strategies",
    category: "business"
  },
  {
    title: "Activity Summary",
    description: "Get recent overview",
    icon: Activity,
    prompt: "Provide a summary of recent system activities and any alerts",
    category: "business"
  }
]

export const SUGGESTED_PROMPTS = [
  // 🔧 System Status Questions
  "How is the system doing?",
  "What is the system health?",
  "How is system performance?",
  "What is the memory usage?",
  "How is the cache performing?",
  "Any system errors?",
  "Quick system status",
  "Comprehensive system overview",

  // 📊 Business Questions
  "What are our top performing leads this month?",
  "Analyze recent conversations and identify patterns",
  "Draft a follow-up email for qualified leads",
  "Review conversation quality and lead scoring trends",
  "Analyze our meeting conversion rates",
  "Suggest cost optimization strategies",
  "Review our AI response accuracy",
  "What insights can you provide about user engagement?",
  "Generate conversation insights for a specific lead",
  "Analyze PDF generation success rates"
]
