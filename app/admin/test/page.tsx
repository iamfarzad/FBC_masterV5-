"use client"

import { useState } from 'react'

export default function BackendTestingPage() {
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApi = async (endpoint: string, method = 'GET', body?: any) => {
    setLoading(true)
    setError(null)
    setApiResponse(null)

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(endpoint, options)
      const data = await response.json()
      setApiResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const apiEndpoints = [
    { name: 'Health Check', endpoint: '/api/health', method: 'GET' },
    { name: 'Chat API', endpoint: '/api/chat', method: 'POST', body: { messages: [{ role: 'user', content: 'test' }] } },
    { name: 'Intelligence Context', endpoint: '/api/intelligence/context', method: 'GET' },
    { name: 'Admin Stats', endpoint: '/api/admin/stats', method: 'GET' },
    { name: 'Tools - Webcam', endpoint: '/api/tools/webcam', method: 'GET' },
    { name: 'Tools - Screen', endpoint: '/api/tools/screen', method: 'GET' },
    { name: 'Tools - ROI', endpoint: '/api/tools/roi', method: 'POST', body: { investment: 1000, revenue: 5000, months: 12 } },
    { name: 'Tools - URL', endpoint: '/api/tools/url', method: 'POST', body: { url: 'https://example.com' } },
    { name: 'Tools - Translation', endpoint: '/api/tools/translation', method: 'POST', body: { text: 'Hello', targetLang: 'es' } },
    { name: 'Workshop Modules', endpoint: '/api/workshop/modules', method: 'GET' },
    { name: 'Lead Capture', endpoint: '/api/lead-capture', method: 'POST', body: { email: 'test@test.com', name: 'Test User' } },
    { name: 'Feature Flags', endpoint: '/api/feature-flags', method: 'GET' },
    { name: 'Consent Check', endpoint: '/api/consent', method: 'GET' },
    { name: 'Business Content', endpoint: '/api/business-content', method: 'GET' },
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Backend Testing Interface</h1>
          <p className="text-muted-foreground">Test all API endpoints and backend functionality</p>
          <div className="mt-4 flex gap-4">
            <a href="/" className="text-primary hover:underline">← Back to Home</a>
            <a href="/admin" className="text-primary hover:underline">Admin Dashboard</a>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Click any button to test the backend endpoint. Results will appear below.
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              {apiEndpoints.map((api) => (
                <button
                  key={api.name}
                  onClick={() => testApi(api.endpoint, api.method, api.body)}
                  disabled={loading}
                  className="text-left p-4 rounded-lg border bg-card hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded font-mono ${
                      api.method === 'GET' ? 'bg-blue-500/20 text-blue-700' :
                      api.method === 'POST' ? 'bg-green-500/20 text-green-700' :
                      'bg-gray-500/20 text-gray-700'
                    }`}>
                      {api.method}
                    </span>
                    <span className="font-medium">{api.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 font-mono">
                    {api.endpoint}
                  </div>
                  {api.body && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Body: {JSON.stringify(api.body, null, 2)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Navigation</h2>
            <div className="grid gap-2 md:grid-cols-2">
              <a href="/chat" className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                💬 Go to Chat Interface
              </a>
              <a href="/workshop" className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                🎓 Go to Workshop
              </a>
              <a href="/admin" className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                ⚙️ Admin Dashboard
              </a>
              <a href="/test-engine" className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                🔧 Test AI Engine
              </a>
              <a href="/live" className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                🔴 LIVE Real-Time Streaming
              </a>
              <a href="/multimodal-test" className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                🧪 Multimodal Test
              </a>
              <a href="/voice-test" className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                🎤 Voice Test
              </a>
              <a href="/gemini-live" className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                🚀 Gemini Live
              </a>
            </div>
          </div>

          {/* Results Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>

            {loading && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Loading...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg border bg-destructive/10 text-destructive">
                <strong>Error:</strong> {error}
              </div>
            )}

            {apiResponse && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-card">
                  <strong className="text-green-600">Success!</strong>
                  <div className="text-sm text-muted-foreground mt-2">Response received from API endpoint</div>
                </div>
                <div className="p-4 rounded-lg border bg-muted">
                  <h3 className="font-semibold mb-3">API Response:</h3>
                  <pre className="text-xs bg-background p-3 rounded overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
