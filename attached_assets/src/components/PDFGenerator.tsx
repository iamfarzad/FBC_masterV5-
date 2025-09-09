import React from 'react';
import { Button } from './ui/button';
import { Download, FileText, Mail } from 'lucide-react';

interface LeadData {
  name?: string;
  email?: string;
  company?: {
    name: string;
    domain: string;
    industry: string;
    insights: string[];
    challenges: string[];
  };
  discoveredChallenges?: string[];
  preferredSolution?: 'training' | 'consulting' | 'both';
  leadScore?: number;
  conversationSummary?: string;
}

interface BookingData {
  name: string;
  email: string;
  company: string;
  message: string;
  selectedDate: Date | null;
  selectedTime: string;
  timezone: string;
}

interface PDFGeneratorProps {
  leadData: LeadData;
  bookingData?: BookingData;
  onDownload?: () => void;
  onEmailSent?: () => void;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  leadData,
  bookingData,
  onDownload,
  onEmailSent
}) => {
  const generatePDF = async (action: 'download' | 'email' = 'download') => {
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf@2.5.1');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Colors and styling
    const primaryColor = '#000000';
    const secondaryColor = '#666666';
    const accentColor = '#333333';
    
    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('AI Strategy Summary', 20, 17);
    
    doc.setFontSize(12);
    doc.text('F.B/c AI Consulting', pageWidth - 20, 17, { align: 'right' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 40;
    
    // Client Information
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text('Client Information', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    
    if (leadData.name) {
      doc.text(`Name: ${leadData.name}`, 20, yPosition);
      yPosition += 8;
    }
    
    if (leadData.email) {
      doc.text(`Email: ${leadData.email}`, 20, yPosition);
      yPosition += 8;
    }
    
    if (leadData.company?.name) {
      doc.text(`Company: ${leadData.company.name}`, 20, yPosition);
      yPosition += 8;
    }
    
    if (leadData.company?.industry) {
      doc.text(`Industry: ${leadData.company.industry}`, 20, yPosition);
      yPosition += 8;
    }
    
    if (leadData.leadScore) {
      doc.text(`Lead Score: ${leadData.leadScore}/100`, 20, yPosition);
      yPosition += 15;
    } else {
      yPosition += 10;
    }
    
    // Business Analysis
    if (leadData.company?.insights && leadData.company.insights.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(primaryColor);
      doc.text('Business Analysis', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor);
      
      leadData.company.insights.forEach((insight, index) => {
        const wrappedText = doc.splitTextToSize(`• ${insight}`, pageWidth - 40);
        doc.text(wrappedText, 25, yPosition);
        yPosition += wrappedText.length * 6;
      });
      yPosition += 5;
    }
    
    // Identified Challenges
    if (leadData.discoveredChallenges && leadData.discoveredChallenges.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(primaryColor);
      doc.text('Identified Challenges', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor);
      
      leadData.discoveredChallenges.forEach((challenge, index) => {
        const wrappedText = doc.splitTextToSize(`• ${challenge}`, pageWidth - 40);
        doc.text(wrappedText, 25, yPosition);
        yPosition += wrappedText.length * 6;
      });
      yPosition += 5;
    }
    
    // Recommended Solution
    if (leadData.preferredSolution) {
      doc.setFontSize(16);
      doc.setTextColor(primaryColor);
      doc.text('Recommended Solution', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor);
      
      const solutions = {
        training: 'AI Training for Your Team - Comprehensive training programs to upskill your workforce with hands-on AI implementation.',
        consulting: 'Done-for-You AI Consulting - Full-service AI implementation with our expert team handling the technical aspects.',
        both: 'Combined Approach - AI training for your team combined with consulting services for optimal results.'
      };
      
      const solutionText = solutions[leadData.preferredSolution];
      const wrappedSolution = doc.splitTextToSize(solutionText, pageWidth - 40);
      doc.text(wrappedSolution, 20, yPosition);
      yPosition += wrappedSolution.length * 6 + 10;
    }
    
    // Booking Information (if available)
    if (bookingData) {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(primaryColor);
      doc.text('Scheduled Consultation', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor);
      
      if (bookingData.selectedDate) {
        const dateStr = bookingData.selectedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        doc.text(`Date: ${dateStr}`, 20, yPosition);
        yPosition += 8;
      }
      
      if (bookingData.selectedTime) {
        doc.text(`Time: ${bookingData.selectedTime} (${bookingData.timezone})`, 20, yPosition);
        yPosition += 8;
      }
      
      doc.text('Duration: 30 minutes', 20, yPosition);
      yPosition += 8;
      
      if (bookingData.message) {
        yPosition += 5;
        doc.text('Discussion Topics:', 20, yPosition);
        yPosition += 8;
        
        const wrappedMessage = doc.splitTextToSize(bookingData.message, pageWidth - 40);
        doc.text(wrappedMessage, 25, yPosition);
        yPosition += wrappedMessage.length * 6;
      }
      yPosition += 15;
    }
    
    // Next Steps
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text('Next Steps', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    
    const nextSteps = [
      'Review this personalized AI strategy summary',
      'Prepare any specific questions for your consultation session',
      'Consider your current technology stack and team readiness',
      'Think about your timeline and budget for AI implementation'
    ];
    
    nextSteps.forEach((step, index) => {
      doc.text(`${index + 1}. ${step}`, 25, yPosition);
      yPosition += 8;
    });
    
    yPosition += 10;
    
    // Contact Information
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.text('Contact Information', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.text('F.B/c AI Consulting', 20, yPosition);
    yPosition += 6;
    doc.text('Email: consulting@fbc-ai.com', 20, yPosition);
    yPosition += 6;
    doc.text('Website: www.fbc-ai.com', 20, yPosition);
    
    // Footer
    const footerY = pageHeight - 20;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('© 2024 F.B/c AI Consulting. All rights reserved.', 20, footerY);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - 20, footerY, { align: 'right' });
    
    // Handle action
    if (action === 'download') {
      const fileName = `AI_Strategy_Summary_${leadData.name?.replace(/\s+/g, '_') || 'Client'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      onDownload?.();
    } else if (action === 'email') {
      // Convert to blob for email
      const pdfBlob = doc.output('blob');
      await sendPDFEmail(pdfBlob, leadData);
      onEmailSent?.();
    }
  };
  
  const sendPDFEmail = async (pdfBlob: Blob, leadData: LeadData) => {
    // Mock email sending - in a real app, you'd use a service like EmailJS, SendGrid, etc.
    console.log('Sending PDF email to:', leadData.email);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, you would:
    // 1. Upload the PDF to a temporary storage service
    // 2. Send an email with the PDF attachment using your email service
    // 3. Clean up the temporary file
    
    console.log('Email sent successfully with PDF attachment');
  };

  return (
    <div className="flex gap-3">
      <Button
        onClick={() => generatePDF('download')}
        className="flex items-center gap-2 holo-glow"
        size="sm"
      >
        <Download className="w-4 h-4" />
        Download PDF
      </Button>
      
      {leadData.email && (
        <Button
          onClick={() => generatePDF('email')}
          variant="outline"
          className="flex items-center gap-2 holo-border hover:holo-glow"
          size="sm"
        >
          <Mail className="w-4 h-4" />
          Email PDF
        </Button>
      )}
    </div>
  );
};