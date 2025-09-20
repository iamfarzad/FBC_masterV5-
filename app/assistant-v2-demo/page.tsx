"use client";

import { useState } from "react";
import { ArtifactMessage } from "@/components/chat/ArtifactMessage";
import { ArtifactCanvas } from "@/components/charts/ArtifactCanvas";
import { useArtifactChat } from "@/hooks/useArtifactChat";
import { cn } from "@/src/core/utils";

export default function AssistantV2DemoPage() {
  const [inputValue, setInputValue] = useState("");
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const chat = useArtifactChat({
    sessionId: "demo-session",
    mode: "standard",
    autoGenerateArtifacts: true,
  });

  const demoQueries = [
    {
      id: "burn-rate",
      title: "Burn Rate Analysis",
      query: "Show me our monthly burn rate for the last 12 months with trend analysis",
      description: "Analyze cash burn patterns and runway projections",
      icon: "🔥"
    },
    {
      id: "revenue",
      title: "Revenue Analytics",
      query: "Generate a revenue trend chart showing growth over the past year",
      description: "Track revenue performance and forecasting",
      icon: "💰"
    },
    {
      id: "leads",
      title: "Lead Conversion",
      query: "Create a lead conversion funnel showing our sales pipeline",
      description: "Visualize lead progression and conversion rates",
      icon: "🎯"
    },
    {
      id: "dashboard",
      title: "Performance Dashboard",
      query: "Build a comprehensive business performance dashboard",
      description: "Complete overview of key business metrics",
      icon: "📊"
    }
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add message to chat
    const message = {
      id: crypto.randomUUID(),
      content,
      type: "artifact" as const,
      metadata: {
        artifactType: "burn-rate",
        query: content,
      },
    };

    // Send through chat system
    await chat.sendMessage(content);
    
    // Clear input
    setInputValue("");
  };

  const handleDemoQuery = async (query: string) => {
    setInputValue(query);
    await handleSendMessage(query);
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text mb-4">
            🚀 Assistant V2 Demo
          </h1>
          <p className="text-lg text-text-muted mb-6">
            Experience the power of AI-generated business analytics with real-time chart generation
          </p>
          
          {/* Feature Toggle Status */}
          <div className="inline-flex items-center space-x-4 bg-surface border border-border rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-text">AI SDK Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-brand rounded-full"></div>
              <span className="text-sm font-medium text-text">Artifacts Enabled</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-text">CanvasJS Ready</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Demo Queries */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text mb-4">Try These Demos</h2>
              <div className="space-y-3">
                {demoQueries.map((demo) => (
                  <button
                    key={demo.id}
                    onClick={() => handleDemoQuery(demo.query)}
                    className={cn(
                      "w-full p-4 text-left rounded-lg border transition-all duration-200",
                      selectedDemo === demo.id
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-border bg-surface-elevated hover:bg-surface text-text"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{demo.icon}</span>
                      <div>
                        <h3 className="font-medium">{demo.title}</h3>
                        <p className="text-sm text-text-muted mt-1">{demo.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Artifact Status */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-semibold text-text mb-3">Artifact Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Generating:</span>
                  <span className={cn(
                    "font-medium",
                    chat.artifactStatus.isGenerating ? "text-brand" : "text-text"
                  )}>
                    {chat.artifactStatus.isGenerating ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Last Generated:</span>
                  <span className="text-text font-medium">
                    {chat.artifactStatus.lastGenerated || "None"}
                  </span>
                </div>
                {chat.artifactStatus.error && (
                  <div className="flex justify-between">
                    <span className="text-red-600">Error:</span>
                    <span className="text-red-600 text-xs">{chat.artifactStatus.error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Chat Interface */}
          <div className="space-y-6">
            {/* Chat Messages */}
            <div className="bg-surface border border-border rounded-lg p-6 h-96 overflow-y-auto">
              <div className="space-y-4">
                {chat.messages.length === 0 ? (
                  <div className="text-center text-text-muted py-8">
                    <div className="text-4xl mb-4">🤖</div>
                    <p>Start a conversation to see AI-generated analytics!</p>
                    <p className="text-sm mt-2">Try asking about burn rates, revenue, or lead conversion.</p>
                  </div>
                ) : (
                  chat.messages.map((message) => (
                    <ArtifactMessage
                      key={message.id}
                      message={message}
                    />
                  ))
                )}
                
                {/* Loading State */}
                {chat.isLoading && (
                  <div className="flex items-center space-x-2 text-brand">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent"></div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
                placeholder="Ask about your business analytics..."
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-surface text-text placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand"
                disabled={chat.isLoading}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={chat.isLoading || !inputValue.trim()}
                className="px-6 py-2 bg-brand hover:bg-brand-hover text-surface rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>

          {/* Right Column - Live Canvas */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-semibold text-text mb-4">Live Analytics Canvas</h3>
              <div className="h-96 overflow-y-auto">
                <ArtifactCanvas 
                  query=""
                  autoGenerate={false}
                  className="w-full"
                />
              </div>
            </div>

            {/* Technical Info */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-semibold text-text mb-3">Technical Stack</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">AI SDK:</span>
                  <span className="text-text font-medium">v5.0.44</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Artifacts:</span>
                  <span className="text-text font-medium">v0.3.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">CanvasJS:</span>
                  <span className="text-text font-medium">v1.0.2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Model:</span>
                  <span className="text-text font-medium">Gemini 1.5 Pro</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-text-muted text-sm">
            Assistant V2 Demo • Built with AI SDK, Artifacts, and CanvasJS • 
            <a href="/chat" className="text-brand hover:text-brand-hover ml-1">
              Back to Main Chat
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}