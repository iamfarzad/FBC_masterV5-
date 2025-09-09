import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  CalendarDays, 
  Clock, 
  User, 
  Mail, 
  Building, 
  MessageSquare,
  Download,
  Send,
  CheckCircle,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface BookingData {
  name: string;
  email: string;
  company: string;
  message: string;
  selectedDate: Date | null;
  selectedTime: string;
  timezone: string;
}

interface CalendarBookingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (booking: BookingData) => void;
  leadData?: {
    name?: string;
    email?: string;
    company?: string;
    challenges?: string[];
    preferredSolution?: string;
  };
}

export const CalendarBookingOverlay: React.FC<CalendarBookingOverlayProps> = ({
  isOpen,
  onClose,
  onBookingComplete,
  leadData
}) => {
  const [currentStep, setCurrentStep] = useState<'calendar' | 'details' | 'confirmation'>('calendar');
  const [bookingData, setBookingData] = useState<BookingData>({
    name: leadData?.name || '',
    email: leadData?.email || '',
    company: leadData?.company || '',
    message: '',
    selectedDate: null,
    selectedTime: '',
    timezone: 'PST'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Reset state when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep('calendar');
      setBookingData({
        name: leadData?.name || '',
        email: leadData?.email || '',
        company: leadData?.company || '',
        message: '',
        selectedDate: null,
        selectedTime: '',
        timezone: 'PST'
      });
      setIsProcessing(false);
      setBookingConfirmed(false);
      setValidationErrors({});
    }
  }, [isOpen, leadData]);

  // Available time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
  ];

  // Get available dates (next 30 days, excluding weekends)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Exclude weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setBookingData(prev => ({ ...prev, selectedDate: date }));
      if (validationErrors.date) {
        setValidationErrors(prev => ({ ...prev, date: '' }));
      }
    }
  };

  const handleTimeSelect = (time: string) => {
    setBookingData(prev => ({ ...prev, selectedTime: time }));
    if (validationErrors.time) {
      setValidationErrors(prev => ({ ...prev, time: '' }));
    }
  };

  const handleDetailsSubmit = () => {
    const errors: {[key: string]: string} = {};
    
    if (!bookingData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!bookingData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(bookingData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!bookingData.selectedDate) {
      errors.date = 'Please select a date';
    }
    
    if (!bookingData.selectedTime) {
      errors.time = 'Please select a time';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      setCurrentStep('confirmation');
    }
  };

  const handleBookingConfirm = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setBookingConfirmed(true);
      setIsProcessing(false);
      onBookingComplete(bookingData);
      
      // Auto-close after success with longer delay
      setTimeout(() => {
        onClose();
        // Reset will happen via useEffect when dialog reopens
      }, 4000);
    } catch (error) {
      setIsProcessing(false);
      console.error('Booking failed:', error);
      // Could add error handling here
    }
  };

  const generateICalEvent = () => {
    if (!bookingData.selectedDate || !bookingData.selectedTime) return;

    const startDate = new Date(bookingData.selectedDate);
    const [time, period] = bookingData.selectedTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      startDate.setHours(hours + 12, minutes || 0);
    } else if (period === 'AM' && hours === 12) {
      startDate.setHours(0, minutes || 0);
    } else {
      startDate.setHours(hours, minutes || 0);
    }

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30); // 30-minute meeting

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//F.B/c AI Consulting//AI Strategy Session//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:AI Strategy Session with ${bookingData.name}`,
      `DESCRIPTION:AI Strategy consultation session\\nCompany: ${bookingData.company}\\nMessage: ${bookingData.message}`,
      `ORGANIZER:mailto:consulting@fbc-ai.com`,
      `ATTENDEE:mailto:${bookingData.email}`,
      `UID:${Date.now()}@fbc-ai.com`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-strategy-session.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] md:h-[85vh] p-0 holo-card border-none overflow-hidden bg-background/98 backdrop-blur-xl [&>button]:hidden">
        {/* Accessibility Headers - Visually Hidden */}
        <DialogHeader className="sr-only">
          <DialogTitle>Book AI Strategy Session</DialogTitle>
          <DialogDescription>
            Schedule a personalized consultation to explore AI opportunities for your business. 
            Complete the booking process by selecting a date and time, providing your information, and confirming your appointment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-full flex flex-col md:flex-row relative">
          {/* Holographic Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
          </div>
          
          {/* Left Sidebar - Progress & Info */}
          <div className="w-full md:w-72 relative bg-card/80 backdrop-blur-sm border-b md:border-b-0 md:border-r border-border/50 geometric-accent flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl holo-card holo-glow bg-primary/10">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-foreground tracking-wide">
                      Book Your Session
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      AI Strategy Consultation
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Schedule a personalized consultation to explore AI opportunities for your business
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 mb-8">
                <div className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  currentStep === 'calendar' 
                    ? 'holo-card holo-glow bg-primary/5 scan-line' 
                    : currentStep !== 'calendar' && (currentStep === 'details' || currentStep === 'confirmation')
                    ? 'bg-primary/10 holo-border'
                    : 'opacity-50 hover:opacity-70'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    currentStep === 'calendar' 
                      ? 'bg-primary text-primary-foreground holo-glow' 
                      : currentStep !== 'calendar' && (currentStep === 'details' || currentStep === 'confirmation')
                      ? 'bg-primary/20 text-primary border-2 border-primary/30'
                      : 'holo-border bg-background/50 text-muted-foreground'
                  }`}>
                    {currentStep !== 'calendar' && (currentStep === 'details' || currentStep === 'confirmation') ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      '1'
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">Select Date & Time</div>
                    <div className="text-xs text-muted-foreground">Choose your preferred slot</div>
                  </div>
                </div>

                <div className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  currentStep === 'details' 
                    ? 'holo-card holo-glow bg-primary/5 scan-line' 
                    : currentStep === 'confirmation'
                    ? 'bg-primary/10 holo-border'
                    : 'opacity-50 hover:opacity-70'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    currentStep === 'details' 
                      ? 'bg-primary text-primary-foreground holo-glow' 
                      : currentStep === 'confirmation'
                      ? 'bg-primary/20 text-primary border-2 border-primary/30'
                      : 'holo-border bg-background/50 text-muted-foreground'
                  }`}>
                    {currentStep === 'confirmation' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      '2'
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">Your Information</div>
                    <div className="text-xs text-muted-foreground">Contact details & topics</div>
                  </div>
                </div>

                <div className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  currentStep === 'confirmation' 
                    ? 'holo-card holo-glow bg-primary/5 scan-line' 
                    : 'opacity-50 hover:opacity-70'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    currentStep === 'confirmation' 
                      ? 'bg-primary text-primary-foreground holo-glow' 
                      : 'holo-border bg-background/50 text-muted-foreground'
                  }`}>
                    3
                  </div>
                  <div>
                    <div className="text-sm font-medium">Confirm Booking</div>
                    <div className="text-xs text-muted-foreground">Review & finalize</div>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              <div className="holo-card rounded-xl p-5 space-y-4 flex-1 geometric-accent">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <h3 className="font-medium text-foreground">Session Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 holo-border">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">30 minutes</div>
                      <div className="text-xs text-muted-foreground">Focused consultation</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 holo-border">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">1-on-1 consultation</div>
                      <div className="text-xs text-muted-foreground">Private session</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 holo-border">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Personalized AI strategy</div>
                      <div className="text-xs text-muted-foreground">Tailored recommendations</div>
                    </div>
                  </div>
                </div>

                {leadData?.challenges && leadData.challenges.length > 0 && (
                  <div className="pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium">Topics to discuss:</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {leadData.challenges.slice(0, 2).map((challenge, index) => (
                        <Badge key={index} variant="secondary" className="text-xs holo-border bg-primary/5 text-primary border-primary/20">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative">
            {/* Custom Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-50 h-8 w-8 p-0 holo-border hover:holo-glow bg-background/80 backdrop-blur-sm rounded-full"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="p-6 h-full">
              {bookingConfirmed ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-8 max-w-md">
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center holo-glow">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-green-500/5 animate-ping"></div>
                    </div>
                    <div className="space-y-6">
                      <h2 className="text-3xl font-medium text-foreground">Booking Confirmed!</h2>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          Your AI Strategy Session has been successfully scheduled.
                        </p>
                        
                        <div className="holo-card rounded-lg p-4 bg-primary/5 border-primary/20">
                          <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Date:</span>
                              <span className="font-medium">
                                {bookingData.selectedDate && formatDate(bookingData.selectedDate)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Time:</span>
                              <span className="font-medium">{bookingData.selectedTime} ({bookingData.timezone})</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="font-medium">30 minutes</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span>Confirmation email sent to {bookingData.email}</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span>Calendar invite included</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground text-center">
                          This dialog will close automatically in a few seconds
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : currentStep === 'confirmation' ? (
                <div className="h-full">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                      <h3 className="text-xl font-medium text-foreground">Confirm Your Booking</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Review your booking details before confirming</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-120px)]">
                    {/* Booking Summary */}
                    <div className="space-y-5">
                      <div className="holo-card rounded-xl p-6 space-y-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                          <h4 className="font-medium text-foreground">Booking Summary</h4>
                        </div>

                        {/* Date & Time */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 holo-border">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <CalendarDays className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {bookingData.selectedDate && formatDate(bookingData.selectedDate)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {bookingData.selectedTime} ({bookingData.timezone})
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 holo-border">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">30 minutes</div>
                              <div className="text-xs text-muted-foreground">AI Strategy Session</div>
                            </div>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="pt-4 border-t border-border/30 space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Contact Information</span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Name:</span>
                              <span className="font-medium">{bookingData.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Email:</span>
                              <span className="font-medium">{bookingData.email}</span>
                            </div>
                            {bookingData.company && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Company:</span>
                                <span className="font-medium">{bookingData.company}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message & Actions */}
                    <div className="space-y-5">
                      <div className="holo-card rounded-xl p-6 h-full space-y-6">
                        {bookingData.message && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <MessageSquare className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">Discussion Topics</span>
                            </div>
                            <div className="p-4 bg-background/50 holo-border rounded-lg">
                              <p className="text-sm text-muted-foreground">{bookingData.message}</p>
                            </div>
                          </div>
                        )}

                        {leadData?.challenges && leadData.challenges.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">Based on our conversation:</span>
                            </div>
                            <div className="space-y-2">
                              {leadData.challenges.map((challenge, index) => (
                                <div key={index} className="flex items-center gap-3 text-sm p-2 rounded bg-background/50">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  <span>{challenge}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t border-border/30">
                          <Button
                            onClick={generateICalEvent}
                            variant="outline"
                            className="w-full h-12 holo-border hover:holo-glow mb-4"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Calendar Event
                          </Button>
                          
                          <div className="text-xs text-muted-foreground text-center">
                            <p>You'll receive a confirmation email with meeting details</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-border/30">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('details')}
                      className="holo-border hover:holo-glow h-12 px-6"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleBookingConfirm}
                      disabled={isProcessing}
                      className={`flex-1 h-12 transition-all duration-200 ${
                        isProcessing
                          ? 'opacity-50 cursor-not-allowed'
                          : 'holo-glow bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : currentStep === 'calendar' ? (
                <div className="h-full">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                      <h3 className="text-xl font-medium text-foreground">Select Date & Time</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Choose a date and time that works best for you</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-120px)]">
                    {/* Calendar */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Available Dates {validationErrors.date && <span className="text-red-500">*</span>}
                      </Label>
                      {validationErrors.date && (
                        <p className="text-xs text-red-500 mb-2">{validationErrors.date}</p>
                      )}
                      <div className="holo-card rounded-xl p-6 h-fit">
                        <Calendar
                          mode="single"
                          selected={bookingData.selectedDate || undefined}
                          onSelect={handleDateSelect}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today || date.getDay() === 0 || date.getDay() === 6;
                          }}
                          className="w-full mx-auto"
                        />
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Available Times {validationErrors.time && <span className="text-red-500">*</span>}
                      </Label>
                      {validationErrors.time && (
                        <p className="text-xs text-red-500 mb-2">{validationErrors.time}</p>
                      )}
                      {bookingData.selectedDate ? (
                        <div className="space-y-4">
                          <div className="holo-card rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/5 holo-border">
                              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                              <p className="font-medium">
                                {formatDate(bookingData.selectedDate)}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto scrollbar-modern pr-2">
                              {timeSlots.map((time, index) => (
                                <Button
                                  key={index}
                                  variant={bookingData.selectedTime === time ? 'default' : 'outline'}
                                  size="sm"
                                  className={`text-sm h-12 transition-all duration-200 ${
                                    bookingData.selectedTime === time 
                                      ? 'holo-glow bg-primary text-primary-foreground' 
                                      : 'holo-border hover:holo-glow hover:bg-primary/5'
                                  }`}
                                  onClick={() => handleTimeSelect(time)}
                                >
                                  <Clock className="w-3 h-3 mr-2" />
                                  {time}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {bookingData.selectedTime && (
                            <Button
                              className="w-full h-12 holo-glow bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() => setCurrentStep('details')}
                            >
                              Continue to Details
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="holo-card rounded-xl p-12 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/5 flex items-center justify-center">
                            <CalendarDays className="w-8 h-8 text-primary/50" />
                          </div>
                          <p className="text-muted-foreground">Please select a date first</p>
                          <p className="text-sm text-muted-foreground/70 mt-1">Available Monday through Friday</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : currentStep === 'details' ? (
                <div className="h-full">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                      <h3 className="text-xl font-medium text-foreground">Your Information</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Help us prepare for your personalized session</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-120px)]">
                    <div className="space-y-5">
                      <div className="holo-card rounded-xl p-6 space-y-5">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Full Name *
                          </Label>
                          <Input
                            id="name"
                            value={bookingData.name}
                            onChange={(e) => {
                              setBookingData(prev => ({ ...prev, name: e.target.value }));
                              if (validationErrors.name) {
                                setValidationErrors(prev => ({ ...prev, name: '' }));
                              }
                            }}
                            placeholder="Your full name"
                            className={`mt-3 h-12 holo-border hover:holo-glow focus:holo-glow bg-background/50 ${
                              validationErrors.name ? 'border-red-500 focus:border-red-500' : ''
                            }`}
                          />
                          {validationErrors.name && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="email" className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Work Email *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={bookingData.email}
                            onChange={(e) => {
                              setBookingData(prev => ({ ...prev, email: e.target.value }));
                              if (validationErrors.email) {
                                setValidationErrors(prev => ({ ...prev, email: '' }));
                              }
                            }}
                            placeholder="your.email@company.com"
                            className={`mt-3 h-12 holo-border hover:holo-glow focus:holo-glow bg-background/50 ${
                              validationErrors.email ? 'border-red-500 focus:border-red-500' : ''
                            }`}
                          />
                          {validationErrors.email && (
                            <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="company" className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Company Name
                          </Label>
                          <Input
                            id="company"
                            value={bookingData.company}
                            onChange={(e) => setBookingData(prev => ({ ...prev, company: e.target.value }))}
                            placeholder="Your company name"
                            className="mt-3 h-12 holo-border hover:holo-glow focus:holo-glow bg-background/50"
                          />
                        </div>

                        <div>
                          <Label htmlFor="timezone" className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Timezone</Label>
                          <Select value={bookingData.timezone} onValueChange={(value) => setBookingData(prev => ({ ...prev, timezone: value }))}>
                            <SelectTrigger className="mt-3 h-12 holo-border hover:holo-glow bg-background/50">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent className="holo-card border-none">
                              <SelectItem value="PST">Pacific Standard Time (PST)</SelectItem>
                              <SelectItem value="MST">Mountain Standard Time (MST)</SelectItem>
                              <SelectItem value="CST">Central Standard Time (CST)</SelectItem>
                              <SelectItem value="EST">Eastern Standard Time (EST)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="holo-card rounded-xl p-6 h-full">
                        <Label htmlFor="message" className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          What would you like to discuss? (Optional)
                        </Label>
                        <Textarea
                          id="message"
                          value={bookingData.message}
                          onChange={(e) => setBookingData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Tell us about your AI goals, challenges, or specific topics you'd like to cover..."
                          className="mt-3 h-40 holo-border hover:holo-glow focus:holo-glow resize-none bg-background/50"
                        />

                        {leadData?.challenges && (
                          <div className="mt-6 p-4 bg-primary/5 holo-border rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-primary" />
                              Based on our conversation:
                            </p>
                            <div className="space-y-2">
                              {leadData.challenges.map((challenge, index) => (
                                <div key={index} className="flex items-center gap-3 text-sm p-2 rounded bg-background/50">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  <span>{challenge}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-border/30">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('calendar')}
                      className="holo-border hover:holo-glow h-12 px-6"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleDetailsSubmit}
                      disabled={!bookingData.name || !bookingData.email || !bookingData.selectedDate || !bookingData.selectedTime}
                      className={`flex-1 h-12 transition-all duration-200 ${
                        bookingData.name && bookingData.email && bookingData.selectedDate && bookingData.selectedTime
                          ? 'holo-glow bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
                      }`}
                    >
                      Continue to Confirmation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};