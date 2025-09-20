"use client";

import { useState } from "react";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { WorkflowMessage } from "@/components/chat/WorkflowMessage";
import { cn } from "@/src/core/utils";
import { FileText, Target, FileCheck, Download, RefreshCw, CheckCircle } from "lucide-react";

export default function WorkflowDemoPage() {
  const [inputValue, setInputValue] = useState("");
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const demoWorkflows = [
    {
      id: "tc-analysis",
      title: "TC Analysis Workflow",
      query: "Analyze the Terms & Conditions document I uploaded",
      description: "Complete TC analysis with risk assessment and recommendations",
      icon: FileText,
      color: "blue"
    },
    {
      id: "research",
      title: "Lead Research Workflow", 
      query: "Research this lead and generate intelligence insights",
      description: "Comprehensive lead research and qualification",
      icon: Target,
      color: "green"
    },
    {
      id: "summary",
      title: "Conversation Summary Workflow",
      query: "Generate a comprehensive summary of our conversation",
      description: "AI-powered conversation analysis and insights",
      icon: FileCheck,
      color: "purple"
    },
    {
      id: "pdf-generation",
      title: "PDF Generation Workflow",
      query: "Create a professional PDF summary document",
      description: "Generate and download PDF summary",
      icon: Download,
      color: "orange"
    }
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add message to chat
    const message = {
      id: crypto.randomUUID(),
      content,
      type: "workflow" as const,
      metadata: {
        workflowType: "tc-analysis",
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
            🚀 AI Workflow Demo
          </h1>
          <p className="text-lg text-text-muted mb-6">
            Experience the complete TC → Research → Summary → PDF workflow with real-time AI processing
          </p>
          
          {/* Feature Status */}
          <div className="inline-flex items-center space-x-4 bg-surface border border-border rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-text">AI SDK Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-brand rounded-full"></div>
              <span className="text-sm font-medium text-text">Workflow Enabled</span>
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
              <h2 className="text-xl font-semibold text-text mb-4">Try These Workflows</h2>
              <div className="space-y-3">
                {demoWorkflows.map((workflow) => {
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

            {/* Workflow Steps */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-semibold text-text mb-3">Workflow Steps</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-text-muted">TC Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-text-muted">Lead Research</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span className="text-text-muted">Summary Generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <span className="text-text-muted">PDF Generation</span>
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
                    <div className="text-4xl mb-4">🤖</div>
                    <p>Start a workflow to see AI processing in action!</p>
                    <p className="text-sm mt-2">Try analyzing documents, researching leads, or generating summaries.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <WorkflowMessage
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
                placeholder="Start an AI workflow (e.g., 'Analyze this document')..."
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

          {/* Right Column - Live Workflow Canvas */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-semibold text-text mb-4">Live Workflow Canvas</h3>
              <div className="h-96 overflow-y-auto">
                <WorkflowCanvas 
                  sessionId="demo-session"
                  autoStart={false}
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
                  <span className="text-text-muted">Model:</span>
                  <span className="text-text font-medium">Gemini 1.5 Pro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Streaming:</span>
                  <span className="text-text font-medium">Real-time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-text-muted text-sm">
            AI Workflow Demo • Built with AI SDK and Artifacts • 
            <a href="/chat" className="text-brand hover:text-brand-hover ml-1">
              Back to Main Chat
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}