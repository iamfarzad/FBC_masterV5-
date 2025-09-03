'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Key,
  Database,
  Zap,
  Moon,
  Sun
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'data', label: 'Data & Storage', icon: Database },
  ]

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-space-grotesk">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-dark border-gray-800">
              <CardContent className="p-2">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    className={`w-full justify-start mb-1 ${
                      activeTab === tab.id ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'appearance' && (
              <Card className="glass-dark border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize how AI Studio Pro looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Theme</label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={theme === 'light' ? 'default' : 'outline'}
                        onClick={() => setTheme('light')}
                        className={theme === 'light' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
                      >
                        <Sun className="w-4 h-4 mr-2" />
                        Light
                      </Button>
                      <Button
                        variant={theme === 'dark' ? 'default' : 'outline'}
                        onClick={() => setTheme('dark')}
                        className={theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
                      >
                        <Moon className="w-4 h-4 mr-2" />
                        Dark
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block">Accent Color</label>
                    <div className="flex gap-2">
                      {['purple', 'blue', 'green', 'red', 'orange'].map((color) => (
                        <button
                          key={color}
                          className={`w-10 h-10 rounded-full bg-${color}-500 hover:scale-110 transition-transform`}
                          onClick={() => toast.success(`Accent color changed to ${color}`)}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'api' && (
              <Card className="glass-dark border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-yellow-500" />
                    API Keys
                  </CardTitle>
                  <CardDescription>
                    Manage your API keys for AI services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">OpenAI API Key</label>
                    <div className="flex gap-2">
                      <Input 
                        type="password" 
                        placeholder="sk-..." 
                        className="bg-gray-800/50"
                      />
                      <Button variant="outline">Save</Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Google Gemini API Key</label>
                    <div className="flex gap-2">
                      <Input 
                        type="password" 
                        placeholder="AIza..." 
                        className="bg-gray-800/50"
                      />
                      <Button variant="outline">Save</Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Anthropic API Key</label>
                    <div className="flex gap-2">
                      <Input 
                        type="password" 
                        placeholder="sk-ant-..." 
                        className="bg-gray-800/50"
                      />
                      <Button variant="outline">Save</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'profile' && (
              <Card className="glass-dark border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Profile Settings
                  </CardTitle>
                  <CardDescription>
                    Update your profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Display Name</label>
                    <Input placeholder="John Doe" className="bg-gray-800/50" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input type="email" placeholder="john@example.com" className="bg-gray-800/50" />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Organization</label>
                    <Input placeholder="Acme Corp" className="bg-gray-800/50" />
                  </div>

                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}