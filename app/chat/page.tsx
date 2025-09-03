'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { Card } from '@/components/ui/card'

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Assistant Chat
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Experience intelligent conversations with multimodal AI capabilities
          </p>
        </div>
        
        <Card className="max-w-4xl mx-auto">
          <ChatInterface />
        </Card>
      </div>
    </div>
  )
}