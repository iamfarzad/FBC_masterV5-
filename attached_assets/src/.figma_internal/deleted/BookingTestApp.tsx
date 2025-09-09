import React, { useState } from 'react';
import { CalendarBookingOverlay } from './components/CalendarBookingOverlay';
import { PDFGenerator } from './components/PDFGenerator';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { TooltipProvider } from './components/ui/tooltip';

interface BookingData {
  name: string;
  email: string;
  company: string;
  message: string;
  selectedDate: Date | null;
  selectedTime: string;
  timezone: string;
}

export default function BookingTestApp() {
  const [showBooking, setShowBooking] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<BookingData | null>(null);

  const mockLeadData = {
    name: 'John Smith',
    email: 'john@techcorp.com',
    company: 'TechCorp Inc.',
    challenges: ['workflow automation', 'data analysis', 'customer service efficiency'],
    preferredSolution: 'consulting' as const
  };

  const mockLeadDataFull = {
    name: 'John Smith',
    email: 'john@techcorp.com',
    company: {
      name: 'TechCorp Inc.',
      domain: 'techcorp.com',
      industry: 'technology',
      insights: ['TechCorp is a fast-growing technology company', 'Strong focus on innovation'],
      challenges: ['workflow automation', 'data analysis', 'customer service efficiency']
    },
    discoveredChallenges: ['Improving workflow efficiency', 'Better data insights', 'Scaling customer support'],
    preferredSolution: 'consulting' as const,
    leadScore: 85,
    conversationSummary: 'Discussed AI implementation challenges and solutions for TechCorp.'
  };

  const handleBookingComplete = (booking: BookingData) => {
    setCompletedBooking(booking);
    console.log('Booking completed:', booking);
  };

  // Simulate different conversation stages
  const triggerBookingFlow = () => {
    setShowBooking(true);
  };

  const generatePDF = () => {
    // This would normally be triggered from a CTA message in the chat
    console.log('PDF generation triggered');
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-medium text-foreground">
              🗓️ Calendar Booking & PDF System Test
            </h1>
            <p className="text-muted-foreground">
              Testing the integrated calendar booking system and PDF generation
            </p>
          </div>
          
          {/* Demo Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="holo-card p-6 rounded-xl space-y-4">
              <h2 className="text-xl font-medium flex items-center gap-2">
                📅 Booking System Test
              </h2>
              <p className="text-sm text-muted-foreground">
                Test the complete calendar booking flow with iCal generation
              </p>
              <Button 
                onClick={triggerBookingFlow}
                className="w-full holo-glow"
                size="lg"
              >
                Open Calendar Booking
              </Button>
            </div>

            <div className="holo-card p-6 rounded-xl space-y-4">
              <h2 className="text-xl font-medium flex items-center gap-2">
                📄 PDF Generation Test
              </h2>
              <p className="text-sm text-muted-foreground">
                Generate and download strategy summary PDFs
              </p>
              <PDFGenerator
                leadData={mockLeadDataFull}
                bookingData={completedBooking}
              />
            </div>
          </div>

          {/* Mock Lead Data Display */}
          <div className="holo-card p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-medium">Sample Lead Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Name:</strong> {mockLeadData.name}</p>
                <p><strong>Email:</strong> {mockLeadData.email}</p>
                <p><strong>Company:</strong> {mockLeadData.company}</p>
                <p><strong>Solution:</strong> {mockLeadData.preferredSolution}</p>
              </div>
              <div>
                <p><strong>Challenges:</strong></p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {mockLeadData.challenges.map((challenge, index) => (
                    <Badge key={index} variant="secondary" className="text-xs holo-border bg-transparent">
                      {challenge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Confirmation */}
          {completedBooking && (
            <div className="holo-card p-6 rounded-xl space-y-4 scan-line">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <h2 className="text-xl font-medium">Booking Confirmed!</h2>
                  <p className="text-sm text-muted-foreground">Your AI strategy session has been scheduled</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Session Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Attendee:</strong> {completedBooking.name}</p>
                    <p><strong>Email:</strong> {completedBooking.email}</p>
                    <p><strong>Company:</strong> {completedBooking.company}</p>
                    <p><strong>Date:</strong> {completedBooking.selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                    <p><strong>Time:</strong> {completedBooking.selectedTime} ({completedBooking.timezone})</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Discussion Topics</h4>
                  <p className="text-sm text-muted-foreground">
                    {completedBooking.message || 'AI implementation strategy and business automation opportunities.'}
                  </p>
                  
                  <div className="pt-3">
                    <h5 className="font-medium text-sm mb-2">Download Resources:</h5>
                    <PDFGenerator
                      leadData={mockLeadDataFull}
                      bookingData={completedBooking}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integration Status */}
          <div className="holo-card p-6 rounded-xl">
            <h3 className="text-lg font-medium mb-4">Integration Status</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm">Calendar booking system integrated</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm">PDF generation system ready</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm">iCal download functionality active</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm">Holographic design system maintained</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            This booking system is fully integrated into your EnhancedLeadGenerationChat component.
            <br />
            It triggers during the conversation flow when users reach the booking stage.
          </div>
        </div>

        {/* Calendar Booking Overlay */}
        <CalendarBookingOverlay
          isOpen={showBooking}
          onClose={() => setShowBooking(false)}
          onBookingComplete={handleBookingComplete}
          leadData={mockLeadData}
        />
      </div>
    </TooltipProvider>
  );
}