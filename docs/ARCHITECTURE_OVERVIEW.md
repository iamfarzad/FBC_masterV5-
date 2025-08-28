# F.B/c AI Consulting Platform - Architecture Overview

## 🏗️ System Architecture

This document provides comprehensive technical details for production deployment and development of the F.B/c AI Consulting Platform.

### Core Principles

- **Clean Architecture**: Framework-agnostic business logic in `src/core/`
- **Modular Design**: Clear separation of concerns across domains
- **Production-Ready**: Enterprise-grade security, monitoring, and scalability
- **Lead Qualification**: 7-stage progressive lead qualification system

---

## 📊 Consent Flow & Data Collection

### Consent Cookie Structure

```typescript
type ConsentCookie = {
  allow: boolean
  allowedDomains: string[]
  ts: number
  policyVersion?: string
  name?: string
  email?: string
  companyDomain?: string | undefined
}
```

### Consent Flow Logic

1. **First Visit**: Consent overlay appears
2. **Domain Extraction**: Auto-extracts company domain from email
3. **Cookie Storage**: 30-day HTTP-only cookie with consent data
4. **Auto-Skip Logic**: If valid consent cookie exists, bypass consent overlay
5. **Context Reuse**: Previous session data auto-populates form

### Consent API Endpoints

```typescript
GET /api/consent    # Check consent status
POST /api/consent   # Grant consent with lead data
DELETE /api/consent # Revoke consent
```

---

## 🎯 7-Stage Lead Qualification System

### Stage Definitions

```typescript
// Actual implementation from src/core/types/intelligence.ts
export type Stage =
  | 'GREETING'                // Initial welcome and consent
  | 'NAME_COLLECTION'         // Gather user identity
  | 'EMAIL_CAPTURE'           // Email and company info
  | 'BACKGROUND_RESEARCH'     // Company and role research
  | 'PROBLEM_DISCOVERY'       // Explore challenges and needs
  | 'SOLUTION_PRESENTATION'   // Present AI solutions and ROI
  | 'CALL_TO_ACTION'          // Generate report and schedule call
```

### Stage Descriptions (User-Facing)

```typescript
const STAGE_DESCRIPTIONS = {
  GREETING: "Discovery & Setup",
  NAME_COLLECTION: "Requirements Analysis",
  EMAIL_CAPTURE: "Solution Design",
  BACKGROUND_RESEARCH: "Implementation Planning",
  PROBLEM_DISCOVERY: "Development & Testing",
  SOLUTION_PRESENTATION: "Deployment & Integration",
  CALL_TO_ACTION: "Review & Optimization"
}
```

### Stage Progression Logic

1. **GREETING**: Initial welcome and consent overlay
2. **NAME_COLLECTION**: Gather user identity and basic info
3. **EMAIL_CAPTURE**: Email and company domain collection
4. **BACKGROUND_RESEARCH**: Company research and role identification via Google/LinkedIn
5. **PROBLEM_DISCOVERY**: Explore business challenges and AI opportunities
6. **SOLUTION_PRESENTATION**: Present tailored AI solutions and ROI projections
7. **CALL_TO_ACTION**: Generate PDF report and schedule consultation call

### Stage Auto-Skip Logic

```typescript
// Skip stages if user returns with valid consent cookie
if (hasValidConsentCookie) {
  // Skip to EMAIL_CAPTURE if we have partial data
  if (hasNameData) currentStage = 'EMAIL_CAPTURE'
  // Skip to BACKGROUND_RESEARCH if we have email
  if (hasEmailData) currentStage = 'BACKGROUND_RESEARCH'
  // Skip to SOLUTION_PRESENTATION if research complete
  if (hasResearchData) currentStage = 'SOLUTION_PRESENTATION'
}

// Skip to CALL_TO_ACTION if report already generated
if (hasGeneratedReport) {
  currentStage = 'CALL_TO_ACTION'
}
```

---

## 💾 Data Storage Architecture

### Core Database Tables

