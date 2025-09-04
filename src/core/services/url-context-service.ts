// Simplified URL context service without external dependencies
// For production deployment, this provides basic URL analysis without DOM parsing

export interface URLContextResult {
  url: string;
  title?: string;
  description?: string;
  content: string;
  metadata: {
    author?: string;
    publishDate?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    canonicalUrl?: string;
  };
  extractedText: string;
  wordCount: number;
  readingTime: number;
  error?: string;
}

export class URLContextService {
  private static readonly MAX_CONTENT_LENGTH = 50000; // Limit content size
  private static readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private static readonly USER_AGENT = 'Mozilla/5.0 (compatible; F.B/c AI Bot/1.0; +https://talktoeve.com)';

  /**
   * Analyze a URL and extract comprehensive context information
   */
  static async analyzeURL(url: string): Promise<URLContextResult> {
    try {
      // Validate URL
      const validatedUrl = this.validateAndNormalizeURL(url);
      
      // Fetch the webpage with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
      
      const response = await fetch(validatedUrl, {
        method: 'GET',
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Content-type validation
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        throw new Error(`Unsupported content type: ${  contentType}`);
      }

      // Stream-based reading with 5MB limit
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available');
      }

      const decoder = new TextDecoder();
      let html = '';
      const maxBytes = 5_000_000; // 5MB limit
      let totalBytes = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          totalBytes += value.length;
          if (totalBytes > maxBytes) {
            reader.releaseLock();
            throw new Error('Content too large (exceeds 5MB limit)');
          }
          
          html += decoder.decode(value, { stream: true });
        }
      } finally {
        reader.releaseLock();
      }
      
      // Parse HTML with simple regex (no external dependencies)
      const title = this.extractTitle(html);
      const description = this.extractDescription(html);
      const metadata = this.extractMetadata(html);
      const extractedText = this.extractMainContent(html);
      
      // Calculate reading metrics
      const wordCount = this.countWords(extractedText);
      const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words/minute
      
      // Limit content size
      const limitedContent = extractedText.length > this.MAX_CONTENT_LENGTH 
        ? `${extractedText.substring(0, this.MAX_CONTENT_LENGTH)  }...`
        : extractedText;

      return {
        url: validatedUrl,
        title,
        description,
        content: limitedContent,
        metadata,
        extractedText: limitedContent,
        wordCount,
        readingTime,
      };

    } catch (error: unknown) {
    console.error('URL Context Analysis Error', error)
      
      return {
        url,
        content: '',
        metadata: {},
        extractedText: '',
        wordCount: 0,
        readingTime: 0,
        error: (error as any)?.message ?? 'Failed to analyze URL',
      };
    }
  }

  /**
   * Validate and normalize URL
   */
  private static validateAndNormalizeURL(url: string): string {
    try {
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${  url}`;
      }
      
      const urlObj = new URL(url);
      
      // Security check - only allow HTTPS
      if (urlObj.protocol !== 'https:') {
        throw new Error('Only HTTPS URLs are supported for security');
      }
      
      return urlObj.toString();
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  /**
   * Extract page title
   */
  private static extractTitle(html: string): string {
    // Try multiple regex patterns in order of preference
    const patterns = [
      /<title[^>]*>([^<]+)<\/title>/i,
      /<h1[^>]*>([^<]+)<\/h1>/i,
      /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
      /<meta[^>]*name="twitter:title"[^>]*content="([^"]+)"/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].trim()) {
        return match[1].trim();
      }
    }

    return 'Untitled';
  }

  /**
   * Extract page description
   */
  private static extractDescription(html: string): string {
    // Try multiple regex patterns in order of preference
    const patterns = [
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
      /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
      /<meta[^>]*name="twitter:description"[^>]*content="([^"]+)"/i,
      /<p[^>]*>([^<]{50,200})<\/p>/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].trim()) {
        return match[1].trim().substring(0, 500); // Limit description length
      }
    }

    return '';
  }

  /**
   * Extract comprehensive metadata
   */
  private static extractMetadata(html: string): URLContextResult['metadata'] {
    const metadata: URLContextResult['metadata'] = {};

    // Helper function to extract meta content
    const getMetaContent = (pattern: RegExp): string | undefined => {
      const match = html.match(pattern);
      return match ? match[1] : undefined;
    };

    // Open Graph metadata
    metadata.ogTitle = getMetaContent(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ?? '';
    metadata.ogDescription = getMetaContent(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i) ?? '';
    metadata.ogImage = getMetaContent(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ?? '';

    // Twitter Card metadata
    metadata.twitterTitle = getMetaContent(/<meta[^>]*name="twitter:title"[^>]*content="([^"]+)"/i) ?? '';
    metadata.twitterDescription = getMetaContent(/<meta[^>]*name="twitter:description"[^>]*content="([^"]+)"/i) ?? '';

    // Standard metadata
    metadata.author = getMetaContent(/<meta[^>]*name="author"[^>]*content="([^"]+)"/i) ||
                     getMetaContent(/<meta[^>]*property="article:author"[^>]*content="([^"]+)"/i) || '';
    metadata.publishDate = getMetaContent(/<meta[^>]*name="date"[^>]*content="([^"]+)"/i) ||
                          getMetaContent(/<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"/i) || '';

    // Canonical URL
    const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);
    metadata.canonicalUrl = canonicalMatch?.[1] ?? '';

    // Keywords
    const keywordsMatch = html.match(/<meta[^>]*name="keywords"[^>]*content="([^"]+)"/i);
    if (keywordsMatch && keywordsMatch[1]) {
      metadata.keywords = keywordsMatch[1].split(',').map(k => k.trim()).filter(k => k);
    }

    return metadata;
  }

  /**
   * Extract main content from the page
   */
  private static extractMainContent(html: string): string {
    // Remove unwanted elements with regex
    const cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
      .replace(/<div[^>]*class="[^"]*advertisement[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<div[^>]*class="[^"]*ads[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

    // Try to find main content areas
    const patterns = [
      /<main[^>]*>([\s\S]*?)<\/main>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<body[^>]*>([\s\S]*?)<\/body>/i
    ];

    let bestContent = '';
    let maxLength = 0;

    for (const pattern of patterns) {
      const match = cleanHtml.match(pattern);
      if (match && match[1]) {
        const text = this.extractTextFromHtml(match[1]);
        if (text.length > maxLength) {
          maxLength = text.length;
          bestContent = text;
        }
      }
    }

    // If no structured content found, extract from body
    if (!bestContent) {
      const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        bestContent = this.extractTextFromHtml(bodyMatch?.[1] ?? '');
      }
    }

    // Clean up the text
    return this.cleanText(bestContent);
  }

  private static extractTextFromHtml(html: string): string {
    // Remove HTML tags and extract text content
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Clean and normalize extracted text
   */
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
  }

  /**
   * Count words in text
   */
  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Analyze multiple URLs in parallel
   */
  static async analyzeMultipleURLs(urls: string[]): Promise<URLContextResult[]> {
    const promises = urls.map(url => this.analyzeURL(url));
    return Promise.all(promises);
  }

  /**
   * Extract URLs from text
   */
  static extractURLsFromText(text: string): string[] {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
    return text.match(urlRegex) || [];
  }

  /**
   * Check if URL is accessible
   */
  static async isURLAccessible(url: string): Promise<boolean> {
    try {
      const validatedUrl = this.validateAndNormalizeURL(url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(validatedUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default URLContextService;
