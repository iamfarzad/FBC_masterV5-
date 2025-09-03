'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  Users, 
  Database, 
  Zap,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Shield,
  MessageSquare
} from 'lucide-react'
import { adminContextBuilder } from '@/src/core/admin/admin-context-builder'
import { performanceMonitor } from '@/src/core/monitoring/performance-monitor'
import { tokenUsageLogger } from '@/src/core/token-usage-logger'
import { AdminChat } from '@/components/admin/AdminChat'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [context, setContext] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const authenticate = () => {
    // Simple authentication (in production, use proper auth)
    if (password === 'admin123') {
      setIsAuthenticated(true)
      loadAdminData()
    }
  }

  const loadAdminData = async () => {
    setIsLoading(true)
    try {
      const adminContext = await adminContextBuilder.buildContext()
      setContext(adminContext)
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData()
      const interval = setInterval(loadAdminData, 30000) // Refresh every 30s
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && authenticate()}
              />
              <Button onClick={authenticate} className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Authenticate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">F.B/c System Overview & Control</p>
          </div>
          <Button onClick={loadAdminData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {context && (
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList>
              <TabsTrigger value="dashboard">
                <Activity className="mr-2 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                Admin Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <>
            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor(context.system.uptime / 1000 / 60)} min
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Since last restart
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {context.usage.users.active}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of {context.usage.users.total} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {context.usage.tokens.today.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tokens today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Cost</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${context.usage.tokens.cost.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-muted-foreground">
                        {context.system.memory.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={context.system.memory.percentage} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {context.system.performance.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={context.system.performance.successRate} 
                      className={context.system.performance.successRate > 95 ? '' : 'text-yellow-500'}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Avg Response Time</span>
                      <span className="text-sm text-muted-foreground">
                        {context.system.performance.averageResponseTime.toFixed(0)}ms
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(100, context.system.performance.averageResponseTime / 10)} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cache Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Cache Entries</p>
                      <p className="text-2xl font-bold">{context.cache.entries}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Hit Rate</p>
                      <p className="text-2xl font-bold">{context.cache.hitRate}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Cache Efficiency</p>
                    <Progress value={context.cache.hitRate} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features Section */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Enabled Features</p>
                    <div className="flex flex-wrap gap-2">
                      {context.features.enabled.map((feature: string) => (
                        <Badge key={feature} variant="default">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Disabled Features</p>
                    <div className="flex flex-wrap gap-2">
                      {context.features.disabled.map((feature: string) => (
                        <Badge key={feature} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Errors */}
            {context.system.performance.recentErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recent Errors:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {context.system.performance.recentErrors.map((error: string, i: number) => (
                      <li key={i} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            </TabsContent>

            <TabsContent value="chat">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Admin Chat */}
                <AdminChat context={context} />
                
                {/* Quick Info Panel */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Admin Chat Context</CardTitle>
                      <CardDescription>
                        This chat has privileged access to system metrics and client interactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <strong>Available Commands:</strong>
                        <ul className="mt-2 list-disc list-inside text-muted-foreground">
                          <li>View user sessions and interactions</li>
                          <li>Check system performance metrics</li>
                          <li>Monitor API usage and costs</li>
                          <li>Analyze error logs and patterns</li>
                          <li>Configure system settings</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Live Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Active Sessions</span>
                        <Badge>{context.usage.users.active}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Success Rate</span>
                        <Badge variant={context.system.performance.successRate > 95 ? "default" : "destructive"}>
                          {context.system.performance.successRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Response</span>
                        <Badge>{context.system.performance.averageResponseTime}ms</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Cache Hit Rate</span>
                        <Badge>{context.cache.hitRate}%</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}