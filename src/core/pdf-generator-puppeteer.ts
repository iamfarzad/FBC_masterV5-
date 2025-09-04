import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { GeminiTranslator } from './gemini-translator';

interface SummaryData {
  leadInfo: {
    name: string;
    email: string;
    company?: string;
    role?: string;
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  leadResearch?: {
    conversation_summary?: string;
    consultant_brief?: string;
    lead_score?: number;
    ai_capabilities_shown?: string;
  };
  sessionId: string;
}

type Mode = 'client' | 'internal';

/**
 * Generates a PDF summary using Puppeteer for better reliability
 */
// Initialize Gemini translator for dynamic content translation
const translator = new GeminiTranslator();

export async function generatePdfWithPuppeteer(
  summaryData: SummaryData,
  outputPath: string,
  mode: Mode = 'client',
  language: string = 'en'
): Promise<void> {
  const usePdfLib = process.env.PDF_USE_PDFLIB === 'true'
  // Use Puppeteer by default for modern HTML→PDF, fallback to pdf-lib if explicitly requested
  if (!usePdfLib) {
    try {
      const browser = await puppeteer.launch({
        headless: 'new' as any,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      try {
        const page = await browser.newPage();
        const htmlContent = await generateHtmlContent(summaryData, mode, language);
        await page.setContent(htmlContent, {
          waitUntil: 'networkidle0',
          timeout: 30000
        });
        await page.pdf({
          path: outputPath,
          format: 'A4',
          margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
          printBackground: true,
          preferCSSPageSize: true,
        });
        return
      } finally {
        await browser.close();
      }
    } catch (err) {
      console.error('Puppeteer failed, falling back to pdf-lib:', (err as any)?.message || err)
      await generatePdfWithPdfLib(summaryData, outputPath, mode, language)
      return
    }
  }
  // Use pdf-lib if explicitly requested
  await generatePdfWithPdfLib(summaryData, outputPath, mode, language)
}

async function generatePdfWithPdfLib(summaryData: SummaryData, outputPath: string, mode: Mode = 'client', language: string = 'en'): Promise<void> {
  const pdfDoc = await PDFDocument.create()
  let currentPage = pdfDoc.addPage([595.28, 841.89]) // A4 in points
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let y = 800
  const marginX = 40
  const lineHeight = 14

  const ensurePage = () => {
    if (y < 80) {
      currentPage = pdfDoc.addPage([595.28, 841.89])
      y = 800
    }
  }

  const drawText = (text: string, opts?: { size?: number; color?: unknown; bold?: boolean }) => {
    const size = opts?.size ?? 11
    const color = opts?.color ?? rgb(0.1, 0.1, 0.1)
    currentPage.drawText(text, { x: marginX, y, size, color: (color as any) as Color | undefined, font: opts?.bold ? fontBold : font })
    y -= lineHeight * 1.2
    ensurePage()
  }

  // Header
  drawText('F.B/c AI Consulting', { size: 20, bold: true })
  drawText('AI-Powered Lead Generation & Consulting Report', { size: 12, color: rgb(0.29, 0.33, 0.39) })
  y -= 8

  // Lead info
  drawText('Lead Information', { size: 14, bold: true })
  drawText(`Name: ${summaryData.leadInfo.name || 'Unknown'}`)
  drawText(`Email: ${summaryData.leadInfo.email || 'Unknown'}`)
  if (summaryData.leadInfo.company) drawText(`Company: ${summaryData.leadInfo.company}`)
  if (summaryData.leadInfo.role) drawText(`Role: ${summaryData.leadInfo.role}`)
  drawText(`Session ID: ${summaryData.sessionId}`)
  y -= 4

  // Executive Summary
  if (summaryData.leadResearch?.conversation_summary) {
    drawText('Executive Summary', { size: 14, bold: true })
    wrapAndDrawText(sanitizeTextForPdf(summaryData.leadResearch.conversation_summary))
    y -= 4
  }

  // Consultant Brief
  if (summaryData.leadResearch?.consultant_brief) {
    drawText('Consultant Brief', { size: 14, bold: true })
    wrapAndDrawText(sanitizeTextForPdf(summaryData.leadResearch.consultant_brief))
    y -= 4
  }

  // Footer
  y = Math.max(y, 60)
  currentPage.drawText('Farzad Bayat — AI Consulting Specialist', { x: marginX, y: 50, size: 10, color: rgb(0.42, 0.45, 0.5), font })
  currentPage.drawText('www.farzadbayat.com', { x: marginX, y: 36, size: 10, color: rgb(0.98, 0.75, 0.14), font })

  const pdfBytes = await pdfDoc.save()
  await fs.promises.writeFile(outputPath, pdfBytes)

  function wrapAndDrawText(text: string, size = 11) {
    const maxWidth = 595.28 - marginX * 2
    const words = text.split(/\s+/)
    let line = ''
    for (const word of words) {
      const test = line ? `${line  } ${  word}` : word
      const width = (font.widthOfTextAtSize(test, size))
      if (width > maxWidth) {
        currentPage.drawText(line, { x: marginX, y, size, font, color: rgb(0.28, 0.32, 0.35) })
        y -= lineHeight
        ensurePage()
        line = word
      } else {
        line = test
      }
    }
    if (line) {
      currentPage.drawText(line, { x: marginX, y, size, font, color: rgb(0.28, 0.32, 0.35) })
      y -= lineHeight
      ensurePage()
    }
  }
}

/**
 * Generates HTML content for the PDF with modern design
 */
function buildDefaultOrbLogoDataUri(): string {
  try {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0b1220" stop-opacity="0.10"/>
      <stop offset="70%" stop-color="#0b1220" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#0b1220" stop-opacity="0.50"/>
    </radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="50" cy="50" r="40" fill="url(#g)"/>
  <path d="M 25 21 A 45 45 0 0 1 75 21" fill="none" stroke="#ff5b04" stroke-width="3" stroke-linecap="round" filter="url(#glow)"/>
  <circle cx="50" cy="50" r="5" fill="#ff5b04" filter="url(#glow)"/>
</svg>`
    const base64 = (globalThis as any).Buffer
      ? (globalThis as any).Buffer.from(svg).toString('base64')
      : btoa(unescape(encodeURIComponent(svg)))
    return `data:image/svg+xml;base64,${base64}`
  } catch {
    return ''
  }
}

// Simple translation utility - in production, use a proper i18n library
const translations = {
  en: {
    leadInformation: 'Lead Information',
    executiveSummary: 'Executive Summary',
    consultantBrief: 'Consultant Brief',
    aiCapabilitiesIdentified: 'AI Capabilities Identified',
    conversationHighlights: 'Conversation Highlights',
    strategicRecommendations: 'Strategic Recommendations',
    leadQualificationStatus: 'Lead Qualification Status',
    recommendedNextSteps: 'Recommended Next Steps',
    followUpTimeline: 'Follow-up Timeline',
    immediate: 'Immediate',
    shortTerm: 'Short-term',
    midTerm: 'Mid-term',
    bookDiscoveryCall: 'Book 30‑min Discovery Call',
    viewWorkshop: 'View Workshop',
    nextSteps: 'Next Steps',
    highValueProspect: 'High-Value Prospect',
    qualifiedProspect: 'Qualified Prospect',
    requiresFurtherQualification: 'Requires Further Qualification',
    name: 'Name',
    email: 'Email',
    company: 'Company',
    role: 'Role',
    sessionId: 'Session ID',
    reportDate: 'Report Date'
  },
  no: {
    leadInformation: 'Lead Informasjon',
    executiveSummary: 'Sammendrag',
    consultantBrief: 'Konsulent Rapport',
    aiCapabilitiesIdentified: 'AI Evner Identifisert',
    conversationHighlights: 'Samtale Høydepunkter',
    strategicRecommendations: 'Strategiske Anbefalinger',
    leadQualificationStatus: 'Lead Kvalifikasjonsstatus',
    recommendedNextSteps: 'Anbefalte Neste Skritt',
    followUpTimeline: 'Oppfølgingsplan',
    immediate: 'Umiddelbar',
    shortTerm: 'Kort sikt',
    midTerm: 'Mellomlang sikt',
    bookDiscoveryCall: 'Book 30-min Discovery Call',
    viewWorkshop: 'Se Workshop',
    nextSteps: 'Neste Skritt',
    highValueProspect: 'Høyverdig Prospekt',
    qualifiedProspect: 'Kvalifisert Prospekt',
    requiresFurtherQualification: 'Krever Videre Kvalifisering',
    name: 'Navn',
    email: 'E-post',
    company: 'Selskap',
    role: 'Rolle',
    sessionId: 'Økt ID',
    reportDate: 'Rapport Dato'
  }
};

function t(key: string, language: string = 'en'): string {
  const lang = translations[language as keyof typeof translations] || translations.en;
  return lang[key as keyof typeof lang] || key;
}

async function generateHtmlContent(data: SummaryData, mode: Mode = 'client', language: string = 'en'): Promise<string> {
  const esc = (s: any) => String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

  const { leadInfo, conversationHistory, leadResearch } = data
  const isClient = mode === 'client';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.farzadbayat.com"

  // Use actual logo file path
  const logoPath = isClient
    ? `${appUrl}/fbc-icon/fbc-voice-orb-light-png/fbc-voice-orb-logo.svg`
    : `${appUrl}/fbc-icon/fbc-voice-orb-dark-png/fbc-voice-orb-logo-dark.svg`

  const score = typeof leadResearch?.lead_score === "number" ? leadResearch.lead_score : undefined
  const scoreClass = score == null ? "" : score > 70 ? "high" : score > 40 ? "mid" : "low"

  const lastMessages = (conversationHistory || []).slice(-8)

  // Translate dynamic content if not English
  let translatedSummary = leadResearch?.conversation_summary;
  let translatedBrief = leadResearch?.consultant_brief;
  let translatedCapabilities = leadResearch?.ai_capabilities_shown;

  if (language !== 'en') {
    try {
      if (leadResearch?.conversation_summary) {
        translatedSummary = await translator.translateSummary(leadResearch.conversation_summary, language);
      }
      if (leadResearch?.consultant_brief) {
        translatedBrief = await translator.translateBrief(leadResearch.consultant_brief, language);
      }
      if (leadResearch?.ai_capabilities_shown) {
        translatedCapabilities = await translator.translate(leadResearch.ai_capabilities_shown, language, {
          context: 'AI capabilities and technical features'
        });
      }
    } catch (error) {
      console.warn('Translation failed, using original content:', error);
      // Fall back to original content if translation fails
    }
  }

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Consulting Report - F.B/c</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
            background: #f8f9fa;
            color: #1a1a1a;
            line-height: 1.6;
        }

        .container {
            width: 800px;
            margin: 20px auto;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, #ff5b04 0%, #ff7a33 100%);
            padding: 24px 48px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 16px;
            z-index: 1;
        }

        .logo {
            width: 48px;
            height: 48px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #ff5b04;
            font-size: 18px;
        }

        .brand-text {
            color: white;
        }

        .brand-name {
            font-size: 20px;
            font-weight: 600;
            letter-spacing: -0.5px;
        }

        .brand-tagline {
            font-size: 12px;
            opacity: 0.9;
            margin-top: 2px;
        }

        .doc-type {
            color: white;
            font-size: 13px;
            font-weight: 500;
            background: rgba(255, 255, 255, 0.2);
            padding: 6px 16px;
            border-radius: 20px;
            z-index: 1;
        }

        /* Cover */
        .cover {
            padding: 80px 48px;
            text-align: center;
            background: linear-gradient(180deg, #fafbfc 0%, white 100%);
            border-bottom: 1px solid #e5e7eb;
        }

        .cover-badge {
            display: inline-block;
            background: #ff5b04;
            color: white;
            padding: 8px 20px;
            border-radius: 24px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 32px;
        }

        .cover h1 {
            font-size: 36px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 16px;
            letter-spacing: -1px;
        }

        .cover-meta {
            color: #6b7280;
            font-size: 15px;
            margin-top: 24px;
        }

        .cover-meta-item {
            margin: 4px 0;
        }

        .cover-meta-item strong {
            color: #374151;
            font-weight: 600;
        }

        /* Content Sections */
        .content {
            padding: 48px;
        }

        .section {
            margin-bottom: 48px;
        }

        .section:last-child {
            margin-bottom: 0;
        }

        .section-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }

        .section-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #ff5b04 0%, #ff7a33 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
        }

        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            letter-spacing: -0.3px;
        }

        .card {
            background: #fafbfc;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            position: relative;
            overflow: hidden;
        }

        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #ff5b04 0%, #ff7a33 100%);
        }

        .card-content {
            color: #4b5563;
            line-height: 1.8;
        }

        /* Info Grid */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }

        .info-item {
            display: flex;
            align-items: start;
            gap: 12px;
        }

        .info-label {
            font-weight: 600;
            color: #374151;
            min-width: 80px;
        }

        .info-value {
            color: #6b7280;
        }

        /* Capabilities List */
        .capabilities-list {
            list-style: none;
            padding: 0;
        }

        .capabilities-list li {
            position: relative;
            padding-left: 32px;
            margin-bottom: 16px;
            color: #4b5563;
        }

        .capabilities-list li::before {
            content: '✓';
            position: absolute;
            left: 0;
            top: 0;
            width: 20px;
            height: 20px;
            background: #ff5b04;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }

        /* Next Steps */
        .next-steps-list {
            list-style: none;
            padding: 0;
            counter-reset: step-counter;
        }

        .next-steps-list li {
            position: relative;
            padding-left: 40px;
            margin-bottom: 20px;
            color: #4b5563;
            counter-increment: step-counter;
        }

        .next-steps-list li::before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 0;
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #ff5b04 0%, #ff7a33 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }

        .cta-link {
            color: #ff5b04;
            font-weight: 600;
            text-decoration: none;
            border-bottom: 2px solid transparent;
            transition: border-color 0.2s;
        }

        .cta-link:hover {
            border-bottom-color: #ff5b04;
        }

        /* Priority Badge */
        .priority-badge {
            display: inline-block;
            background: #fef3c7;
            color: #92400e;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-left: 8px;
        }

        /* Footer */
        .footer {
            background: #1a1a1a;
            color: white;
            padding: 32px 48px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .footer-left {
            flex: 1;
        }

        .footer-name {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .footer-contact {
            font-size: 13px;
            color: #9ca3af;
            line-height: 1.6;
        }

        .footer-right {
            text-align: right;
        }

        .footer-website {
            color: #ff5b04;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
        }

        .footer-website:hover {
            color: #ff7a33;
        }

        /* Decorative Elements */
        .decorative-dots {
            position: absolute;
            width: 60px;
            height: 60px;
            opacity: 0.1;
            background-image: radial-gradient(circle, #ff5b04 2px, transparent 2px);
            background-size: 10px 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo-section">
                <div class="logo">
                    <img src="${logoPath}" alt="F.B/c" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">
                </div>
                <div class="brand-text">
                    <div class="brand-name">F.B/c Consulting</div>
                    <div class="brand-tagline">AI Solutions & Strategy</div>
                </div>
            </div>
            <div class="doc-type">${isClient ? 'Executive Report' : 'Lead Analysis'}</div>
        </div>

        <!-- Cover -->
        <div class="cover">
            <div class="cover-badge">AI Readiness Assessment</div>
            <h1>${esc(leadInfo.company || leadInfo.name || "Client")}</h1>
            <div class="cover-meta">
                <div class="cover-meta-item"><strong>Prepared by:</strong> Farzad Bayat</div>
                <div class="cover-meta-item"><strong>Date:</strong> ${new Date().toLocaleDateString(language === 'no' ? 'nb-NO' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                ${!isClient ? `<div class="cover-meta-item"><strong>Session ID:</strong> ${esc(data.sessionId)}</div>` : ''}
                <div class="cover-meta-item"><strong>Classification:</strong> ${isClient ? 'Client Deliverable' : 'Internal Analysis'}</div>
            </div>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Executive Summary -->
            ${translatedSummary ? `
            <div class="section">
                <div class="section-header">
                    <div class="section-icon">ES</div>
                    <h2 class="section-title">${t('executiveSummary', language)}</h2>
                </div>
                <div class="card">
                    <div class="card-content">
                        ${esc(translatedSummary)}
                        ${score != null ? `<span class="priority-badge">${score > 70 ? 'High Priority' : score > 40 ? 'Medium Priority' : 'Follow-up Required'}</span>` : ''}
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Lead Information -->
            <div class="section">
                <div class="section-header">
                    <div class="section-icon">LI</div>
                    <h2 class="section-title">${t('leadInformation', language)}</h2>
                </div>
                <div class="card">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">${t('name', language)}:</span>
                            <span class="info-value">${esc(leadInfo.name || 'Unknown')}</span>
                        </div>
                        ${!isClient ? `<div class="info-item">
                            <span class="info-label">${t('email', language)}:</span>
                            <span class="info-value">${esc(leadInfo.email || 'Unknown')}</span>
                        </div>` : ''}
                        <div class="info-item">
                            <span class="info-label">${t('company', language)}:</span>
                            <span class="info-value">${esc(leadInfo.company || '—')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">${t('role', language)}:</span>
                            <span class="info-value">${esc(leadInfo.role || '—')}</span>
                        </div>
                        ${!isClient ? `<div class="info-item">
                            <span class="info-label">${t('sessionId', language)}:</span>
                            <span class="info-value">${esc(data.sessionId)}</span>
                        </div>` : ''}
                    </div>
                </div>
            </div>

            <!-- Consultant Brief (Internal Only) -->
            ${translatedBrief && !isClient ? `
            <div class="section">
                <div class="section-header">
                    <div class="section-icon">CB</div>
                    <h2 class="section-title">${t('consultantBrief', language)}</h2>
                </div>
                <div class="card">
                    <div class="card-content">
                        ${esc(translatedBrief)}
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- AI Capabilities (Internal Only) -->
            ${!isClient && translatedCapabilities ? `
            <div class="section">
                <div class="section-header">
                    <div class="section-icon">AI</div>
                    <h2 class="section-title">${t('aiCapabilitiesIdentified', language)}</h2>
                </div>
                <div class="card">
                    <ul class="capabilities-list">
                        ${translatedCapabilities.split('\\n').filter(item => item.trim()).map(item => `<li>${esc(item.trim())}</li>`).join('')}
                    </ul>
                </div>
            </div>
            ` : ''}

            <!-- Conversation Highlights (Internal Only) -->
            ${!isClient && lastMessages.length ? `
            <div class="section">
                <div class="section-header">
                    <div class="section-icon">CH</div>
                    <h2 class="section-title">${t('conversationHighlights', language)}</h2>
                </div>
                <div class="card">
                    <div class="card-content">
                        <p><strong>Key Conversation Points:</strong></p>
                        <ul style="margin-top: 12px;">
                            ${lastMessages.slice(0, 5).map(m => `<li style="margin-bottom: 8px;"><strong>${m.role === 'user' ? 'Lead' : 'F.B/c AI'}:</strong> ${esc(m.content).slice(0, 150)}${m.content.length > 150 ? '...' : ''}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Next Steps -->
            <div class="section">
                <div class="section-header">
                    <div class="section-icon">NS</div>
                    <h2 class="section-title">${t('nextSteps', language)}</h2>
                </div>
                <div class="card">
                    <ol class="next-steps-list">
                        <li>
                            <strong>${isClient ? 'Schedule consultation call' : 'Immediate: Book 30-minute discovery call'}</strong> to align on specific requirements and success metrics
                        </li>
                        <li>
                            <strong>Within 72 hours:</strong> Deliver tailored demonstration using client's actual data and use cases
                        </li>
                        <li>
                            <strong>Week 1:</strong> Present comprehensive ROI analysis with phased implementation roadmap and resource allocation plan
                        </li>
                    </ol>
                    ${!isClient ? `
                    <div style="margin-top: 20px; padding: 16px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #ff5b04;">
                        <strong>Priority Actions:</strong><br>
                        <a href="${appUrl}/meetings/book" class="cta-link">Book Discovery Call</a> |
                        <a href="${appUrl}/workshop" class="cta-link">View Workshop</a><br>
                        <small style="color: #6b7280; margin-top: 8px; display: block;">Confirm scope, ROI, and first milestone within 24 hours</small>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-left">
                <div class="footer-name">Farzad Bayat</div>
                <div class="footer-contact">
                    AI Consulting Specialist<br>
                    contact@farzadbayat.com • +47 944 46 446
                </div>
            </div>
            <div class="footer-right">
                <a href="https://www.farzadbayat.com" class="footer-website">www.farzadbayat.com</a>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

/**
 * Generate a temporary PDF file path
 */
export function generatePdfPath(sessionId: string, leadName: string): string {
  const sanitizedName = leadName.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = new Date().toISOString().split('T')[0];
  return `/tmp/FB-c_Summary_${sanitizedName}_${timestamp}_${sessionId}.pdf`;
}

/**
 * Convert markdown-like text to plain text for PDF
 */
export function sanitizeTextForPdf(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '') // Remove markdown headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
    .trim();
}
