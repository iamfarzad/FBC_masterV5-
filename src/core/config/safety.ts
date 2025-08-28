import { HarmCategory, HarmBlockThreshold } from '@google/genai'

// Safety settings configuration for Gemini API
export const GEMINI_SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

// Content filtering for user inputs
export interface ContentFilterResult {
  isSafe: boolean
  reason?: string
  severity: 'low' | 'medium' | 'high'
}

// Static arrays for ContentFilter class
const BLOCK_PATTERNS = [
  /\b(hack|exploit|attack|malware|virus|trojan)\b/i,
  /\b(illegal|unlawful|fraud|scam|deceptive)\b/i,
  /\b(violence|violent|kill|harm|injure|damage)\b/i,
  /\b(hate|hateful|discrimination|racist|sexist)\b/i,
  /\b(porn|explicit|nsfw|adult)\b/i,
]

const WARNING_PATTERNS = [
  /\b(password|credential|secret|token)\b/i,
  /\b(personal|private|confidential)\b/i,
  /\b(money|payment|financial|bank)\b/i,
]

export class ContentFilter {
  // Block list of harmful patterns
  private static readonly BLOCK_PATTERNS = BLOCK_PATTERNS

  // Warning patterns that need monitoring
  private static readonly WARNING_PATTERNS = WARNING_PATTERNS

  static filterContent(content: string): ContentFilterResult {
    // Check for blocked content
    for (const pattern of this.BLOCK_PATTERNS) {
      if (pattern.test(content)) {
        return {
          isSafe: false,
          reason: 'Content contains blocked keywords or patterns',
          severity: 'high'
        }
      }
    }

    // Check for warning content
    for (const pattern of this.WARNING_PATTERNS) {
      if (pattern.test(content)) {
        return {
          isSafe: true, // Allow but log
          reason: 'Content contains sensitive keywords',
          severity: 'medium'
        }
      }
    }

    // Content is safe
    return {
      isSafe: true,
      severity: 'low'
    }
  }

  // Validate and sanitize user input
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    // Basic sanitization
    let sanitized = input
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .slice(0, 10000) // Limit length

    return sanitized
  }
}

// Export safety configuration for use in API routes
export const getSafetySettings = () => GEMINI_SAFETY_SETTINGS

// Export content filter for use in API routes
export const filterContent = ContentFilter.filterContent
export const sanitizeInput = ContentFilter.sanitizeInput
