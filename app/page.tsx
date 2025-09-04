"use client"

import { useState } from 'react'

export default function HomePage() {
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
    <div>
      <h2>API Backend Testing Interface</h2>
      <p>Click any button to test the backend endpoint:</p>
      
      <div style={{ display: 'grid', gap: '10px', margin: '20px 0' }}>
        {apiEndpoints.map((api) => (
          <button
            key={api.name}
            onClick={() => testApi(api.endpoint, api.method, api.body)}
            disabled={loading}
            style={{ textAlign: 'left' }}
          >
            [{api.method}] {api.name}: {api.endpoint}
          </button>
        ))}
      </div>

      <hr />

      <h3>Navigation</h3>
      <div>
        <a href="/chat" style={{ marginRight: '10px' }}>Go to Chat</a>
        <a href="/workshop" style={{ marginRight: '10px' }}>Go to Workshop</a>
        <a href="/admin" style={{ marginRight: '10px' }}>Go to Admin</a>
        <a href="/voice-test" style={{ marginRight: '10px' }}>🎤 Voice Test (Simple)</a>
        <a href="/gemini-live">🚀 Gemini Live (Full Multimodal)</a>
      </div>

      <hr />

      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}
      {apiResponse && (
        <div>
          <h3>API Response:</h3>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}