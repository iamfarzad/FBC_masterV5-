"use client"

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  X, 
  Palette, 
  Bell, 
  MessageSquare, 
  Zap,
  Shield,
  Database,
  Eye,
  EyeOff
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useFeatureFlags } from '@/hooks/use-feature-flags'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme()
  const { flags, isLoading: flagsLoading } = useFeatureFlags()
  
  // Local state for settings
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: true,
    soundEnabled: false,
    showDebugInfo: false,
    compactMode: false,
    autoScroll: true,
    showTimestamps: true,
    enableVoiceCommands: true,
    enableScreenShare: true,
    enableWebcam: true,
  })

  const handleSettingChange = useCallback((key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    // In a real implementation, you'd save to localStorage or backend
    localStorage.setItem(`fbc-setting-${key}`, value.toString())
  }, [])

  const handleThemeChange = useCallback((newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('fbc-theme', newTheme)
  }, [setTheme])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-surface border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-brand" />
              <h2 className="text-xl font-semibold text-text">Settings</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-surface-elevated"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6 space-y-6">
              
              {/* Theme Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-brand" />
                  <h3 className="text-lg font-medium text-text">Appearance</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme-select" className="text-text">Theme</Label>
                    <select
                      id="theme-select"
                      value={theme}
                      onChange={(e) => handleThemeChange(e.target.value)}
                      className="bg-surface-elevated border border-border rounded-md px-3 py-1 text-text"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compact-mode" className="text-text">Compact Mode</Label>
                    <Switch
                      id="compact-mode"
                      checked={settings.compactMode}
                      onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Chat Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand" />
                  <h3 className="text-lg font-medium text-text">Chat</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save" className="text-text">Auto-save conversations</Label>
                    <Switch
                      id="auto-save"
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-scroll" className="text-text">Auto-scroll to new messages</Label>
                    <Switch
                      id="auto-scroll"
                      checked={settings.autoScroll}
                      onCheckedChange={(checked) => handleSettingChange('autoScroll', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="timestamps" className="text-text">Show timestamps</Label>
                    <Switch
                      id="timestamps"
                      checked={settings.showTimestamps}
                      onCheckedChange={(checked) => handleSettingChange('showTimestamps', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand" />
                  <h3 className="text-lg font-medium text-text">Notifications</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications" className="text-text">Enable notifications</Label>
                    <Switch
                      id="notifications"
                      checked={settings.notifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound" className="text-text">Sound notifications</Label>
                    <Switch
                      id="sound"
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand" />
                  <h3 className="text-lg font-medium text-text">Features</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voice" className="text-text">Voice commands</Label>
                    <Switch
                      id="voice"
                      checked={settings.enableVoiceCommands}
                      onCheckedChange={(checked) => handleSettingChange('enableVoiceCommands', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="screen" className="text-text">Screen sharing</Label>
                    <Switch
                      id="screen"
                      checked={settings.enableScreenShare}
                      onCheckedChange={(checked) => handleSettingChange('enableScreenShare', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="webcam" className="text-text">Webcam capture</Label>
                    <Switch
                      id="webcam"
                      checked={settings.enableWebcam}
                      onCheckedChange={(checked) => handleSettingChange('enableWebcam', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Feature Flags (Admin) */}
              {!flagsLoading && flags && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-brand" />
                    <h3 className="text-lg font-medium text-text">AI SDK Features</h3>
                    <Badge variant="secondary" className="text-xs">Admin</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(flags).map(([key, enabled]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key} className="text-text capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </Label>
                        <div className="flex items-center gap-2">
                          {enabled ? (
                            <Badge variant="default" className="text-xs">Enabled</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Disabled</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Debug Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-brand" />
                  <h3 className="text-lg font-medium text-text">Debug</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="debug" className="text-text">Show debug information</Label>
                    <Switch
                      id="debug"
                      checked={settings.showDebugInfo}
                      onCheckedChange={(checked) => handleSettingChange('showDebugInfo', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-surface-elevated">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onClose} className="bg-brand hover:bg-brand-hover">
              Save Settings
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

