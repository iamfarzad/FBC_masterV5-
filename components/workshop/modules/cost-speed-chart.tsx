"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

const modelData = [
  { name: 'GPT‑3.5 Turbo', parameters: 175, tokensPerSecond: 40, costPer1KTokens: 0.002, color: 'hsl(var(--brand))' },
  { name: 'GPT‑4', parameters: 1000, tokensPerSecond: 15, costPer1KTokens: 0.06, color: 'hsl(var(--brand-hover))' },
  { name: 'Claude 2', parameters: 137, tokensPerSecond: 20, costPer1KTokens: 0.008, color: 'hsl(var(--success))' },
  { name: 'Llama 2 (70B)', parameters: 70, tokensPerSecond: 30, costPer1KTokens: 0.001, color: 'hsl(var(--info))' },
  { name: 'Mistral 7B', parameters: 7, tokensPerSecond: 45, costPer1KTokens: 0.0005, color: 'hsl(var(--warning))' },
]

export default function CostSpeedChart() {
  const [selected, setSelected] = useState(['GPT‑3.5 Turbo', 'GPT‑4', 'Llama 2 (70B)'])
  const [inputTokens, setInputTokens] = useState(1000)
  const [outputTokens, setOutputTokens] = useState(500)

  const metrics = selected.map((name) => {
    const m = modelData.find((x) => x.name === name)
    if (!m) return null
    const totalTokens = inputTokens + outputTokens
    const time = outputTokens / m.tokensPerSecond
    const cost = (totalTokens * m.costPer1KTokens) / 1000
    return { ...m, time, cost }
  }).filter(Boolean) as Array<{ name: string; parameters: number; tokensPerSecond: number; costPer1KTokens: number; color: string; time: number; cost: number }>

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <motion.div className="mb-8 w-full max-w-4xl text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="mb-4 text-3xl font-bold">LLM Cost & Speed Comparison</h2>
          <p className="text-xl text-muted-foreground">Visualize tradeoffs between model size, speed, and cost</p>
        </motion.div>
        <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm lg:col-span-1">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Tokens: {inputTokens.toLocaleString()}</label>
              <Slider value={[inputTokens]} min={100} max={10000} step={100} onValueChange={(v) => setInputTokens(v[0]!)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Output Tokens: {outputTokens.toLocaleString()}</label>
              <Slider value={[outputTokens]} min={100} max={5000} step={100} onValueChange={(v) => setOutputTokens(v[0]!)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Models</label>
              <div className="space-y-2">
                {modelData.map((m) => (
                  <label key={m.name} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selected.includes(m.name)} onChange={(e) => setSelected(e.target.checked ? [...selected, m.name] : selected.filter((s) => s !== m.name))} />
                    <span className="inline-block size-3 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Comparison (approximate)</CardTitle><CardDescription>Input {inputTokens} • Output {outputTokens}</CardDescription></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b"><th className="py-2 text-left">Model</th><th className="py-2 text-right">Parameters</th><th className="py-2 text-right">Time (s)</th><th className="py-2 text-right">Cost ($)</th></tr></thead>
                    <tbody>
                      {metrics.map((m) => (
                        <tr key={m.name} className="border-b">
                          <td className="py-3"><div className="flex items-center"><span className="mr-2 inline-block size-3 rounded-full" style={{ backgroundColor: m.color }} />{m.name}</div></td>
                          <td className="py-3 text-right">{m.parameters}B</td>
                          <td className="py-3 text-right">{m.time.toFixed(2)}</td>
                          <td className="py-3 text-right">{m.cost.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


