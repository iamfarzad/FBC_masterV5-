'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function TokenizationVisualizer() {
  const [text, setText] = useState('')
  const [tokens, setTokens] = useState<string[]>([])

  const tokenize = () => {
    // Simple tokenization for demonstration
    const words = text.split(/\s+/).filter(Boolean)
    const tokenized: string[] = []
    
    words.forEach(word => {
      // Split by punctuation
      const parts = word.match(/[\w]+|[^\w]/g) || []
      tokenized.push(...parts)
    })
    
    setTokens(tokenized)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokenization Visualizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter text to tokenize..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />
        
        <Button onClick={tokenize} disabled={!text}>
          Tokenize Text
        </Button>
        
        {tokens.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              Token count: {tokens.length}
            </p>
            <div className="flex flex-wrap gap-2">
              {tokens.map((token, index) => (
                <Badge key={index} variant="secondary">
                  {token}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}