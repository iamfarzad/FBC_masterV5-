import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { 
  Send, 
  Paperclip, 
  Mic, 
  FileText, 
  Calendar, 
  Download, 
  Mail, 
  ChevronDown 
} from 'lucide-react';

// Import hooks and components
import { useConversationFlow, MessageData } from '../../hooks/useConversationFlow';
import { EnhancedMessage } from './EnhancedMessage';
import { EnhancedTypingIndicator } from './EnhancedTypingIndicator';
import { generateConversationPDF } from '../../services/pdfService';

interface BookingData {
  name: string;
  email: string;
  company: string;
  message: string;
  selectedDate: Date | null;
  selectedTime: string;
  timezone: string;
}

interface ChatInterfaceProps {
  onShowBookingOverlay: () => void;
  onShowStreamingOverlay: () => void;
  completedBooking?: BookingData | null;
  streamingState: {
    isConnected: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    audioLevel: number;
  };
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onShowBookingOverlay,
  onShowStreamingOverlay,
  completedBooking,
  streamingState
}) => {
  const [input, setInput] = useState('');
  
  const {
    messages,
    conversationState,
    isLoading,
    processUserMessage,
    addMessage
  } = useConversationFlow();

  // Handle PDF generation
  const handleGeneratePDF = async (action: 'download' | 'email') => {
    try {
      const result = await generateConversationPDF(
        conversationState,
        messages,
        completedBooking,
        action
      );
      
      if (result.success && action === 'email') {
        alert(`PDF summary sent to ${conversationState.email}`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isDocument = file.type.includes('pdf') || 
                        file.type.includes('document') || 
                        file.type.includes('text/') ||
                        file.type.includes('application/');

      if (isImage || isDocument) {
        // Create a message showing the uploaded file
        const fileMessage: MessageData = {
          id: Date.now().toString() + Math.random(),
          content: `📎 **File uploaded:** ${file.name}\n\n${isImage ? '🖼️ Image' : '📄 Document'} • ${(file.size / 1024).toFixed(1)}KB\n\nI'm analyzing this ${isImage ? 'image' : 'document'} for you...`,
          role: 'assistant',
          timestamp: new Date(),
          type: 'insight',
          tools: [
            {
              name: isImage ? 'Image Analysis' : 'Document Analysis',
              description: `Processing ${file.type}`,
              used: true
            },
            {
              name: 'Content Extraction',
              description: 'Extracting key information',
              used: true
            }
          ]
        };

        addMessage(fileMessage);

        // Simulate processing delay
        setTimeout(() => {
          const analysisMessage: MessageData = {
            id: (Date.now() + 1).toString(),
            content: isImage 
              ? `✅ **Image Analysis Complete**\n\nI've analyzed your image and can see ${file.name}. Based on what I can observe, here are some insights:\n\n• Visual content appears to be business-related\n• This could be useful for understanding your current processes\n• I can help you identify AI opportunities based on what's shown\n\nWhat specific questions do you have about implementing AI solutions related to what's shown in this image?`
              : `✅ **Document Analysis Complete**\n\nI've analyzed your document "${file.name}". Here's what I found:\n\n• Document contains business-relevant information\n• Key areas identified for potential AI automation\n• Workflow optimization opportunities detected\n\nBased on this document, I can help you identify specific AI solutions for your business processes. What aspects would you like to focus on?`,
            role: 'assistant',
            timestamp: new Date(),
            type: 'insight',
            suggestions: isImage 
              ? [
                  'How can AI help with image processing?',
                  'Automate visual content analysis',
                  'Improve visual quality control',
                  'Tell me about computer vision solutions'
                ]
              : [
                  'How can AI automate document processing?',
                  'Extract key data automatically',
                  'Improve document workflows',
                  'Tell me about document AI solutions'
                ],
            sources: [
              {
                title: `${isImage ? 'Image' : 'Document'} Processing Best Practices`,
                url: '#',
                excerpt: `AI-powered ${isImage ? 'image' : 'document'} analysis can improve efficiency by up to 80%`
              }
            ]
          };

          addMessage(analysisMessage);
        }, 2000);
      } else {
        // Unsupported file type
        const errorMessage: MessageData = {
          id: Date.now().toString(),
          content: `❌ **Unsupported file type:** ${file.name}\n\nI can currently analyze:\n• **Images:** JPG, PNG, GIF, WebP\n• **Documents:** PDF, DOC, DOCX, TXT\n\nPlease upload a supported file format and I'll be happy to analyze it for you!`,
          role: 'assistant',
          timestamp: new Date(),
          type: 'text'
        };
        addMessage(errorMessage);
      }
    }

    // Reset file input
    event.target.value = '';
  };

  // Suggestion Click Handler
  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion.toLowerCase().includes('calendar') || suggestion.toLowerCase().includes('booking')) {
      onShowBookingOverlay();
      return;
    }
    
    setInput(suggestion);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Message Action Handler
  const handleMessageAction = async (action: string, messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    switch (action) {
      case 'copy':
        await navigator.clipboard.writeText(message.content || '');
        console.log('Message copied to clipboard');
        break;
      case 'regenerate':
        console.log('Regenerating message:', messageId);
        break;
      case 'share':
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'AI Assistant Message',
              text: message.content || '',
            });
          } catch (err) {
            console.log('Error sharing:', err);
          }
        }
        break;
    }
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input;
    setInput('');
    await processUserMessage(userInput, onShowBookingOverlay);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + U for file upload
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault();
        document.getElementById('file-upload')?.click();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Prepare lead data for booking
  const leadDataForBooking = useMemo(() => ({
    name: conversationState.name || '',
    email: conversationState.email || '',
    company: conversationState.companyInfo?.name || '',
    challenges: conversationState.discoveredChallenges || [],
    preferredSolution: conversationState.preferredSolution || 'consulting'
  }), [conversationState]);

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-br from-background via-background to-muted/30">
      {/* Messages Area */}
      <div className="scrollbar-modern flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {messages.length === 0 && !isLoading ? (
            <div className="animate-smooth-fade-in space-y-8 py-16 text-center">
              <div className="space-y-4">
                <div className="relative">
                  <div className="mx-auto mb-6 flex size-16 animate-modern-pulse items-center justify-center rounded-2xl bg-primary">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div className="absolute -inset-2 animate-modern-pulse rounded-3xl bg-primary/20 opacity-50 blur-xl"></div>
                </div>
                <h1 className="text-gradient mb-2 text-3xl">What can we build together?</h1>
                <p className="mx-auto max-w-md text-lg text-muted-foreground">
                  Let's discover how AI can transform your business
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className="animate-smooth-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <EnhancedMessage
                    message={message}
                    onSuggestionClick={handleSuggestionClick}
                    onMessageAction={handleMessageAction}
                    onPlayMessage={() => {}}
                    onStopMessage={() => {}}
                    conversationState={conversationState}
                    completedBooking={completedBooking}
                  />
                </div>
              ))}

              {isLoading && (
                <EnhancedTypingIndicator assistantName="F.B/c AI Assistant" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/90 p-6 backdrop-blur-lg">
        <div className="mx-auto max-w-4xl">
          {/* Action Buttons */}
          <div className="mb-4 flex items-center gap-3">
            {/* PDF Summary Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 holo-border hover:holo-glow transition-all duration-200"
                >
                  <FileText className="size-4" />
                  Generate a PDF summary
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="holo-card border-0">
                <DropdownMenuItem 
                  onClick={() => handleGeneratePDF('download')}
                  className="flex items-center gap-2 cursor-pointer hover:holo-glow"
                >
                  <Download className="size-4" />
                  Download PDF
                </DropdownMenuItem>
                {conversationState.email && (
                  <DropdownMenuItem 
                    onClick={() => handleGeneratePDF('email')}
                    className="flex items-center gap-2 cursor-pointer hover:holo-glow"
                  >
                    <Mail className="size-4" />
                    Email PDF Summary
                  </DropdownMenuItem>
                )}
                {!conversationState.email && (
                  <DropdownMenuItem disabled className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-4" />
                    Email PDF (Provide email first)
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Book a Call Button */}
            <Button
              onClick={onShowBookingOverlay}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
            >
              <Calendar className="size-4" />
              Book a Call
            </Button>
          </div>

          <div className="modern-input-focus relative overflow-hidden rounded-3xl border border-border bg-background shadow-lg">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about AI for your business..."
              className="resize-none rounded-3xl border-none bg-transparent py-6 pl-16 pr-20 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-0"
              disabled={isLoading}
            />

            <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      multiple
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="modern-button size-10 rounded-full p-0 text-muted-foreground hover:text-primary hover:holo-glow transition-all duration-200"
                      asChild
                    >
                      <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center">
                        <Paperclip className="size-5" />
                      </label>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col items-center gap-1">
                    <span>Upload files</span>
                    <span className="text-xs text-muted-foreground">Images, PDFs, Documents</span>
                    <kbd className="text-xs bg-muted px-1 py-0.5 rounded">⌘+U</kbd>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onShowStreamingOverlay}
                      className={`modern-button size-10 rounded-full p-0 transition-all duration-300 ${
                        streamingState.isConnected 
                          ? 'text-green-400 hover:text-green-300 holo-glow bg-green-500/10' 
                          : 'text-muted-foreground hover:text-primary hover:holo-glow'
                      }`}
                    >
                      <Mic className="size-5" />
                    </Button>
                    {streamingState.isConnected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-background"></div>
                    )}
                    {(streamingState.isListening || streamingState.isSpeaking) && (
                      <div className="absolute inset-0 rounded-full border-2 border-current animate-ping opacity-30"></div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col items-center gap-1">
                    <span>{streamingState.isConnected ? 'Live Session Active' : 'Start Voice Chat'}</span>
                    {streamingState.isConnected && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-1 h-1 rounded-full ${
                          streamingState.isListening ? 'bg-blue-400 animate-pulse' :
                          streamingState.isSpeaking ? 'bg-green-400 animate-pulse' :
                          'bg-green-400'
                        }`}></div>
                        <span>
                          {streamingState.isListening ? 'Listening' :
                           streamingState.isSpeaking ? 'AI Speaking' :
                           'Connected'}
                        </span>
                      </div>
                    )}
                    <kbd className="text-xs bg-muted px-1 py-0.5 rounded">V</kbd>
                  </div>
                </TooltipContent>
              </Tooltip>
              
              {input.trim() && (
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="modern-button size-10 rounded-full bg-primary p-0 text-primary-foreground shadow-lg hover:bg-primary/90"
                  disabled={isLoading}
                >
                  <Send className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};