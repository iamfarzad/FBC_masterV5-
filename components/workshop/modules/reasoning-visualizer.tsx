"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function ReasoningVisualizer() {
  const steps = [
    'Restate the problem in own words',
    'Identify knowns and unknowns',
    'Plan sub-steps',
    'Execute computation or lookup',
    'Check and summarize answer'
  ]
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => { setIsPlaying(true); const t = setInterval(() => setIndex((i) => { if (i >= steps.length - 1) { clearInterval(t); setIsPlaying(false); return i } return i + 1 }), 700) }
  const handlePause = () => setIsPlaying(false)
  const handleReset = () => { setIsPlaying(false); setIndex(0) }
  const handleSkip = () => setIndex((i) => Math.min(steps.length - 1, i + 1))

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <motion.div className="mb-8 w-full max-w-4xl text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="mb-4 text-3xl font-bold">Reasoning Visualizer</h2>
          <p className="text-xl text-muted-foreground">Step through a simple reasoning chain</p>
        </motion.div>
        <div className="w-full max-w-xl rounded-xl border bg-card p-6 shadow-sm">
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s} className={`rounded border p-3 ${i === index ? 'bg-primary/10 border-primary' : 'bg-muted/20'}`}>{i + 1}. {s}</li>
            ))}
          </ol>
          <div className="mt-6 flex justify-center gap-2">
            <Button size="sm" onClick={handlePlay} disabled={isPlaying}>Play</Button>
            <Button size="sm" variant="outline" onClick={handlePause}>Pause</Button>
            <Button size="sm" variant="outline" onClick={handleSkip}>Skip</Button>
            <Button size="sm" variant="outline" onClick={handleReset}>Reset</Button>
          </div>
        </div>
      </div>
    </div>
  )
}


