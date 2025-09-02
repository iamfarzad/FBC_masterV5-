"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

export default function TemperatureSamplingControls() {
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(1)
  const [topK, setTopK] = useState(40)
  const [isGenerating, setIsGenerating] = useState(false)
  const [output, setOutput] = useState('The quick brown fox jumps over the lazy dog.')

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const base = 'The quick brown fox jumps over the lazy dog.'
      const noisy = temperature > 0.9 ? 'The nimble azure fox vaults past the languid hound.' : base
      setOutput(noisy)
      setIsGenerating(false)
    }, 800)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <motion.div className="mb-8 w-full max-w-4xl text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="mb-4 text-3xl font-bold">Temperature & Sampling</h2>
          <p className="text-xl text-muted-foreground">Explore how decoding settings affect generation</p>
        </motion.div>
        <div className="w-full max-w-3xl space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Temperature</span><span>{temperature.toFixed(2)}</span></div>
            <Slider value={[temperature]} min={0} max={1.5} step={0.05} onValueChange={(v) => setTemperature(v[0])} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Top‑p</span><span>{topP.toFixed(2)}</span></div>
            <Slider value={[topP]} min={0.1} max={1} step={0.05} onValueChange={(v) => setTopP(v[0])} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Top‑k</span><span>{topK}</span></div>
            <Slider value={[topK]} min={0} max={100} step={5} onValueChange={(v) => setTopK(v[0])} />
          </div>
          <div className="space-y-2">
            <div className={`bg-muted/30 min-h-[120px] whitespace-pre-wrap rounded-md p-4 ${isGenerating ? 'animate-pulse' : ''}`}>{output}</div>
            <Button onClick={handleGenerate} className="w-full" disabled={isGenerating}>{isGenerating ? 'Generating…' : 'Generate Sample'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}


