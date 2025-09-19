"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar, 
  Clock, 
  X, 
  CheckCircle, 
  AlertCircle,
  User,
  Mail,
  Building,
  MessageSquare
} from 'lucide-react'
import { MeetingScheduler, type BookingRequest, type TimeSlot } from '@/src/core/meeting-scheduler'

interface BookingInterfaceProps {
  isOpen: boolean
  onClose: () => void
  onBookingComplete?: (meetingId: string) => void
  leadInfo?: {
    name?: string
    email?: string
    company?: string
  }
}

interface BookingFormData {
  name: string
  email: string
  company: string
  message: string
  preferredDate: string
  preferredTime: string
  timeZone: string
}

export const BookingInterface: React.FC<BookingInterfaceProps> = ({ 
  isOpen, 
  onClose, 
  onBookingComplete,
  leadInfo 
}) => {
  const [currentStep, setCurrentStep] = useState<'date' | 'time' | 'details' | 'confirm'>('date')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [bookingData, setBookingData] = useState<BookingFormData>({
    name: leadInfo?.name || '',
    email: leadInfo?.email || '',
    company: leadInfo?.company || '',
    message: '',
    preferredDate: '',
    preferredTime: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  // Load available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate)
    }
  }, [selectedDate])

  const loadAvailableSlots = useCallback(async (date: string) => {
    setLoading(true)
    setError('')
    
    try {
      const slots = await MeetingScheduler.getAvailableSlots(date)
      setAvailableSlots(slots)
    } catch (err) {
      setError('Failed to load available time slots')
      console.error('Error loading slots:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    setCurrentStep('time')
  }, [])

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time)
    setBookingData(prev => ({
      ...prev,
      preferredDate: selectedDate,
      preferredTime: time
    }))
    setCurrentStep('details')
  }, [selectedDate])

  const handleFormChange = useCallback((field: keyof BookingFormData, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleBooking = useCallback(async () => {
    if (!selectedDate || !selectedTime) return

    setLoading(true)
    setError('')

    try {
      const bookingRequest: BookingRequest = {
        leadId: crypto.randomUUID(), // In a real app, this would come from the lead context
        name: bookingData.name,
        email: bookingData.email,
        company: bookingData.company,
        preferredDate: selectedDate,
        preferredTime: selectedTime,
        timeZone: bookingData.timeZone,
        message: bookingData.message
      }

      const result = await MeetingScheduler.bookMeeting(bookingRequest)
      
      if (result.success && result.meeting) {
        onBookingComplete?.(result.meeting.id)
        setCurrentStep('confirm')
      } else {
        setError(result.error || 'Booking failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Booking error:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedDate, selectedTime, bookingData, onBookingComplete])

  const resetBooking = useCallback(() => {
    setCurrentStep('date')
    setSelectedDate('')
    setSelectedTime('')
    setAvailableSlots([])
    setError('')
  }, [])

  const getNextWeekDates = (): Array<{ date: string; display: string }> => {
    const dates: Array<{ date: string; display: string }> = []
    const today = new Date()
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Only include weekdays
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        dates.push({
          date: date.toISOString().split('T')[0] || '',
          display: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        })
      }
    }
    
    return dates
  }

  const formatTime = (time: string | undefined) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours || '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-surface border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-brand" />
              <h2 className="text-xl font-semibold text-text">Schedule a Meeting</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-surface-elevated"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-6">
              
              {/* Progress Steps */}
              <div className="flex items-center justify-center space-x-4">
                {['date', 'time', 'details', 'confirm'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step 
                        ? 'bg-brand text-surface' 
                        : index < ['date', 'time', 'details', 'confirm'].indexOf(currentStep)
                        ? 'bg-green-500 text-surface'
                        : 'bg-surface-elevated text-text-muted'
                    }`}>
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div className={`w-8 h-0.5 ${
                        index < ['date', 'time', 'details', 'confirm'].indexOf(currentStep)
                          ? 'bg-green-500'
                          : 'bg-surface-elevated'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Date Selection */}
              {currentStep === 'date' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium text-text">Select a Date</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {getNextWeekDates().map(({ date, display }) => (
                      <Button
                        key={date}
                        variant={selectedDate === date ? "default" : "outline"}
                        onClick={() => handleDateSelect(date)}
                        className={`h-12 ${
                          selectedDate === date 
                            ? 'bg-brand hover:bg-brand-hover' 
                            : 'hover:bg-surface-elevated'
                        }`}
                      >
                        {display}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Time Selection */}
              {currentStep === 'time' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-text">Select a Time</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep('date')}
                    >
                      Change Date
                    </Button>
                  </div>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          disabled={!slot.available}
                          onClick={() => slot.available && handleTimeSelect(slot.time)}
                          className={`h-12 ${
                            selectedTime === slot.time 
                              ? 'bg-brand hover:bg-brand-hover' 
                              : slot.available
                              ? 'hover:bg-surface-elevated'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          {formatTime(slot.time)}
                        </Button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Details Form */}
              {currentStep === 'details' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-text">Your Details</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep('time')}
                    >
                      Change Time
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-text">Name *</Label>
                        <Input
                          id="name"
                          value={bookingData.name}
                          onChange={(e) => handleFormChange('name', e.target.value)}
                          placeholder="Your full name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-text">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={bookingData.email}
                          onChange={(e) => handleFormChange('email', e.target.value)}
                          placeholder="your@email.com"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="company" className="text-text">Company</Label>
                      <Input
                        id="company"
                        value={bookingData.company}
                        onChange={(e) => handleFormChange('company', e.target.value)}
                        placeholder="Your company name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message" className="text-text">Message (Optional)</Label>
                      <Textarea
                        id="message"
                        value={bookingData.message}
                        onChange={(e) => handleFormChange('message', e.target.value)}
                        placeholder="Any specific topics you'd like to discuss..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 'confirm' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-text mb-2">Meeting Scheduled!</h3>
                    <p className="text-text-muted">
                      We've sent a confirmation email to {bookingData.email}
                    </p>
                  </div>
                  
                  <div className="bg-surface-elevated rounded-lg p-4 text-left">
                    <h4 className="font-medium text-text mb-2">Meeting Details</h4>
                    <div className="space-y-1 text-sm text-text-muted">
                      <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {formatTime(selectedTime)}</p>
                      <p><strong>Duration:</strong> 30 minutes</p>
                      <p><strong>Attendee:</strong> {bookingData.name}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border bg-surface-elevated">
            <div className="flex items-center gap-2">
              {currentStep !== 'date' && currentStep !== 'confirm' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentStep === 'time') setCurrentStep('date')
                    if (currentStep === 'details') setCurrentStep('time')
                  }}
                >
                  Back
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                {currentStep === 'confirm' ? 'Close' : 'Cancel'}
              </Button>
              
              {currentStep === 'confirm' ? (
                <Button onClick={resetBooking} className="bg-brand hover:bg-brand-hover">
                  Schedule Another
                </Button>
              ) : currentStep === 'details' ? (
                <Button
                  onClick={handleBooking}
                  disabled={loading || !bookingData.name || !bookingData.email}
                  className="bg-brand hover:bg-brand-hover"
                >
                  {loading ? 'Scheduling...' : 'Schedule Meeting'}
                </Button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

