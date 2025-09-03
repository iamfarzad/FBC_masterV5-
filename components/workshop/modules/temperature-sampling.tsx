'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function TemperatureSamplingControls() {
  const [temperature, setTemperature] = useState([0.7])
  const [topP, setTopP] = useState([0.9])
  const [outputs, setOutputs] = useState<string[]>([])

  const generateSamples = () => {
    const baseWords = ['innovative', 'creative', 'interesting', 'unique', 'novel']
    const conservativeWords = ['good', 'nice', 'fine', 'okay', 'decent']
    const wildWords = ['revolutionary', 'groundbreaking', 'phenomenal', 'extraordinary', 'spectacular']
    
    const samples: string[] = []
    const temp = temperature[0]
    
    for (let i = 0; i < 3; i++) {
      let wordPool: string[]
      
      if (temp < 0.3) {
        wordPool = conservativeWords
      } else if (temp > 0.8) {
        wordPool = wildWords
      } else {
        wordPool = baseWords
      }
      
      // Add randomness based on temperature
      const randomIndex = Math.floor(Math.random() * wordPool.length * (1 + temp))
      const word = wordPool[Math.min(randomIndex, wordPool.length - 1)]
      
      samples.push(`This is ${word} output ${i + 1}`)
    }
    
    setOutputs(samples)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature & Sampling Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="mb-2 flex justify-between">
            <label className="text-sm font-medium">Temperature</label>
            <span className="text-sm text-muted-foreground">{temperature[0]}</span>
          </div>
          <Slider
            value={temperature}
            onValueChange={setTemperature}
            min={0}
            max={1}
            step={0.1}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Lower = More focused, Higher = More creative
          </p>
        </div>

        <div>
          <div className="mb-2 flex justify-between">
            <label className="text-sm font-medium">Top-P (Nucleus Sampling)</label>
            <span className="text-sm text-muted-foreground">{topP[0]}</span>
          </div>
          <Slider
            value={topP}
            onValueChange={setTopP}
            min={0}
            max={1}
            step={0.1}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Cumulative probability threshold
          </p>
        </div>

        <Button onClick={generateSamples}>
          Generate Sample Outputs
        </Button>

        {outputs.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Generated Samples:</p>
            <div className="space-y-2">
              {outputs.map((output, i) => (
                <div key={i} className="rounded-lg bg-muted p-3">
                  {output}
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Badge variant={temperature[0] < 0.3 ? 'default' : 'outline'}>
                Conservative
              </Badge>
              <Badge variant={temperature[0] >= 0.3 && temperature[0] <= 0.7 ? 'default' : 'outline'}>
                Balanced
              </Badge>
              <Badge variant={temperature[0] > 0.7 ? 'default' : 'outline'}>
                Creative
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}