```sql
-- Conversation Context Storage
CREATE TABLE conversation_contexts (
  session_id VARCHAR PRIMARY KEY,
  email VARCHAR NOT NULL,
  name VARCHAR,
  company_url VARCHAR,
  company_context JSONB,
  person_context JSONB,
  role VARCHAR,
  role_confidence DECIMAL,
  intent_data JSONB,
  last_user_message TEXT,
  ai_capabilities_shown TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lead Management
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  company_name VARCHAR,
  role VARCHAR,
  interests TEXT,
  conversation_summary TEXT,
  consultant_brief TEXT,
  lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
  ai_capabilities_shown TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email Activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  type VARCHAR NOT NULL, -- 'email_sent', 'meeting_booked', etc.
  title VARCHAR NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Follow-up Tasks
CREATE TABLE follow_up_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  task_type VARCHAR NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  status VARCHAR DEFAULT 'scheduled',
  task_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Context Storage Class

```typescript
class ContextStorage {
  async store(sessionId: string, payload: Partial<ConversationContext>)
  async get(sessionId: string): Promise<ConversationContext | null>
  async update(sessionId: string, patch: Partial<ConversationContext>)
  async delete(sessionId: string)
}
```

---

## 🎯 Lead Scoring Algorithm

### Actual Scoring Implementation

Based on the current codebase, lead scoring uses these **simple, effective rules**:

```typescript
// Current scoring factors (implemented in PDF generation)
interface LeadScoreFactors {
  nonGenericDomain: boolean    // +20 points: Business email vs gmail/yahoo
  automationKeywords: boolean  // +15 points: Mentions automation, AI, efficiency
  longConversation: boolean    // +10 points: Extended engagement (>5 messages)
  companyResearch: boolean     // +25 points: Found company context
  roleClarity: boolean         // +15 points: Clear job title/seniority
  industryFit: boolean         // +15 points: AI-ready industry
}
```

### Scoring Logic (Actual Implementation)

```typescript
function calculateLeadScore(research: LeadResearch): number {
  let score = 0

  // Domain quality (simple but effective)
  if (research.company?.domain && !isGenericDomain(research.company.domain)) {
    score += 20 // Business email indicates serious inquiry
  }

  // Engagement quality
  if (research.person?.role) {
    score += 15 // Clear role = qualified lead
  }

  // Company research success
  if (research.company?.industry) {
    score += 25 // Found company = high quality lead
  }

  // Industry alignment
  if (isAiReadyIndustry(research.company?.industry)) {
    score += 15 // Tech, Healthcare, Finance = AI-ready
  }

  return Math.min(100, Math.max(0, score))
}

function isGenericDomain(email: string): boolean {
  const generic = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
  const domain = email.split('@')[1]?.toLowerCase()
  return generic.includes(domain)
}

function isAiReadyIndustry(industry?: string): boolean {
  const aiReady = ['Technology', 'Healthcare', 'Finance', 'Manufacturing']
  return aiReady.some(ai => industry?.toLowerCase().includes(ai.toLowerCase()))
}
```

### Score Interpretation (PDF Output)

```typescript
// Used in PDF generation for visual scoring
function getScoreInterpretation(score: number): string {
  if (score >= 80) return "High-Value Prospect - Immediate Priority"
  if (score >= 60) return "Qualified Prospect - Fast Track"
  if (score >= 40) return "Medium Prospect - Nurture Further"
  return "Low-Value Prospect - Monitor Only"
}
```

---

## 📧 Email Automation System

### Email Types & Templates

```typescript
const emailTemplates = {
  welcome: {
    subject: 'Welcome to F.B Consulting - Your AI Transformation Journey Begins',
    timing: 'Immediate after consent'
  },
  follow_up: {
    subject: 'Following Up - Your AI Transformation Opportunity',
    timing: '3 days after welcome'
  },
  report: {
    subject: 'Your Personalized AI Implementation Report',
    timing: 'After PDF generation'
  },
  meeting_confirmation: {
    subject: 'Meeting Confirmed - AI Discovery Call',
    timing: 'After meeting booked'
  },
  proposal: {
    subject: 'Your Custom AI Implementation Proposal',
    timing: 'After discovery call'
  },
  check_in: {
    subject: 'How is Your AI Journey Going?',
    timing: 'Monthly follow-up'
  }
}
```

### Email API Structure

```typescript
POST /api/send-lead-email
{
  leadId: string,
  emailType: 'welcome' | 'follow_up' | 'report' | 'meeting_confirmation' | 'proposal' | 'check_in',
  customData?: Record<string, any>
}
```

### Email Service Integration

```typescript
// Resend Configuration with Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY)

