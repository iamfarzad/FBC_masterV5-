"use client"

import { useState, useEffect } from 'react'

export default function WorkshopPage() {
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    fetch('/api/workshop/modules')
      .then(res => res.json())
      .then(data => {
        setModules(data.modules || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load modules:', err)
        setLoading(false)
      })
  }, [])

  const testModule = async (moduleId: string) => {
    setSelectedModule(moduleId)
    setTestResult(null)
    
    try {
      const response = await fetch(`/api/workshop/module/${moduleId}`)
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ error: 'Failed to load module' })
    }
  }

  return (
    <div>
      <h2>Workshop Module Testing</h2>
      <a href="/">← Back to Home</a>
      
      <h3>Available Modules</h3>
      {loading && <p>Loading modules...</p>}
      
      <div style={{ display: 'grid', gap: '10px', margin: '20px 0' }}>
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => testModule(module.id)}
            style={{ textAlign: 'left', background: selectedModule === module.id ? '#f0f0f0' : 'white' }}
          >
            {module.title || module.id} - {module.description || 'No description'}
          </button>
        ))}
      </div>

      {testResult && (
        <div>
          <h3>Module Test Result: {selectedModule}</h3>
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}

      <hr />
      
      <h3>Test Waitlist API</h3>
      <button onClick={() => {
        fetch('/api/workshop-waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', module: 'test-module' })
        })
        .then(res => res.json())
        .then(data => setTestResult(data))
      }}>
        Test Waitlist Submission
      </button>
    </div>
  )
}