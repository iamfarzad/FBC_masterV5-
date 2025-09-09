import { ConversationState, MessageData } from '../hooks/useConversationFlow';

interface BookingData {
  name: string;
  email: string;
  company: string;
  message: string;
  selectedDate: Date | null;
  selectedTime: string;
  timezone: string;
}

export const generateConversationPDF = async (
  conversationState: ConversationState,
  messages: MessageData[],
  completedBooking?: BookingData | null,
  action: 'download' | 'email' = 'download'
) => {
  // Import jsPDF dynamically
  const { jsPDF } = await import('jspdf@2.5.1');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Generate PDF content based on conversation state and messages
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('AI Conversation Summary', 20, 17);
  
  doc.setFontSize(12);
  doc.text('F.B/c AI Consulting', pageWidth - 20, 17, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  let yPosition = 40;
  
  // Add conversation summary
  doc.setFontSize(16);
  doc.text('Conversation Summary', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  if (conversationState.name) {
    doc.text(`Name: ${conversationState.name}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (conversationState.email) {
    doc.text(`Email: ${conversationState.email}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (conversationState.companyInfo?.name) {
    doc.text(`Company: ${conversationState.companyInfo.name}`, 20, yPosition);
    yPosition += 8;
  }
  
  if (conversationState.leadScore) {
    doc.text(`Lead Score: ${conversationState.leadScore}/100`, 20, yPosition);
    yPosition += 15;
  }
  
  // Add key insights from messages
  const insights = messages.filter(msg => msg.role === 'assistant' && msg.content).slice(-3);
  if (insights.length > 0) {
    doc.setFontSize(16);
    doc.text('Key Discussion Points', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    insights.forEach((insight, index) => {
      const content = insight.content?.substring(0, 200) + '...' || '';
      const wrappedText = doc.splitTextToSize(`• ${content}`, pageWidth - 40);
      doc.text(wrappedText, 25, yPosition);
      yPosition += wrappedText.length * 6 + 5;
    });
  }

  // Add booking information if available
  if (completedBooking) {
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('Scheduled Session', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Date: ${completedBooking.selectedDate?.toLocaleDateString()}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Time: ${completedBooking.selectedTime} (${completedBooking.timezone})`, 20, yPosition);
    yPosition += 8;
    if (completedBooking.message) {
      const wrappedMessage = doc.splitTextToSize(`Topics: ${completedBooking.message}`, pageWidth - 40);
      doc.text(wrappedMessage, 20, yPosition);
      yPosition += wrappedMessage.length * 6;
    }
  }
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('© 2024 F.B/c AI Consulting. All rights reserved.', 20, 280);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - 20, 280, { align: 'right' });
  
  if (action === 'download') {
    const fileName = `AI_Conversation_Summary_${conversationState.name?.replace(/\s+/g, '_') || 'Client'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } else if (action === 'email' && conversationState.email) {
    // Mock email sending - in real implementation, you'd send this to a backend service
    console.log('Sending PDF to:', conversationState.email);
    // You would typically convert the PDF to base64 and send it to your email service
    const pdfBlob = doc.output('blob');
    console.log('PDF blob created for email:', pdfBlob);
    return { success: true, email: conversationState.email };
  }
  
  return { success: true };
};