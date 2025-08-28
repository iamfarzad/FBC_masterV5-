import { generatePdfWithPuppeteer } from '../src/core/pdf-generator-puppeteer';
import fs from 'fs';
import path from 'path';

// Mock data for sample PDF
const sampleData = {
  leadInfo: {
    name: "John Smith",
    email: "john.smith@techcorp.com",
    company: "TechCorp Solutions",
    role: "CTO"
  },
  conversationHistory: [
    {
      role: "user" as const,
      content: "Hi, I'm looking to implement AI solutions for our customer service operations. We're getting about 1000 support tickets per day and need to automate responses.",
      timestamp: "2024-01-15T10:30:00Z"
    },
    {
      role: "assistant" as const, 
      content: "That's a great use case for AI! I can help you implement an intelligent customer service system. Let me understand your current setup better - what channels do you receive tickets through?",
      timestamp: "2024-01-15T10:31:00Z"
    },
    {
      role: "user" as const,
      content: "We use Zendesk for email tickets and Intercom for live chat. The main issues are response time and consistency in our support quality.",
      timestamp: "2024-01-15T10:32:00Z"
    },
    {
      role: "assistant" as const,
      content: "Perfect! I can help you implement AI-powered responses that integrate with both Zendesk and Intercom. This would reduce response times from hours to minutes and ensure consistent quality. What's your timeline for implementation?",
      timestamp: "2024-01-15T10:33:00Z"
    },
    {
      role: "user" as const,
      content: "We'd like to start within the next 2-3 weeks. Budget isn't a major constraint if we can see clear ROI. Can you provide a demo and cost estimate?",
      timestamp: "2024-01-15T10:35:00Z"
    },
    {
      role: "assistant" as const,
      content: "Absolutely! I'll prepare a personalized demo showing how AI can handle your specific ticket types. Based on your volume, I estimate 60-70% automation rate with 40-50% cost reduction. Let me schedule a detailed consultation.",
      timestamp: "2024-01-15T10:36:00Z"
    },
    {
      role: "user" as const,
      content: "That sounds promising. I'm available tomorrow afternoon for a demo. Can you also prepare some case studies from similar companies?",
      timestamp: "2024-01-15T10:38:00Z"
    },
    {
      role: "assistant" as const,
      content: "Perfect! I'll send you case studies from tech companies with similar ticket volumes and prepare a demo focused on your Zendesk/Intercom integration. Looking forward to our call tomorrow!",
      timestamp: "2024-01-15T10:39:00Z"
    }
  ],
  leadResearch: {
    conversation_summary: "John Smith, CTO at TechCorp Solutions, is seeking AI solutions to automate their customer service operations handling 1000+ daily support tickets. They need intelligent response automation and are ready for immediate implementation.",
    consultant_brief: "High-value prospect with clear use case and budget. Ready for immediate engagement. Recommend personalized demo and ROI calculation within 24 hours.",
    lead_score: 85,
    ai_capabilities_shown: "Natural language processing, automated response generation, sentiment analysis, and integration capabilities for customer service platforms."
  },
  sessionId: "session_12345"
};

async function generateSamplePdfs() {
  // Action logged
  
  // Ensure samples directory exists
  const samplesDir = path.join(process.cwd(), 'public', 'samples');
  if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
  }

  // Generate client-facing PDF
  const clientPdfPath = path.join(samplesDir, 'sample-fb-c-client.pdf');
  try {
    await generatePdfWithPuppeteer(sampleData, clientPdfPath, 'client');
    const clientStats = fs.statSync(clientPdfPath);
    // Action logged
    // Action logged
    // Action logged.toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Client PDF generation failed', error)
  }

  // Generate internal admin PDF
  const internalPdfPath = path.join(samplesDir, 'sample-fb-c-internal.pdf');
  try {
    await generatePdfWithPuppeteer(sampleData, internalPdfPath, 'internal');
    const internalStats = fs.statSync(internalPdfPath);
    // Action logged
    // Action logged
    // Action logged.toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Internal PDF generation failed', error)
  }

  // Action logged
}

generateSamplePdfs().catch(console.error);
