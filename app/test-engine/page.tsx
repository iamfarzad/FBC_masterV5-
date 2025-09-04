'use client'

import { useState } from 'react'

export default function TestEngine() {
  const [testResults, setTestResults] = useState<{[key: string]: any}>({})
  const [loading, setLoading] = useState(false)
  const [currentTest, setCurrentTest] = useState('')

  // Test 1: Basic AI Provider Connection
  const testAIProvider = async () => {
    setCurrentTest('AI Provider')
    setLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ 
            role: 'user', 
            content: 'Test message: What is 2+2? Reply with just the number.' 
          }]
        })
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              fullResponse += line.slice(6)
            }
          }
        }
      }

      const result = {
        status: response.status === 200 ? '✅ Connected' : '❌ Failed',
        response: fullResponse || 'No response',
        usingRealAPI: !fullResponse.includes('mock response'),
        timestamp: new Date().toISOString()
      }

      setTestResults(prev => ({ ...prev, aiProvider: result }))
      return result
    } catch (error) {
      const result = {
        status: '❌ Error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
      setTestResults(prev => ({ ...prev, aiProvider: result }))
      return result
    } finally {
      setLoading(false)
      setCurrentTest('')
    }
  }

  // Test 2: Intelligence Service Connection
  const testIntelligenceService = async () => {
    setCurrentTest('Intelligence Service')
    setLoading(true)
    
    try {
      const response = await fetch('/api/intelligence/session-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `test-${Date.now()}`,
          email: 'test@example.com',
          name: 'Test User'
        })
      })

      const data = await response.json()
      
      const result = {
        status: response.status === 200 ? '✅ Connected' : '❌ Failed',
        context: data.context || null,
        capabilities: data.context?.capabilities || [],
        timestamp: new Date().toISOString()
      }

      setTestResults(prev => ({ ...prev, intelligence: result }))
      return result
    } catch (error) {
      const result = {
        status: '❌ Error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
      setTestResults(prev => ({ ...prev, intelligence: result }))
      return result
    } finally {
      setLoading(false)
      setCurrentTest('')
    }
  }

  // Test 3: WebRTC Audio Connection
  const testWebRTCAudio = async () => {
    setCurrentTest('WebRTC Audio')
    setLoading(true)
    
    try {
      // Test if we can access media devices
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      })
      
      // Stop the stream immediately
      stream.getTracks().forEach(track => track.stop())
      
      const result = {
        status: '✅ Media Access Granted',
        audioTracks: stream.getAudioTracks().length,
        capabilities: 'Echo cancellation, noise suppression enabled',
        timestamp: new Date().toISOString()
      }

      setTestResults(prev => ({ ...prev, webrtc: result }))
      return result
    } catch (error) {
      const result = {
        status: '❌ Media Access Denied',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
      setTestResults(prev => ({ ...prev, webrtc: result }))
      return result
    } finally {
      setLoading(false)
      setCurrentTest('')
    }
  }

  // Test 4: Lead Research & Grounding
  const testLeadResearch = async () => {
    setCurrentTest('Lead Research')
    setLoading(true)
    
    try {
      const response = await fetch('/api/intelligence/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@google.com',
          name: 'Test User',
          companyUrl: 'google.com'
        })
      })

      const data = await response.json()
      
      const result = {
        status: response.status === 200 ? '✅ Research Complete' : '❌ Failed',
        company: data.company || null,
        person: data.person || null,
        role: data.role || 'Unknown',
        timestamp: new Date().toISOString()
      }

      setTestResults(prev => ({ ...prev, research: result }))
      return result
    } catch (error) {
      const result = {
        status: '❌ Error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
      setTestResults(prev => ({ ...prev, research: result }))
      return result
    } finally {
      setLoading(false)
      setCurrentTest('')
    }
  }

  // Test 5: Vision API
  const testVisionAPI = async () => {
    setCurrentTest('Vision API')
    setLoading(true)
    
    try {
      // Create a test image (red square)
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'red'
        ctx.fillRect(0, 0, 100, 100)
      }
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg')
      })
      
      const formData = new FormData()
      formData.append('image', blob, 'test.jpg')
      formData.append('prompt', 'What color is this square?')
      
      const response = await fetch('/api/tools/webcam/capture', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      const result = {
        status: response.status === 200 ? '✅ Vision Working' : '❌ Failed',
        analysis: data.analysis || 'No analysis',
        timestamp: new Date().toISOString()
      }

      setTestResults(prev => ({ ...prev, vision: result }))
      return result
    } catch (error) {
      const result = {
        status: '❌ Error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
      setTestResults(prev => ({ ...prev, vision: result }))
      return result
    } finally {
      setLoading(false)
      setCurrentTest('')
    }
  }

  // Run all tests sequentially
  const runAllTests = async () => {
    setTestResults({})
    await testAIProvider()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testIntelligenceService()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testWebRTCAudio()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testLeadResearch()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testVisionAPI()
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🔧 AI Engine Test Suite</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => window.location.href = '/'} style={{ marginRight: '10px' }}>
          ← Back
        </button>
      </div>

      <div style={{ 
        background: '#f0f7ff', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Test Your AI Engine Components</h3>
        <p>Click each test to verify the component works, or run all tests sequentially.</p>
        
        {currentTest && (
          <div style={{ marginTop: '10px', color: '#1976d2' }}>
            ⏳ Testing: {currentTest}...
          </div>
        )}
      </div>

      {/* Individual Test Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testAIProvider}
          disabled={loading}
          style={{
            padding: '15px',
            background: testResults.aiProvider?.status?.includes('✅') ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          1. Test AI Provider
        </button>

        <button 
          onClick={testIntelligenceService}
          disabled={loading}
          style={{
            padding: '15px',
            background: testResults.intelligence?.status?.includes('✅') ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          2. Test Intelligence
        </button>

        <button 
          onClick={testWebRTCAudio}
          disabled={loading}
          style={{
            padding: '15px',
            background: testResults.webrtc?.status?.includes('✅') ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          3. Test WebRTC Audio
        </button>

        <button 
          onClick={testLeadResearch}
          disabled={loading}
          style={{
            padding: '15px',
            background: testResults.research?.status?.includes('✅') ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          4. Test Lead Research
        </button>

        <button 
          onClick={testVisionAPI}
          disabled={loading}
          style={{
            padding: '15px',
            background: testResults.vision?.status?.includes('✅') ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          5. Test Vision API
        </button>

        <button 
          onClick={runAllTests}
          disabled={loading}
          style={{
            padding: '15px',
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          🚀 Run All Tests
        </button>
      </div>

      {/* Test Results */}
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h3>Test Results</h3>
        
        {Object.keys(testResults).length === 0 ? (
          <p style={{ color: '#666' }}>No tests run yet. Click a test button above to start.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {Object.entries(testResults).map(([key, result]) => (
              <div 
                key={key} 
                style={{ 
                  background: 'white', 
                  padding: '15px', 
                  borderRadius: '8px',
                  borderLeft: `4px solid ${result.status?.includes('✅') ? '#4CAF50' : '#f44336'}`
                }}
              >
                <h4 style={{ marginTop: 0, textTransform: 'capitalize' }}>{key}</h4>
                <pre style={{ 
                  fontSize: '12px', 
                  overflow: 'auto',
                  background: '#f9f9f9',
                  padding: '10px',
                  borderRadius: '4px'
                }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Status */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '8px' }}>
        <h3>System Components</h3>
        <ul style={{ fontSize: '14px' }}>
          <li>AI Provider: {process.env.NEXT_PUBLIC_GEMINI_API_KEY ? '🔑 Key configured' : '⚠️ No API key'}</li>
          <li>Chat API: /api/chat</li>
          <li>Intelligence: /api/intelligence/*</li>
          <li>Vision: /api/tools/webcam/capture</li>
          <li>WebRTC: Browser MediaDevices API</li>
        </ul>
      </div>
    </div>
  )
}