// Multi-tenant/Branding Configuration
const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || 'F.B Consulting <noreply@fbconsulting.ai>',
  replyTo: process.env.RESEND_REPLY_TO || 'hello@fbconsulting.ai',
  brandName: process.env.BRAND_NAME || 'F.B Consulting',
  brandDomain: process.env.BRAND_DOMAIN || 'fbconsulting.ai',
  logoUrl: process.env.BRAND_LOGO_URL || 'https://www.farzadbayat.com/logo.png'
}

// Email Sending Logic with Branding
await resend.emails.send({
  from: EMAIL_CONFIG.from,
  reply_to: EMAIL_CONFIG.replyTo,
  to: [lead.email],
  subject: template.subject.replace('{BRAND}', EMAIL_CONFIG.brandName),
  html: emailHtml.replace(/{BRAND}/g, EMAIL_CONFIG.brandName)
                 .replace(/{DOMAIN}/g, EMAIL_CONFIG.brandDomain)
                 .replace(/{LOGO}/g, EMAIL_CONFIG.logoUrl),
  tags: [
    { name: 'lead_id', value: lead.id },
    { name: 'email_type', value: emailType },
    { name: 'brand', value: EMAIL_CONFIG.brandName }
  ]
})
```

### Multi-Tenant Branding Environment Variables

```bash
# Primary Branding
BRAND_NAME="F.B Consulting"
BRAND_DOMAIN="fbconsulting.ai"
BRAND_LOGO_URL="https://www.farzadbayat.com/logo.png"

# Email Configuration
RESEND_FROM_EMAIL="F.B Consulting <noreply@fbconsulting.ai>"
RESEND_REPLY_TO="hello@fbconsulting.ai"

# App URLs (for email templates)
NEXT_PUBLIC_APP_URL="https://www.farzadbayat.com"
MEETING_BOOKING_URL="https://calendly.com/farzad-bayat"
```

---

## 📄 PDF Generation System

### PDF Types

1. **Client PDF**: Professional report with branding
2. **Internal PDF**: Detailed analysis for consultants

### PDF Generation Flow

```typescript
// Puppeteer-based generation with fallback
async function generatePdfWithPuppeteer(summaryData: SummaryData, outputPath: string)

// Pure JS fallback using pdf-lib
async function generatePdfWithPdfLib(summaryData: SummaryData, outputPath: string)
```

### PDF Branding Configuration

```typescript
// Environment variables for PDF branding
const PDF_CONFIG = {
  companyName: process.env.BRAND_NAME || 'F.B Consulting',
  companyLogo: process.env.BRAND_LOGO_URL,
  primaryColor: process.env.BRAND_COLOR || '#0070f3',
  website: process.env.BRAND_DOMAIN || 'www.farzadbayat.com',
  contactEmail: process.env.CONTACT_EMAIL || 'hello@fbconsulting.ai',
  phone: process.env.CONTACT_PHONE || '+1 (555) 123-4567'
}

// Used in PDF header generation
const pdfHeader = `
  <div class="header">
    <img src="${PDF_CONFIG.companyLogo}" alt="${PDF_CONFIG.companyName} Logo" class="logo">
    <div class="company-info">
      <h1>${PDF_CONFIG.companyName}</h1>
      <p>AI Consulting & Implementation</p>
      <p>${PDF_CONFIG.website} | ${PDF_CONFIG.contactEmail}</p>
    </div>
  </div>
`
```

### Multi-Tenant PDF Environment Variables

```bash
# PDF Branding
BRAND_NAME="F.B Consulting"
BRAND_LOGO_URL="https://www.farzadbayat.com/logo.png"
BRAND_COLOR="#0070f3"

