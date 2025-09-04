"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from '@/src/core/utils'

const modelData = [
  { year: 2018, name: "BERT", parameters: 0.345, description: "Bidirectional Encoder Representations from Transformers", achievements: "Bidirectional context", color: "bg-info/70", architecture: { layers: 24, hiddenSize: 1024, attentionHeads: 16, type: "Encoder-only" } },
  { year: 2019, name: "GPT-2", parameters: 1.5, description: "Generative Pre-trained Transformer 2", achievements: "Coherent paragraphs", color: "bg-purple-500/70", architecture: { layers: 48, hiddenSize: 1600, attentionHeads: 25, type: "Decoder-only" } },
  { year: 2020, name: "GPT-3", parameters: 175, description: "Emergent few-shot learning", achievements: "Few-shot abilities", color: "bg-info/70", architecture: { layers: 96, hiddenSize: 12288, attentionHeads: 96, type: "Decoder-only" } },
  { year: 2021, name: "Gopher", parameters: 280, description: "DeepMind LLM", achievements: "Knowledge tasks", color: "bg-purple-500/70", architecture: { layers: 80, hiddenSize: 16384, attentionHeads: 128, type: "Decoder-only" } },
  { year: 2022, name: "PaLM", parameters: 540, description: "Pathways Language Model", achievements: "Reasoning across languages", color: "bg-info/70", architecture: { layers: 118, hiddenSize: 18432, attentionHeads: 144, type: "Decoder-only" } },
  { year: 2022, name: "Chinchilla", parameters: 70, description: "Compute-optimal training", achievements: "Smaller but better trained", color: "bg-purple-500/70", architecture: { layers: 80, hiddenSize: 8192, attentionHeads: 64, type: "Decoder-only" } },
  { year: 2023, name: "GPT-4", parameters: 1000, description: "Multimodal", achievements: "Human-level performance", color: "bg-info/70", architecture: { layers: 120, hiddenSize: 24576, attentionHeads: 192, type: "Decoder-only" } },
]

