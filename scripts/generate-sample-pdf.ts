import { generatePdfWithPuppeteer } from '../src/core/pdf-generator-puppeteer';
import fs from 'fs';
import path from 'path';

// Updated sample data with more realistic content
const sampleData = {
  leadInfo: {
    name: "Marcus Jensen",
    email: "marcus.jensen@nordictech.no",
    company: "Nordic Tech Solutions AS",
    role: "Chief Technology Officer"
  },
  conversationHistory: [
    {
      role: "user" as const,
      content: "Hello! I'm exploring AI solutions for our customer support team. We handle approximately 800 support requests daily and need to improve our response times significantly.",
      timestamp: "2024-01-20T09:15:00Z"
    },
    {
      role: "assistant" as const,
      content: "That's an excellent opportunity! I can help you implement intelligent customer service automation. Could you tell me about your current support channels and main challenges?",
      timestamp: "2024-01-20T09:16:00Z"
    },
    {
      role: "user" as const,
      content: "We use Zendesk for email tickets, Intercom for live chat, and have a phone support team. Our biggest challenges are maintaining consistent response quality and reducing the time from ticket creation to first response.",
      timestamp: "2024-01-20T09:17:00Z"
    },
    {
      role: "assistant" as const,
      content: "Perfect! I can help you implement AI-powered responses that integrate seamlessly with all your channels. This would reduce first response times from hours to minutes while maintaining high quality. What's your timeline for implementation?",
      timestamp: "2024-01-20T09:18:00Z"
    },
    {
      role: "user" as const,
      content: "We're looking to start within the next 3-4 weeks. We have budget allocated and are focused on ROI. Can you provide a detailed proposal and demo?",
      timestamp: "2024-01-20T09:20:00Z"
    },
    {
      role: "assistant" as const,
      content: "Absolutely! Based on your volume, I can estimate 65-75% automation rate with 40-50% cost reduction. I'll prepare a comprehensive proposal with implementation timeline and ROI projections. Would you be available for a 30-minute discovery call next week?",
      timestamp: "2024-01-20T09:21:00Z"
    }
  ],
  leadResearch: {
    conversation_summary: "Marcus Jensen, CTO at Nordic Tech Solutions AS, is seeking AI solutions to optimize their customer service operations handling 800+ daily support requests. They need intelligent automation and are ready for immediate implementation with allocated budget.",
    consultant_brief: "High-value enterprise prospect with clear technical requirements and budget approval. Strong decision-making authority. Recommend immediate demo booking and comprehensive ROI analysis. Priority: Schedule discovery call within 48 hours.",
    lead_score: 92,
    ai_capabilities_shown: "Advanced natural language processing, multi-channel integration, sentiment analysis, automated ticket routing, and real-time response optimization for customer service platforms."
  },
  sessionId: "session_nordic_2024_001"
};

async function generateFreshSamplePdfs() {
  console.log('🎨 Generating Fresh PDF Samples with Latest Design...\n');

  // Ensure samples directory exists
  const samplesDir = path.join(process.cwd(), 'public', 'samples');
  if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
  }

  // Clean up old samples first
  const existingSamples = fs.readdirSync(samplesDir).filter(f => f.endsWith('.pdf'));
  console.log(`🧹 Cleaning up ${existingSamples.length} existing samples...`);
  existingSamples.forEach(file => {
    try {
      fs.unlinkSync(path.join(samplesDir, file));
    } catch (err) {
      console.warn(`Could not delete ${file}:`, err.message);
    }
  });

  const samples = [
    { name: 'Internal Consultant View', file: 'sample-fb-c-internal.pdf', mode: 'internal' as const, language: 'en' },
    { name: 'Client Presentation', file: 'sample-fb-c-client.pdf', mode: 'client' as const, language: 'en' },
    { name: 'English Professional', file: 'sample-fb-c-english.pdf', mode: 'client' as const, language: 'en' },
    { name: 'Norwegian Translation', file: 'sample-fb-c-norwegian.pdf', mode: 'client' as const, language: 'no' },
    { name: 'Branded Version', file: 'sample-fb-c-branded.pdf', mode: 'internal' as const, language: 'en' },
    { name: 'Legacy Comparison', file: 'sample-fb-c-legacy.pdf', mode: 'client' as const, language: 'en' }
  ];

  console.log('📊 Sample Data:');
  console.log(`   Name: ${sampleData.leadInfo.name}`);
  console.log(`   Company: ${sampleData.leadInfo.company}`);
  console.log(`   Lead Score: ${sampleData.leadResearch?.lead_score}/100`);
  console.log(`   Session: ${sampleData.sessionId}`);
  console.log('');

  for (const sample of samples) {
    console.log(`📄 Generating ${sample.name} (${sample.language.toUpperCase()})...`);

    const outputPath = path.join(samplesDir, sample.file);

    try {
      await generatePdfWithPuppeteer(sampleData, outputPath, sample.mode, sample.language);

      // Check file stats
      const stats = fs.statSync(outputPath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);

      console.log(`✅ ${sample.name} Generated Successfully!`);
      console.log(`📊 File Size: ${fileSizeKB} KB`);
      console.log(`📁 Location: ${outputPath}`);
      console.log(`🌍 Language: ${sample.language}`);
      console.log(`🎯 Mode: ${sample.mode}`);
      console.log('');

    } catch (error) {
      console.error(`❌ ${sample.name} Generation Failed:`, error.message);
      console.error('Stack:', error.stack);
      console.log('');
    }
  }

  console.log('🎉 Fresh PDF Sample Generation Complete!');
  console.log('📂 Check public/samples/ for all new samples');
  console.log('');
  console.log('🔍 New Design Features:');
  console.log('   • Modern card-based layout with CSS custom properties');
  console.log('   • Professional gradient header with F.B/c branding');
  console.log('   • Enhanced typography and spacing');
  console.log('   • AI-powered translation support');
  console.log('   • Responsive design elements');
  console.log('   • Improved visual hierarchy');
  console.log('   • Brand-consistent color scheme');
}

generateFreshSamplePdfs().catch(console.error);
