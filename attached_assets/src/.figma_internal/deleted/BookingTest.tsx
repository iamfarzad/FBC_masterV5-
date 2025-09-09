import React, { useState } from 'react';
import { CalendarBookingOverlay } from './components/CalendarBookingOverlay';
import { PDFGenerator } from './components/PDFGenerator';
import { Button } from './components/ui/button';

export default function BookingTest() {
  const [showBooking, setShowBooking] = useState(false);
  const [completedBooking, setCompletedBooking] = useState(null);

  const mockLeadData = {
    name: 'John Smith',
    email: 'john@techcorp.com',
    company: {
      name: 'TechCorp',
      domain: 'techcorp.com',
      industry: 'technology',
      insights: ['TechCorp is a growing technology company'],
      challenges: ['workflow automation', 'data analysis']
    },
    discoveredChallenges: ['Improving workflow efficiency', 'Better data insights'],
    preferredSolution: 'consulting' as const,
    leadScore: 85
  };

  const handleBookingComplete = (booking: any) => {
    setCompletedBooking(booking);
    console.log('Booking completed:', booking);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-medium text-foreground">Booking System Test</h1>
        
        <div className="space-y-4">
          <Button 
            onClick={() => setShowBooking(true)}
            className="holo-glow"
          >
            Open Calendar Booking
          </Button>

          {completedBooking && (
            <div className="holo-card p-6 rounded-xl space-y-4">
              <h2 className="text-lg font-medium">Booking Completed!</h2>
              <div className="space-y-2">
                <p><strong>Name:</strong> {completedBooking.name}</p>
                <p><strong>Email:</strong> {completedBooking.email}</p>
                <p><strong>Company:</strong> {completedBooking.company}</p>
                <p><strong>Date:</strong> {completedBooking.selectedDate?.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {completedBooking.selectedTime}</p>
                <p><strong>Timezone:</strong> {completedBooking.timezone}</p>
              </div>
              
              <div className="pt-4">
                <h3 className="font-medium mb-2">PDF Generator Test:</h3>
                <PDFGenerator
                  leadData={mockLeadData}
                  bookingData={completedBooking}
                />
              </div>
            </div>
          )}
        </div>

        <CalendarBookingOverlay
          isOpen={showBooking}
          onClose={() => setShowBooking(false)}
          onBookingComplete={handleBookingComplete}
          leadData={mockLeadData}
        />
      </div>
    </div>
  );
}