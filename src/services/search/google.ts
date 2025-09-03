export interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
  formattedUrl: string
}

export interface GoogleSearchResponse {
  items: GoogleSearchResult[]
  searchInformation: {
    totalResults: string
    searchTime: number
  }
}

export interface SearchOptions {
  num?: number
  start?: number
  safe?: 'active' | 'off'
  lr?: string
  dateRestrict?: string
  siteSearch?: string
  exactTerms?: string
  excludeTerms?: string
  fileType?: string
  rights?: string
}

export class GoogleSearchService {
  private static readonly BASE_URL = 'https://www.googleapis.com/customsearch/v1'
  private static readonly DEFAULT_NUM_RESULTS = 10
  private static readonly MAX_RESULTS = 10
  private static readonly REQUEST_TIMEOUT = 10000 // 10 seconds

  static isConfigured(): boolean {
    return !!(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID)
  }

  static async search(query: string, options: SearchOptions = {}): Promise<GoogleSearchResponse> {
    try {
      // Validate environment variables
      const apiKey = process.env.GOOGLE_SEARCH_API_KEY
      const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID

      if (!apiKey) {
        throw new Error('GOOGLE_SEARCH_API_KEY environment variable is not set')
      }

      if (!searchEngineId) {
        throw new Error('GOOGLE_SEARCH_ENGINE_ID environment variable is not set')
      }

      // Validate and sanitize query
      if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty')
      }

      const sanitizedQuery = this.sanitizeQuery(query)

      // Build search parameters
      const searchParams = new URLSearchParams({
        key: apiKey,
        cx: searchEngineId,
        q: sanitizedQuery,
        num: Math.min(options.num || this.DEFAULT_NUM_RESULTS, this.MAX_RESULTS).toString(),
        start: (options.start || 1).toString(),
        safe: options.safe || 'active'
      })

      // Add optional parameters
      if (options.lr) searchParams.append('lr', options.lr)
      if (options.dateRestrict) searchParams.append('dateRestrict', options.dateRestrict)
      if (options.siteSearch) searchParams.append('siteSearch', options.siteSearch)
      if (options.exactTerms) searchParams.append('exactTerms', options.exactTerms)
      if (options.excludeTerms) searchParams.append('excludeTerms', options.excludeTerms)
      if (options.fileType) searchParams.append('fileType', options.fileType)
      if (options.rights) searchParams.append('rights', options.rights)

      const url = `${this.BASE_URL}?${searchParams.toString()}`

      // Make the request with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'F.B/c Search Service/1.0'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Google Search API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      return {
        items: data.items || [],
        searchInformation: data.searchInformation || { totalResults: '0', searchTime: 0 }
      }

    } catch (error) {
      // Google Search Service error occurred
      throw error
    }
  }

  private static sanitizeQuery(query: string): string {
    return query
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML
      .substring(0, 200) // Limit length
  }
}