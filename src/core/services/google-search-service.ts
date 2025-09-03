export interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
}

export class GoogleSearchService {
  private apiKey: string | undefined
  private searchEngineId: string | undefined

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID
  }

  async search(query: string, numResults: number = 5): Promise<GoogleSearchResult[]> {
    if (!this.apiKey || !this.searchEngineId) {
      console.log('Google Search not configured, returning mock results')
      return this.getMockResults(query)
    }

    try {
      const url = new URL('https://www.googleapis.com/customsearch/v1')
      url.searchParams.append('key', this.apiKey)
      url.searchParams.append('cx', this.searchEngineId)
      url.searchParams.append('q', query)
      url.searchParams.append('num', numResults.toString())

      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      return data.items?.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet
      })) || []
    } catch (error) {
      console.error('Google Search error:', error)
      return this.getMockResults(query)
    }
  }

  private getMockResults(query: string): GoogleSearchResult[] {
    return [
      {
        title: `Result for: ${query}`,
        link: 'https://example.com',
        snippet: 'This is a mock search result for development purposes.'
      }
    ]
  }
}

export const googleSearchService = new GoogleSearchService()