'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function EmbeddingExplorer() {
  const [word, setWord] = useState('')
  const [embedding, setEmbedding] = useState<number[]>([])
  const [similarWords, setSimilarWords] = useState<string[]>([])

  const generateEmbedding = () => {
    if (!word) return
    
    // Generate mock embedding vector
    const vector = Array.from({ length: 8 }, () => 
      (Math.random() * 2 - 1).toFixed(3)
    ).map(Number)
    
    setEmbedding(vector)
    
    // Generate similar words based on mock logic
    const wordBank = {
      'cat': ['kitten', 'feline', 'pet', 'animal'],
      'dog': ['puppy', 'canine', 'pet', 'animal'],
      'computer': ['laptop', 'PC', 'machine', 'device'],
      'happy': ['joyful', 'glad', 'cheerful', 'pleased'],
      'default': ['similar1', 'similar2', 'similar3']
    }
    
    const similar = wordBank[word.toLowerCase()] || wordBank.default
    setSimilarWords(similar)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Word Embedding Explorer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter a word..."
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
          <Button onClick={generateEmbedding} disabled={!word}>
            Explore
          </Button>
        </div>

        {embedding.length > 0 && (
          <>
            <div>
              <p className="mb-2 text-sm font-medium">Embedding Vector (8D):</p>
              <div className="rounded-lg bg-muted p-3 font-mono text-xs">
                [{embedding.join(', ')}]
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Similar Words:</p>
              <div className="flex flex-wrap gap-2">
                {similarWords.map((w, i) => (
                  <Badge key={i} variant="outline">
                    {w}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Vector Visualization:</p>
              <div className="grid grid-cols-4 gap-2">
                {embedding.map((val, i) => (
                  <div key={i} className="text-center">
                    <div 
                      className="mx-auto h-16 w-4 rounded bg-primary/20"
                      style={{
                        background: `linear-gradient(to ${val > 0 ? 'top' : 'bottom'}, 
                          transparent 0%, 
                          hsl(var(--primary)) ${Math.abs(val) * 100}%)`
                      }}
                    />
                    <span className="text-xs">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}