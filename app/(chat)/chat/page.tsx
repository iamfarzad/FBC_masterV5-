"use client"

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  Settings, 
  FileText,
  Phone,
  Send,
  Plus,
  Camera,
  Monitor,
  Upload,
  Search,
  GraduationCap
} from 'lucide-react';
import './layout.css';

// Message Interface
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  suggestions?: string[];
}

// Tool Interface
interface Tool {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

const TOOLS: Tool[] = [
  { id: 'voice', icon: Mic, label: 'Voice AI', description: 'Natural conversation mode' },
  { id: 'webcam', icon: Camera, label: 'Video Call', description: 'Face-to-face consultation' },
  { id: 'screen', icon: Monitor, label: 'Screen Share', description: 'Business process analysis' },
  { id: 'docs', icon: Upload, label: 'Documents', description: 'Upload & analyze files' },
  { id: 'research', icon: Search, label: 'Research', description: 'Market & competitor analysis' },
  { id: 'workshop', icon: GraduationCap, label: 'AI Academy', description: 'Executive training resources' }
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showTools, setShowTools] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg_${Date.now()}_ai`,
        content: "Thank you for sharing that. Based on your industry, I can already see several AI opportunities. What's your biggest operational challenge right now?",
        sender: 'assistant',
        timestamp: new Date(),
        suggestions: ['Customer service efficiency', 'Better data insights', 'Process automation', 'Sales optimization']
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  }, [input, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header-minimal">
        <div className="header-content">
          <div className="header-left">
            <span className="ai-badge">F.B/c AI Assistant</span>
            <span className="business-badge">Business Intelligence</span>
          </div>
          <div className="header-right">
            <span className="time">09:44 PM</span>
            <span className="location">Tue, Sep 9</span>
            <span className="weather">72°F</span>
            <span className="weather-status">Sunny</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="chat-main">
        <div className="chat-content">
          {messages.length === 0 ? (
            <div className="welcome-container">
              <motion.div 
                className="welcome-message"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="ai-avatar">
                  <div className="avatar-ring">
                    <span>AI</span>
                  </div>
                </div>
                <h2 className="welcome-title">F.B/c AI Assistant</h2>
                <p className="welcome-text">
                  Hi! I'm your AI Strategy Assistant. I help businesses discover how AI can transform their operations and drive growth.<br/><br/>
                  What's your name, and what industry are you in?
                </p>
                <div className="welcome-meta">
                  <span>I'm John Smith, CEO of a tech startup</span>
                  <span className="separator">•</span>
                  <span>Sarah from retail/e-commerce</span>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="messages-container">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`message ${message.sender}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {message.sender === 'assistant' && (
                    <div className="message-avatar">
                      <div className="avatar-ring small">
                        <span>AI</span>
                      </div>
                    </div>
                  )}
                  <div className="message-content">
                    <p>{message.content}</p>
                    {message.suggestions && (
                      <div className="suggestions">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            className="suggestion-chip"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  className="message assistant"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="message-avatar">
                    <div className="avatar-ring small">
                      <span>AI</span>
                    </div>
                  </div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Quick Actions Panel (shown when messages exist) */}
        {messages.length > 0 && (
          <motion.div 
            className="quick-actions-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="panel-section">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <Button variant="outline" size="sm" className="action-btn">
                  <Mic className="w-4 h-4" />
                  Voice
                </Button>
                <Button variant="outline" size="sm" className="action-btn">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </div>
            </div>
            <div className="panel-section">
              <h3>Business Actions</h3>
              <div className="action-buttons">
                <Button variant="outline" size="sm" className="action-btn">
                  <FileText className="w-4 h-4" />
                  Report
                </Button>
                <Button variant="outline" size="sm" className="action-btn">
                  <Phone className="w-4 h-4" />
                  Book Call
                </Button>
              </div>
            </div>
            <div className="panel-info">
              <span>Ready for next steps</span>
            </div>
          </motion.div>
        )}
      </main>

      {/* Input Area */}
      <footer className="chat-input-area">
        <div className="input-container">
          <div className="input-wrapper">
            <button 
              className="tools-button"
              onClick={() => setShowTools(!showTools)}
            >
              <Plus className="w-5 h-5" />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your business challenge or AI opportunity..."
              className="chat-input"
              rows={1}
            />
            {input.trim() && (
              <button 
                className="send-button"
                onClick={handleSend}
                disabled={isLoading}
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tools Popover */}
        <AnimatePresence>
          {showTools && (
            <motion.div 
              className="tools-popover"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
            >
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  className="tool-item"
                  onClick={() => {
                    console.log(`Selected tool: ${tool.id}`);
                    setShowTools(false);
                  }}
                >
                  <div className="tool-icon">
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <div className="tool-info">
                    <span className="tool-label">{tool.label}</span>
                    <span className="tool-description">{tool.description}</span>
                  </div>
                </button>
              ))}
              <button className="tool-item">
                <div className="tool-icon">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="tool-info">
                  <span className="tool-label">Settings</span>
                  <span className="tool-description">Preferences & theme</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
}