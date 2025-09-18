"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminAssistantPanel } from "@/components/admin/AdminAssistantPanel"
import {
  Home,
  Users,
  Calendar,
  Mail,
  DollarSign,
  Activity,
  TrendingUp,
  Zap,
  Brain,
  Search,
  Filter,
  Download,
  Server,
} from "lucide-react"

type DashboardSection =
  | "overview"
  | "leads"
  | "meetings"
  | "emails"
  | "costs"
  | "analytics"
  | "ai-performance"
  | "gemini-optimization"
  | "activity"
  | "system-health"
  | "ai-assistant"

const navigationItems = [
  { id: "overview", label: "Overview", icon: Home, description: "System overview and key metrics" },
  { id: "leads", label: "Leads", icon: Users, description: "Lead management and scoring" },
  { id: "meetings", label: "Meetings", icon: Calendar, description: "Meeting scheduling and tracking" },
  { id: "emails", label: "Emails", icon: Mail, description: "Email campaigns and automation" },
  { id: "costs", label: "Costs", icon: DollarSign, description: "AI usage and cost tracking" },
  { id: "analytics", label: "Analytics", icon: TrendingUp, description: "Business performance insights" },
  { id: "ai-performance", label: "AI Performance", icon: Zap, description: "AI model performance metrics" },
  { id: "gemini-optimization", label: "Gemini Optimization", icon: Brain, description: "Gemini API cost optimization and caching" },
  { id: "activity", label: "Activity", icon: Activity, description: "Real-time system activity" },
  { id: "system-health", label: "System Health", icon: Server, description: "Real-time system monitoring and health" },
  { id: "ai-assistant", label: "AI Assistant", icon: Brain, description: "AI-powered business intelligence" },
]

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<DashboardSection>("ai-assistant")

  const renderPlaceholder = (title: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="py-8 text-center">
            <Brain className="mx-auto mb-4 size-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Module Coming Soon</h3>
            <p className="text-muted-foreground">
              Advanced admin insights will appear here once the workflow calls for them.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Badge variant="secondary" className="bg-info/10 text-info">System Healthy</Badge>
              <Badge variant="secondary" className="bg-success/10 text-success">AI Online</Badge>
              <Badge variant="secondary" className="bg-accent/10 text-accent">DB Connected</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'ai-assistant':
        return <AdminAssistantPanel />
      case 'overview':
        return renderPlaceholder('System Overview')
      case 'leads':
        return renderPlaceholder('Lead Management')
      case 'meetings':
        return renderPlaceholder('Meetings & Scheduling')
      case 'emails':
        return renderPlaceholder('Email Automation')
      case 'costs':
        return renderPlaceholder('AI Cost Tracking')
      case 'analytics':
        return renderPlaceholder('Business Analytics')
      case 'ai-performance':
        return renderPlaceholder('AI Performance Metrics')
      case 'gemini-optimization':
        return renderPlaceholder('Gemini Optimization')
      case 'activity':
        return renderPlaceholder('System Activity')
      case 'system-health':
        return renderPlaceholder('System Health')
      default:
        return renderPlaceholder('Admin Dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="mx-auto max-w-7xl p-6">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <header className="border-b border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Admin Dashboard</h2>
                <p className="mt-1 text-muted-foreground">System overview and management</p>
              </div>
            </div>
          </header>
          <div className="grid gap-6 p-6 md:grid-cols-[240px_1fr]">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = item.id === activeSection
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="flex w-full items-center justify-start gap-3"
                    onClick={() => setActiveSection(item.id as DashboardSection)}
                  >
                    <Icon className="size-4" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground hidden lg:inline">
                        {item.description}
                      </span>
                    </div>
                  </Button>
                )
              })}
            </nav>

            <div>{renderSection()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