export default function LLMParameterGrowth() {
  const [yearIndex, setYearIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedModel, setSelectedModel] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("size")
  const animationRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const currentYear = modelData[yearIndex]?.year
  const visibleModels = modelData.filter((m) => m.year <= currentYear)
  const selectedModelData = selectedModel !== null ? visibleModels[selectedModel] : null;

  useEffect(() => {
    if (!isPlaying) return
    const startTime = Date.now(); const startIndex = yearIndex
    const animate = () => {
      const elapsed = Date.now() - startTime
      const duration = 5000
      const progress = Math.min(elapsed / duration, 1)
      const idx = Math.min(startIndex + Math.floor(progress * (modelData.length - startIndex)), modelData.length - 1)
      setYearIndex(idx)
      if (progress < 1) animationRef.current = requestAnimationFrame(animate)
      else setIsPlaying(false)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [isPlaying, yearIndex])

  useEffect(() => {
    if (activeTab !== "architecture" || !canvasRef.current || selectedModel === null) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d"); if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const width = canvas.width, height = canvas.height, padding = 50
    const inputNodes = 5, hiddenLayers = 3, hiddenNodes = 7, outputNodes = 5
    const nodeRadius = 8, layerSpacing = 150
    const drawNode = (x: number, y: number, color: string) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, nodeRadius, 0, Math.PI * 2); ctx.fill() }
    // input
    const inputX = padding, inputY = height / 2
    for (let i = 0; i < inputNodes; i++) { const y = inputY - ((inputNodes - 1) / 2 - i) * 40; drawNode(inputX, y, "var(--success)") }
    // hidden
    for (let layer = 0; layer < hiddenLayers; layer++) {
      const x = padding + layerSpacing * (layer + 1)
      for (let i = 0; i < hiddenNodes; i++) {
        const y = height / 2 - ((hiddenNodes - 1) / 2 - i) * 30
        ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.lineWidth = 0.5
        if (layer === 0) { for (let j = 0; j < inputNodes; j++) { const prevY = inputY - ((inputNodes - 1) / 2 - j) * 40; ctx.beginPath(); ctx.moveTo(inputX + nodeRadius, prevY); ctx.lineTo(x - nodeRadius, y); ctx.stroke() } }
        else { for (let j = 0; j < hiddenNodes; j++) { const prevY = height / 2 - ((hiddenNodes - 1) / 2 - j) * 30; const prevX = padding + layerSpacing * layer; ctx.beginPath(); ctx.moveTo(prevX + nodeRadius, prevY); ctx.lineTo(x - nodeRadius, y); ctx.stroke() } }
        drawNode(x, y, "var(--info)")
      }
    }
    // output
    const outputX = width - padding
    for (let i = 0; i < outputNodes; i++) {
      const y = height / 2 - ((outputNodes - 1) / 2 - i) * 40
      const prevX = padding + layerSpacing * hiddenLayers
      ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.lineWidth = 0.5
      for (let j = 0; j < hiddenNodes; j++) { const prevY = height / 2 - ((hiddenNodes - 1) / 2 - j) * 30; ctx.beginPath(); ctx.moveTo(prevX + nodeRadius, prevY); ctx.lineTo(outputX - nodeRadius, y); ctx.stroke() }
      drawNode(outputX, y, "var(--warning)")
    }
  }, [activeTab, canvasRef, selectedModel, visibleModels])

  const maxParameters = Math.max(...modelData.map((m) => (typeof m.parameters === 'number' ? m.parameters : 0)))

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col items-center justify-center">
        <motion.div className="mb-8 w-full max-w-3xl text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="mb-4 text-3xl font-bold">LLM Parameter Growth</h2>
          <p className="text-xl text-muted-foreground">Explore how language models have grown in size and capability over time</p>
        </motion.div>
        <div className="w-full max-w-5xl">
          <Tabs defaultValue="size" value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-6 flex justify-center"><TabsList className="grid w-full max-w-md grid-cols-2"><TabsTrigger value="size">Size Evolution</TabsTrigger><TabsTrigger value="architecture">Neural Architecture</TabsTrigger></TabsList></div>
            <TabsContent value="size">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <motion.div className="h-full rounded-xl border bg-card p-6 shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <div className="mb-6 flex items-center justify-between"><h3 className="text-xl font-medium">Model Size Evolution</h3><div className="text-2xl font-bold">{currentYear}</div></div>
                    <div className="relative mb-6 h-[400px]">
                      <div className="absolute inset-y-0 left-0 flex w-12 flex-col justify-between text-xs text-muted-foreground"><span>1000B</span><span>100B</span><span>10B</span><span>1B</span><span>0.1B</span></div>
                      <div className="absolute inset-0 ml-12 flex items-end justify-around">
                        {visibleModels.map((model, index) => {
                          const heightPct = typeof model.parameters === 'number' ? Math.max(5, Math.min(95, 10 + 20 * Math.log10(model.parameters))) : 10
                          const isSelected = selectedModel === index
                          return (
                            <motion.div key={`${model.year}-${model.name}`} className="flex flex-col items-center" initial={{ opacity: 0, height: 0 }} animate={{ opacity: selectedModel === null || isSelected ? 1 : 0.4, height: `${heightPct}%`, scale: isSelected ? 1.05 : 1 }} whileHover={{ scale: isSelected ? 1.05 : 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.3, delay: index * 0.1 }} onClick={() => setSelectedModel(isSelected ? null : index)} role="button" aria-pressed={isSelected} aria-label={`Select ${model.name} (${model.year})`}>
                              <div className="mb-1 whitespace-nowrap text-center text-xs">{typeof model.parameters === 'number' ? `${model.parameters}B` : model.parameters}</div>
                              <div className={cn("w-12 rounded-t-lg cursor-pointer transition-all", model.color, isSelected ? "ring-2 ring-primary ring-offset-2" : "")} style={{ height: '100%' }} />
                              <div className="mt-2 origin-left rotate-45 whitespace-nowrap text-xs font-medium">{model.name}</div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="space-y-4">
                                            <div className="space-y-1"><Slider value={[yearIndex]} min={0} max={modelData.length - 1} step={1} onValueChange={(v) => { setYearIndex(v[0]!); setIsPlaying(false) }} /><div className="flex justify-between text-xs text-muted-foreground"><span>2018</span><span>2024</span></div></div>
                      <div className="flex justify-center gap-2">
                        <Button variant={isPlaying ? 'default' : 'outline'} size="sm" onClick={() => { if (isPlaying) setIsPlaying(false); else { if (yearIndex >= modelData.length - 1) setYearIndex(0); setIsPlaying(true) } }}>{isPlaying ? 'Pause' : 'Play Animation'}</Button>
                        <Button variant="outline" size="sm" onClick={() => { setIsPlaying(false); setYearIndex(0); setSelectedModel(null) }}>Reset</Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <div className="h-full rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-medium">Model Details</h3>
                    <AnimatePresence mode="wait">
                      {selectedModelData ? (
                        <motion.div key={`details-${selectedModel}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-4">
                          <div className={cn("w-full h-2 rounded-full", selectedModelData.color)} />
                          <div><h4 className="text-lg font-bold">{selectedModelData.name} ({selectedModelData.year})</h4><p className="text-sm text-muted-foreground">{selectedModelData.description}</p></div>
                          <div><div className="text-sm font-medium">Parameters</div><div className="text-2xl font-bold">{typeof selectedModelData.parameters === 'number' ? `${selectedModelData.parameters} billion` : selectedModelData.parameters}</div></div>
                        </motion.div>
                      ) : (
                        <motion.div key="no-selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                          <p className="py-8 text-center text-muted-foreground">Click on a model bar to see details</p>
                          <div><h4 className="font-medium">Current Year: {currentYear}</h4></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
            <TabsContent value="architecture">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <motion.div className="h-full rounded-xl border bg-card p-6 shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <div className="mb-6 flex items-center justify-between"><h3 className="text-xl font-medium">Neural Network Architecture</h3><div className="text-sm text-muted-foreground">{selectedModelData ? `${selectedModelData.name} (${selectedModelData.year})` : 'Select a model to view architecture'}</div></div>
                    <div className="bg-muted/30 relative mb-6 h-[400px] overflow-hidden rounded-lg">{selectedModel === null ? (<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Click a model in Size Evolution</div>) : (<canvas ref={canvasRef} width={800} height={400} className="size-full" />)}</div>
                  </motion.div>
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <div className="h-full rounded-xl border bg-card p-6 shadow-sm"><h3 className="mb-4 text-xl font-medium">Architectural Notes</h3><p className="text-sm text-muted-foreground">Transformer models combine self-attention with feed-forward layers. Components include input embeddings, attention heads, and normalization.</p></div>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}


