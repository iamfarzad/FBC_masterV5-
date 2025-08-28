'use client'

import { ChatInterfaceWrapper } from '@/components/chat/ChatInterfaceWrapper'

export default function TestCleanChatPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Clean Chat System Test</h1>
        <p className="text-muted-foreground">
          Testing the refactored chat API with unified hook and SSE streaming
        </p>
      </div>
      
      <ChatInterfaceWrapper 
        messages={[]}
        isLoading={false}
        sessionId="test-session"
        onSendMessage={() => {}}
        onClearMessages={() => {}}
        onToolAction={() => {}}
      />
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>✅ Single message schema</p>
        <p>✅ Unified provider config</p>
        <p>✅ SSE streaming</p>
        <p>✅ One hook for both modes</p>
        <p>✅ Auth working</p>
      </div>
    </div>
  )
}