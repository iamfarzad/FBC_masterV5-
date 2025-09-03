'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

export function AttentionMechanismDemo() {
  const [query, setQuery] = useState('')
  const [keys] = useState(['AI', 'machine', 'learning', 'neural', 'network'])
  const [attentionWeights, setAttentionWeights] = useState<number[]>([])

  const calculateAttention = () => {
    if (!query) return
    
    // Simulate attention weight calculation
    const weights = keys.map(key => {
      const similarity = query.toLowerCase().includes(key.toLowerCase()) 
        ? Math.random() * 0.5 + 0.5  // Higher weight for matching
        : Math.random() * 0.3        // Lower weight for non-matching
      return similarity
    })
    
    // Normalize weights
    const sum = weights.reduce((a, b) => a + b, 0)
    const normalized = weights.map(w => w / sum)
    
    setAttentionWeights(normalized)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attention Mechanism Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Query</label>
          <Input
            placeholder="Enter query text..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Button onClick={calculateAttention} disabled={!query}>
          Calculate Attention
        </Button>

        {attentionWeights.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Attention weights for each key:
            </p>
            {keys.map((key, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{key}</span>
                  <span>{(attentionWeights[index] * 100).toFixed(1)}%</span>
                </div>
                <Progress value={attentionWeights[index] * 100} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}