"use client";

import { useState } from "react";
import { RealWorkflowCanvas } from "@/components/real-workflow/RealWorkflowCanvas";
import { RealWorkflowMessage } from "@/components/chat/RealWorkflowMessage";
import { cn } from "@/src/core/utils";
import { Shield, Search, Target, FileCheck, RefreshCw, CheckCircle } from "lucide-react";

export default function RealWorkflowDemoPage() {
  const [inputValue, setInputValue] = useState("");
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const realDemoWorkflows = [
    {
      id: "consent",
      title: "Consent & TC Workflow",
      query: "I'd like to fill out the Terms & Conditions to get started",
      description: "User fills out consent form and triggers research",
      icon: Shield,
      color: "blue"
    },
    {
      id: "research",
      title: "Lead Research Workflow", 
      query: "Research this lead and gather intelligence insights",
      description: "Real-time lead research and company analysis",
      icon: Search,
      color: "green"
    },
    {
      id: "personalization",
      title: "Context Personalization Workflow",
      query: "Show me how the conversation gets personalized",
      description: "AI personalizes conversation based on research",
      icon: Target,
      color: "purple"
    },
    {
      id: "completion",
      title: "Session Completion Workflow",
      query: "Complete the session and generate PDF summary",
      description: "PDF generation and follow-up workflow",
      icon: FileCheck,
      color: "orange"
    }
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add message to chat
    const message = {
      id: crypto.randomUUID(),
      content,
      type: "real-workflow" as const,
      metadata: {
        workflowType: "consent",
        sessionId: "demo-session",
      },
    };

    setMessages(prev => [...prev, message]);
    setInputValue("");
  };

  const handleDemoWorkflow = async (query: string) => {
    setInputValue(query);
    await handleSendMessage(query);
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text mb-4">
            🎯 Real F.B/c AI Workflow Demo
          </h1>
          <p className="text-lg text-text-muted mb-6">
            Experience the actual TC → Research → Personalization → PDF workflow that powers F.B/c AI
          </p>
          
          {/* Feature Status */}
          <div className="inline-flex items-center space-x-4 bg-surface border border-border rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-text">Real Workflow Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-brand rounded-full"></div>
              <span className="text-sm font-medium text-text">Consent → Research → Personalization</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-text">Real-time Processing</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Demo Workflows */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text mb-4">Try the Real Workflow</h2>
              <div className="space-y-3">
                {realDemoWorkflows.map((workflow) => {
                  const Icon = workflow.icon;
                  return (
                    <button
                      key={workflow.id}
                      onClick={() => handleDemoWorkflow(workflow.query)}
                      className={cn(
                        "w-full p-4 text-left rounded-lg border transition-all duration-200",
                        selectedDemo === workflow.id
                          ? "border-brand bg-brand/5 text-brand"
                          : "border-border bg-surface-elevated hover:bg-surface text-text"
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={cn(
                          "text-2xl",
                          workflow.color === "blue" ? "text-blue-600" :
                          workflow.color === "green" ? "text-green-600" :
                          workflow.color === "purple" ? "text-purple-600" :
                          "text-orange-600"
                        )} />
                        <div>
                          <h3 className="font-medium">{workflow.title}</h3>
                          <p className="text-sm text-text-muted mt-1">{workflow.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Real Workflow Steps */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-semibold text-text mb-3">Real F.B/c Workflow Steps</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <div className="font-medium text-blue-800">Consent & TC</div>
                    <div className="text-blue-600 text-xs">User fills out Terms & Conditions</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <div className="font-medium text-green-800">Lead Research</div>
                    <div className="text-green-600 text-xs">AI researches lead and company</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <div className="font-medium text-purple-800">Personalization</div>
                    <div className="text-purple-600 text-xs">Conversation gets personalized</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <div className="font-medium text-orange-800">Completion</div>
                    <div className="text-orange-600 text-xs">PDF generated and follow-up scheduled</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Chat Interface */}
          <div className="space-y-6">
            {/* Chat Messages */}
            <div className="bg-surface border border-border rounded-lg p-6 h-96 overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-text-muted py-8">
                    <div className="text-4xl mb-4">🎯</div>
                    <p>Start the real F.B/c workflow to see it in action!</p>
                    <p className="text-sm mt-2">Try consent, research, or personalization workflows.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <RealWorkflowMessage
                      key={message.id}
                      message={message}
                    />
                  ))
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
                placeholder="Start the real workflow (e.g., 'I'd like to fill out consent')..."
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-surface text-text placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className="px-6 py-2 bg-brand hover:bg-brand-hover text-surface rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>

          {/* Right Column - Live Real Workflow Canvas */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-semibold text-text mb-4">Live Real Workflow Canvas</h3>
              <div className="h-96 overflow-y-auto">
                <RealWorkflowCanvas 
                  sessionId="demo-session"
                  autoStart={false}
                  className="w-full"
                />
              </div>
            </div>

            {/* Technical Info */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-semibold text-text mb-3">Real Implementation</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Consent API:</span>
                  <span className="text-text font-medium">/api/consent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Research Service:</span>
                  <span className="text-text font-medium">LeadResearchService</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Context API:</span>
                  <span className="text-text font-medium">/api/intelligence/context</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">PDF Generation:</span>
                  <span className="text-text font-medium">/api/export-summary</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-text-muted text-sm">
            Real F.B/c AI Workflow Demo • Built with your actual implementation • 
            <a href="/chat" className="text-brand hover:text-brand-hover ml-1">
              Back to Main Chat
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}