# Contact Information
CONTACT_EMAIL="hello@fbconsulting.ai"
CONTACT_PHONE="+1 (555) 123-4567"
BRAND_DOMAIN="www.farzadbayat.com"
```

### PDF Content Structure

```typescript
interface SummaryData {
  leadInfo: {
    name: string
    email: string
    company?: string
    role?: string
  }
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  leadResearch?: {
    conversation_summary?: string
    consultant_brief?: string
    lead_score?: number
    ai_capabilities_shown?: string
  }
  sessionId: string
}
```

---

## 🔄 End-to-End Test Scenario

### Complete User Journey Test

```typescript
describe('Lead Qualification E2E Flow', () => {
  test('Complete lead journey from consent to CRM handoff', async () => {
    // 1. First visit - consent overlay (GREETING stage)
    await page.goto('/chat')
    expect(await page.isVisible('[data-testid="consent-overlay"]')).toBe(true)

    // 2. Grant consent with lead info (moves to NAME_COLLECTION)
    await page.fill('[data-testid="email-input"]', 'test@company.com')
    await page.fill('[data-testid="name-input"]', 'John Doe')
    await page.click('[data-testid="consent-allow"]')

    // 3. Skip to EMAIL_CAPTURE stage with form data
    expect(await page.textContent('[data-testid="stage-indicator"]')).toContain('Solution Design')

    // 4. AI capabilities exploration (PROBLEM_DISCOVERY stage)
    await page.click('[data-testid="capability-search"]')
    await page.click('[data-testid="capability-pdf"]')
    await page.click('[data-testid="capability-email"]')

    // 5. Progress tracking
    expect(await page.textContent('[data-testid="exploration-progress"]')).toContain('3 of 16')

    // 6. Report generation (SOLUTION_PRESENTATION stage)
    await page.click('[data-testid="generate-report"]')
    await page.waitForSelector('[data-testid="report-ready"]')

    // 7. Email automation (CALL_TO_ACTION stage)
    await page.click('[data-testid="send-welcome-email"]')
    expect(await page.isVisible('[data-testid="email-sent-confirmation"]')).toBe(true)

    // 8. Final stage - Review & Optimization
    expect(await page.textContent('[data-testid="stage-indicator"]')).toContain('Review & Optimization')
  })
})
```

---

## 🔒 Security & Compliance

### Environment Variables Required

```bash
# AI Services
GEMINI_API_KEY=your_production_gemini_key
GOOGLE_SEARCH_API_KEY=your_google_search_key
RESEND_API_KEY=your_resend_api_key

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Authentication
JWT_SECRET=your_secure_64_char_secret
ADMIN_PASSWORD=your_secure_admin_password

# Branding & Multi-Tenant Configuration
BRAND_NAME="F.B Consulting"
BRAND_DOMAIN="www.farzadbayat.com"
BRAND_LOGO_URL="https://www.farzadbayat.com/logo.png"
BRAND_COLOR="#0070f3"
CONTACT_EMAIL="hello@fbconsulting.ai"
CONTACT_PHONE="+1 (555) 123-4567"

# Email Configuration
RESEND_FROM_EMAIL="F.B Consulting <noreply@fbconsulting.ai>"
RESEND_REPLY_TO="hello@fbconsulting.ai"

# App URLs
NEXT_PUBLIC_APP_URL="https://www.farzadbayat.com"
MEETING_BOOKING_URL="https://calendly.com/farzad-bayat"
```

### Security Measures

- **HTTP-only cookies** for consent data
- **JWT authentication** for admin access
- **Rate limiting** on all API endpoints
- **Input validation** using Zod schemas
- **SQL injection protection** via Supabase
- **XSS protection** via Content Security Policy

---

## 📈 Monitoring & Analytics

### Key Metrics Tracked

- **Lead Conversion Rate**: Consent → Report Generated
- **Stage Completion**: Time to reach each stage
- **Email Engagement**: Open rates, click-through rates
- **AI Usage**: Token consumption, API costs
- **User Engagement**: Session duration, feature usage

### Monitoring Tools

- **Supabase Dashboard**: Database performance
- **Vercel Analytics**: Page performance, errors
- **Resend Dashboard**: Email delivery metrics
- **Custom Dashboards**: Lead scoring trends, conversion funnels

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Configure custom domain DNS
- [ ] Set up email domain verification
- [ ] Configure monitoring alerts

### Production Validation

- [ ] Test consent flow with real data
- [ ] Verify PDF generation works
- [ ] Test email sending (use test mode first)
- [ ] Validate lead scoring algorithm
- [ ] Test all 7 stages progression
- [ ] Check mobile responsiveness
- [ ] Verify accessibility compliance

### Post-Deployment

- [ ] Monitor error rates (< 1%)
- [ ] Track lead conversion metrics
- [ ] Set up automated backups
- [ ] Configure log retention
- [ ] Set up performance monitoring

---

This architecture overview provides the technical foundation needed to understand, maintain, and extend the F.B/c AI Consulting Platform for production use with real clients.
