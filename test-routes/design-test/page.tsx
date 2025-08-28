'use client'

import { ChatInterfaceWrapper } from '@/components/chat/ChatInterfaceWrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function DesignTestPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Modern Design System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Showcasing the new unified UI/UX design system with consistent components, 
            modern aesthetics, and improved user experience.
          </p>
        </div>

        {/* Design System Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Button Showcase */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle>Button System</CardTitle>
              <CardDescription>
                Unified button variants with consistent styling and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="glass">Glass</Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button variant="success">Success</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
              
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
              
              <div className="flex gap-3">
                <Button loading={true} loadingText="Processing...">
                  Loading State
                </Button>
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Showcase */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle>Card System</CardTitle>
              <CardDescription>
                Flexible card variants for different use cases and emphasis levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card variant="default" padding="sm">
                <CardContent>
                  <p className="text-sm">Default Card</p>
                </CardContent>
              </Card>
              
              <Card variant="glass" padding="sm">
                <CardContent>
                  <p className="text-sm">Glass Morphism Card</p>
                </CardContent>
              </Card>
              
              <Card variant="outline" padding="sm">
                <CardContent>
                  <p className="text-sm">Outline Card</p>
                </CardContent>
              </Card>
              
              <Card variant="interactive" padding="sm" className="cursor-pointer">
                <CardContent>
                  <p className="text-sm">Interactive Card (hover me)</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Modern Chat Interface */}
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle>Modern Chat Interface</CardTitle>
            <CardDescription>
              Clean, modern chat interface with glass morphism and smooth animations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChatInterfaceWrapper 
              messages={[]}
              isLoading={false}
              sessionId="demo-session"
              onSendMessage={() => {}}
              onClearMessages={() => {}}
              onToolAction={() => {}}
            />
          </CardContent>
        </Card>

        {/* Design Tokens */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Design Tokens</CardTitle>
            <CardDescription>
              Consistent design tokens ensure visual harmony across all components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Colors */}
              <div>
                <h4 className="font-semibold mb-3">Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent" />
                    <span className="text-sm">Primary (F.B/c Orange)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-card border" />
                    <span className="text-sm">Card Background</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted" />
                    <span className="text-sm">Muted</span>
                  </div>
                </div>
              </div>
              
              {/* Spacing */}
              <div>
                <h4 className="font-semibold mb-3">Spacing</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-accent/20" />
                    <span className="text-sm">4px (space-1)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-accent/20" />
                    <span className="text-sm">8px (space-2)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/20" />
                    <span className="text-sm">16px (space-4)</span>
                  </div>
                </div>
              </div>
              
              {/* Typography */}
              <div>
                <h4 className="font-semibold mb-3">Typography</h4>
                <div className="space-y-2">
                  <p className="text-xs">Extra Small (12px)</p>
                  <p className="text-sm">Small (14px)</p>
                  <p className="text-base">Base (16px)</p>
                  <p className="text-lg">Large (18px)</p>
                  <p className="text-xl">Extra Large (20px)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}